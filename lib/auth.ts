import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

export const SESSION_COOKIE = 'cv_token'
const SESSION_DAYS = 30

export type SafeUser = {
  id: string
  email: string
  displayName: string
  bio: string | null
  avatarUrl: string | null
  discordHandle: string
  genres: string
  themes: string
  isAdmin: boolean
  createdAt: Date
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}

export function publicUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash: _passwordHash, ...safe } = user
  return safe
}

export function sessionExpiresAt() {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  }
}

export async function createSession(userId: string) {
  const token = crypto.randomUUID()
  const expiresAt = sessionExpiresAt()

  await prisma.session.create({
    data: { userId, token, expiresAt },
  })

  return { token, expiresAt }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session) return null

  if (session.expiresAt < new Date()) {
    await prisma.session.deleteMany({ where: { token } })
    return null
  }

  return session.user
}

export async function requireUser() {
  const user = await getSession()
  if (!user) redirect('/login')
  return user
}

export async function clearCurrentSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) await prisma.session.deleteMany({ where: { token } })
}
