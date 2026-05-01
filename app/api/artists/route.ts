import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const artists = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, displayName: true, bio: true,
      avatarUrl: true, discordHandle: true,
      genres: true, themes: true, createdAt: true,
    },
  })
  return NextResponse.json(artists)
}
