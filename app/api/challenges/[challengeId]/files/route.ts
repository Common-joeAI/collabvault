import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

function canAccessChallenge(challenge: { artistAId: string; artistBId: string }, userId: string) {
  return challenge.artistAId === userId || challenge.artistBId === userId
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> },
) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { challengeId } = await params
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
  if (!challenge || !canAccessChallenge(challenge, user.id)) {
    return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 })
  }

  const files = await prisma.workspaceFile.findMany({
    where: { challengeId },
    orderBy: { createdAt: 'desc' },
    include: { uploader: { select: { displayName: true, discordHandle: true } } },
  })

  return NextResponse.json(files)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> },
) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { challengeId } = await params
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
  if (!challenge || !canAccessChallenge(challenge, user.id)) {
    return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 })
  }
  if (challenge.status !== 'active') {
    return NextResponse.json({ error: 'This workspace is closed.' }, { status: 400 })
  }

  const body = await req.json()
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const url = typeof body.url === 'string' ? body.url.trim() : ''
  const note = typeof body.note === 'string' ? body.note.trim() : null

  if (!title || !url) {
    return NextResponse.json({ error: 'Title and file link are required.' }, { status: 400 })
  }

  const file = await prisma.workspaceFile.create({
    data: { challengeId, uploaderId: user.id, title, url, note },
    include: { uploader: { select: { displayName: true, discordHandle: true } } },
  })

  return NextResponse.json(file)
}
