import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { DEFAULT_GENRES, DEFAULT_THEMES } from '@/lib/seed-wheel'

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName, bio, discordHandle } = await req.json()

    if (!email || !password || !displayName || !discordHandle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { email, passwordHash, displayName, bio: bio || null, discordHandle, genres: '[]', themes: '[]' },
    })

    const count = await prisma.wheelOption.count()
    if (count === 0) {
      await prisma.wheelOption.createMany({
        data: [
          ...DEFAULT_GENRES.map(v => ({ type: 'genre', value: v, addedBy: 'system' })),
          ...DEFAULT_THEMES.map(v => ({ type: 'theme', value: v, addedBy: 'system' })),
        ],
      })
    }

    await prisma.session.deleteMany({ where: { userId: user.id } })
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await prisma.session.create({ data: { userId: user.id, token, expiresAt } })

    const res = NextResponse.json({ ok: true, token })
    res.cookies.set('cv_token', token, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })
    return res
  } catch (err: unknown) {
    console.error('[signup] error:', err)
    const message = err instanceof Error ? err.message : 'Signup failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
