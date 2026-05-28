import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const comments = await prisma.comment.findMany({
    where: { marketId: id },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json(comments.map(c => ({
    ...c,
    username: c.user.username,
    timestamp: c.createdAt.toISOString(),
  })))
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId, content } = await req.json()
  if (!userId || !content?.trim()) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const comment = await prisma.comment.create({
    data: { marketId: id, userId, content },
    include: { user: { select: { username: true } } },
  })
  await prisma.market.update({ where: { id }, data: { commentCount: { increment: 1 } } })

  return NextResponse.json({ ...comment, username: comment.user.username, timestamp: comment.createdAt.toISOString() })
}
