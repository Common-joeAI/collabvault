import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ challengeId: string }> }) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { challengeId } = await params
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })

  if (!challenge || (challenge.artistAId !== user.id && challenge.artistBId !== user.id)) {
    return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 })
  }

  if (challenge.status !== 'active') {
    return NextResponse.json({ error: 'This challenge is already closed.' }, { status: 400 })
  }

  const body = await req.json()
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const link = typeof body.link === 'string' ? body.link.trim() : ''
  const notes = typeof body.notes === 'string' ? body.notes.trim() : null

  if (!title || !link) {
    return NextResponse.json({ error: 'Title and track link are required.' }, { status: 400 })
  }

  const record = await prisma.collabSubmission.create({
    data: {
      challengeId,
      uploaderId: user.id,
      title,
      audioUrl: link,
      notes,
    },
  })

  await prisma.challenge.update({
    where: { id: challengeId },
    data: { status: 'completed', completedAt: new Date() },
  })

  return NextResponse.json(record)
}
