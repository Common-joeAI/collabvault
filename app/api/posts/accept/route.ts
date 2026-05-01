import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { postToCollabsChannel } from '@/lib/discord'

// POST /api/posts/accept  { postId: string }
export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { postId } = await req.json()
  if (!postId) return NextResponse.json({ error: 'Missing postId' }, { status: 400 })

  const post = await prisma.collabPost.findUnique({
    where: { id: postId },
    include: { user: { select: { displayName: true, discordHandle: true } } },
  })

  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  if (post.userId === user.id)
    return NextResponse.json({ error: 'Cannot accept your own post' }, { status: 400 })

  // Notify #collabs channel on Discord
  await postToCollabsChannel({
    title: `🤝 Collab Request Accepted!`,
    description: `**${user.displayName ?? 'Someone'}** wants to collab on **"${post.title}"**`,
    color: 0x22c55e, // green
    fields: [
      {
        name: 'Original Post By',
        value: post.user.discordHandle
          ? `@${post.user.discordHandle}`
          : post.user.displayName ?? 'Unknown',
        inline: true,
      },
      {
        name: 'Accepted By',
        value: user.discordHandle ? `@${user.discordHandle}` : user.displayName ?? 'Unknown',
        inline: true,
      },
    ],
  })

  return NextResponse.json({ success: true, message: 'Collab accepted — Discord notified!' })
}
