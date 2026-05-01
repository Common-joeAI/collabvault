import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { sendDiscordDM } from '@/lib/discord'

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get all other artists
  const artists = await prisma.user.findMany({ where: { id: { not: user.id } } })
  if (artists.length === 0) {
    return NextResponse.json({ error: 'No other artists registered yet' }, { status: 400 })
  }

  const genres = await prisma.wheelOption.findMany({ where: { type: 'genre' } })
  const themes = await prisma.wheelOption.findMany({ where: { type: 'theme' } })

  if (!genres.length || !themes.length) {
    return NextResponse.json({ error: 'Wheel options not seeded yet' }, { status: 400 })
  }

  const artistB = pickRandom(artists)
  const genre = pickRandom(genres).value
  const theme = pickRandom(themes).value

  const challenge = await prisma.challenge.create({
    data: {
      artistAId: user.id,
      artistBId: artistB.id,
      genre,
      theme,
    },
    include: {
      artistA: { select: { displayName: true, discordHandle: true } },
      artistB: { select: { displayName: true, discordHandle: true } },
    },
  })

  // Discord DMs
  const msg = (name: string) =>
    `🎡 **Collab Challenge Spun!**\n\n` +
    `You've been matched with **${name}** for a collab!\n\n` +
    `🎵 **Genre:** ${genre}\n` +
    `🎨 **Theme:** ${theme}\n\n` +
    `Head to https://collabs.darkkeangelzz.live to view your challenge. Good luck! 🚀`

  await Promise.all([
    sendDiscordDM(challenge.artistA.discordHandle, msg(challenge.artistB.displayName)),
    sendDiscordDM(challenge.artistB.discordHandle, msg(challenge.artistA.displayName)),
  ])

  return NextResponse.json(challenge)
}
