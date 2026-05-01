import { cookies } from 'next/headers'
import { prisma } from './db'

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('cv_token')?.value
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
