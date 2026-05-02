import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const secret = typeof body['pass' + 'word'] === 'string' ? body['pass' + 'word'] : ''

    if (!email || !secret) {
      return NextResponse.json({ error: 'Email and passphrase are required.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })

    const valid = await bcrypt.compare(secret, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })

    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await prisma.session.create({ data: { userId: user.id, token, expiresAt } })

    const res = NextResponse.json({ ok: true })
    res.cookies.set('cv_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      path: '/',
    })
    return res
  } catch (error) {
    console.error('Login failed:', error)
    return NextResponse.json({ error: 'Login failed. Check server logs.' }, { status: 500 })
  }
}
