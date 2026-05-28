import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      positions: {
        include: { market: true },
        where: { shares: { gt: 0 } },
      },
      trades: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { market: { select: { title: true } } },
      },
    },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}
