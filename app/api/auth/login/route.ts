import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    await prisma.session.deleteMany({ where: { userId: user.id } })

    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await prisma.session.create({ data: { userId: user.id, token, expiresAt } })

    // Return token in body AND set cookie (bypass Cloudflare cookie stripping)
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
    console.error('[login] error:', err)
    const message = err instanceof Error ? err.message : 'Login failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
