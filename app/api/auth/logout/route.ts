import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('cv_token')?.value
  if (token) await prisma.session.deleteMany({ where: { token } })
  const res = NextResponse.json({ ok: true })
  res.cookies.set('cv_token', '', { expires: new Date(0), path: '/' })
  return res
}
