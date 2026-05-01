import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> },
) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { submissionId } = await params
  const submission = await prisma.collabSubmission.findUnique({ where: { id: submissionId } })
  if (!submission) return NextResponse.json({ error: 'Collab not found.' }, { status: 404 })

  const existing = await prisma.collabReaction.findUnique({
    where: { submissionId_userId_type: { submissionId, userId: user.id, type: 'like' } },
  })

  if (existing) {
    await prisma.collabReaction.delete({ where: { id: existing.id } })
  } else {
    await prisma.collabReaction.create({ data: { submissionId, userId: user.id, type: 'like' } })
  }

  const count = await prisma.collabReaction.count({ where: { submissionId, type: 'like' } })
  return NextResponse.json({ liked: !existing, count })
}
