import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { seedDatabase } from '@/lib/db/seed'

export async function GET(req: NextRequest) {
  await seedDatabase()

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'volume'
  const limit = parseInt(searchParams.get('limit') || '100')

  const where: any = {}
  if (category && category !== 'All') where.category = category
  if (status) where.status = status
  else where.status = { not: 'resolved' }
  if (search) where.title = { contains: search }

  const orderBy: any =
    sort === 'volume' ? { volume: 'desc' }
    : sort === 'newest' ? { createdAt: 'desc' }
    : { endDate: 'asc' }

  const markets = await prisma.market.findMany({ where, orderBy, take: limit })

  return NextResponse.json(
    markets.map(m => ({
      ...m,
      tags: JSON.parse(m.tags || '[]'),
      endDate: m.endDate.toISOString().split('T')[0],
      createdAt: m.createdAt.toISOString().split('T')[0],
    }))
  )
}
