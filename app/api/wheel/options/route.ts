import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const genres = await prisma.wheelOption.findMany({ where: { type: 'genre' }, orderBy: { createdAt: 'asc' } })
  const themes = await prisma.wheelOption.findMany({ where: { type: 'theme' }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json({ genres, themes })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, value } = await req.json()
  if (!type || !value || !['genre', 'theme'].includes(type)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const exists = await prisma.wheelOption.findFirst({ where: { type, value: { equals: value } } })
  if (exists) return NextResponse.json({ error: 'Already exists' }, { status: 409 })

  const option = await prisma.wheelOption.create({ data: { type, value, addedBy: user.id } })
  return NextResponse.json(option)
}
