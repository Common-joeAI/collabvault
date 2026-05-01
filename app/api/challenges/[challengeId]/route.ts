import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> },
) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { challengeId } = await params
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      artistA: { select: { id: true, displayName: true, discordHandle: true } },
      artistB: { select: { id: true, displayName: true, discordHandle: true } },
      submission: true,
    },
  })

  if (!challenge || (challenge.artistAId !== user.id && challenge.artistBId !== user.id)) {
    return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 })
  }

  return NextResponse.json(challenge)
}
