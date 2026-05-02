import { cookies, headers } from 'next/headers'
import { prisma } from './db'

export async function getSession() {
  let token: string | undefined

  // 1. Try Authorization: Bearer <token> header (localStorage flow)
  const headerStore = await headers()
  const auth = headerStore.get('authorization')
  if (auth?.startsWith('Bearer ')) {
    token = auth.slice(7)
  }

  // 2. Fall back to cookie
  if (!token) {
    const cookieStore = await cookies()
    token = cookieStore.get('cv_token')?.value
  }

  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!session) return null
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } })
    return null
  }
  return session.user
}
