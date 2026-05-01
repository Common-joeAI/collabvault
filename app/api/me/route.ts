import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { passwordHash, ...safe } = user
  return NextResponse.json(safe)
}

export async function PATCH(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { displayName, bio, discordHandle } = await req.json()
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { displayName, bio, discordHandle },
  })
  const { passwordHash, ...safe } = updated
  return NextResponse.json(safe)
}
