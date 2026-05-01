import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { DEFAULT_GENRES, DEFAULT_THEMES } from '@/lib/seed-wheel'

export async function POST(req: NextRequest) {
  const { email, password, displayName, bio, discordHandle } = await req.json()

  if (!email || !password || !displayName || !discordHandle) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { email, passwordHash, displayName, bio, discordHandle },
  })

  // Seed wheel options on first user
  const count = await prisma.wheelOption.count()
  if (count === 0) {
    await prisma.wheelOption.createMany({
      data: [
        ...DEFAULT_GENRES.map(v => ({ type: 'genre', value: v, addedBy: 'system' })),
        ...DEFAULT_THEMES.map(v => ({ type: 'theme', value: v, addedBy: 'system' })),
      ],
    })
  }

  // Create session
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  await prisma.session.create({ data: { userId: user.id, token, expiresAt } })

  const res = NextResponse.json({ ok: true })
  res.cookies.set('cv_token', token, { httpOnly: true, expires: expiresAt, path: '/' })
  return res
}
