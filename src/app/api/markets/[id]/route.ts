import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const market = await prisma.market.findUnique({ where: { id } })
  if (!market) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    ...market,
    tags: JSON.parse(market.tags || '[]'),
    endDate: market.endDate.toISOString().split('T')[0],
    createdAt: market.createdAt.toISOString().split('T')[0],
  })
}
