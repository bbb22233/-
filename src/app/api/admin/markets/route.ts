import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('x-admin-secret')
  return auth === ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const markets = await prisma.market.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { trades: true, positions: true } } },
  })
  return NextResponse.json(markets.map(m => ({ ...m, tags: JSON.parse(m.tags || '[]') })))
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { title, description, category, endDate, liquidity = 100, tags = [] } = body

  if (!title || !description || !category || !endDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const market = await prisma.market.create({
    data: {
      title,
      description,
      category,
      status: 'active',
      endDate: new Date(endDate),
      liquidity,
      yesShares: liquidity * 10,
      noShares: liquidity * 10,
      tags: JSON.stringify(tags),
    },
  })

  return NextResponse.json({ ...market, tags })
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await req.json()
  const market = await prisma.market.update({ where: { id }, data: { status } })
  return NextResponse.json(market)
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await prisma.market.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
