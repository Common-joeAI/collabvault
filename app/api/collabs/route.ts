import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const collabs = await prisma.collabSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      uploader: { select: { displayName: true, discordHandle: true } },
      challenge: {
        include: {
          artistA: { select: { displayName: true, discordHandle: true } },
          artistB: { select: { displayName: true, discordHandle: true } },
        },
      },
    },
  })

  return NextResponse.json(collabs)
}
