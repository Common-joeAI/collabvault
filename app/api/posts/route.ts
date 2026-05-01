import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { postToCollabsChannel } from '@/lib/discord'

export async function GET() {
  const posts = await prisma.collabPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { displayName: true, discordHandle: true, avatarUrl: true } } },
  })
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content, genre, lookingFor } = await req.json()
  if (!title || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const post = await prisma.collabPost.create({
    data: { userId: user.id, title, content, genre, lookingFor },
    include: { user: { select: { displayName: true, discordHandle: true, avatarUrl: true } } },
  })

  // Notify #collabs channel on Discord
  await postToCollabsChannel({
    title: `🎵 New Collab Post: ${title}`,
    description: content.slice(0, 300) + (content.length > 300 ? '...' : ''),
    color: 0x8b5cf6,
    fields: [
      ...(genre ? [{ name: 'Genre', value: genre, inline: true }] : []),
      ...(lookingFor ? [{ name: 'Looking For', value: lookingFor, inline: true }] : []),
      {
        name: 'Posted By',
        value: post.user.discordHandle
          ? `@${post.user.discordHandle}`
          : post.user.displayName ?? 'Unknown',
        inline: true,
      },
    ],
  })

  return NextResponse.json(post)
}
