import { cookies } from 'next/headers'
import { prisma } from './db'

export async function getSession() {
  let token: string | undefined

  try {
    // Try Authorization: Bearer <token> header (localStorage flow)
    // Only available in dynamic routes, not static generation
    const { headers } = await import('next/headers')
    const headerStore = await headers()
    const auth = headerStore.get('authorization')
    if (auth?.startsWith('Bearer ')) {
      token = auth.slice(7)
    }
  } catch {
    // headers() not available during static generation — skip
  }

  // Fall back to cookie
  if (!token) {
    try {
      const cookieStore = await cookies()
      token = cookieStore.get('cv_token')?.value
    } catch {
      // cookies() not available during static generation — skip
    }
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
