import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const challenges = await prisma.challenge.findMany({
    where: { OR: [{ artistAId: user.id }, { artistBId: user.id }] },
    orderBy: { createdAt: 'desc' },
    include: {
      artistA: { select: { displayName: true, discordHandle: true } },
      artistB: { select: { displayName: true, discordHandle: true } },
    },
  })
  return NextResponse.json(challenges)
}
