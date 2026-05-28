import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('x-admin-secret')
  if (auth !== ADMIN_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { marketId, outcome } = await req.json()
  if (!marketId || !outcome || !['yes', 'no'].includes(outcome)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const market = await prisma.market.findUnique({ where: { id: marketId } })
  if (!market) return NextResponse.json({ error: 'Market not found' }, { status: 404 })
  if (market.status === 'resolved') return NextResponse.json({ error: 'Already resolved' }, { status: 400 })

  // Find all winning positions
  const winningPositions = await prisma.position.findMany({
    where: { marketId, outcome, shares: { gt: 0 }, claimed: false },
    include: { user: true },
  })

  // Total pool = all buy trades on this market
  const totalPool = await prisma.trade.aggregate({
    where: { marketId, type: 'buy' },
    _sum: { total: true },
  })
  const pool = totalPool._sum.total || 0

  // Total winning shares
  const totalWinningShares = winningPositions.reduce((s, p) => s + p.shares, 0)

  let payoutsProcessed = 0

  await prisma.$transaction(async tx => {
    // Mark market as resolved
    await tx.market.update({
      where: { id: marketId },
      data: { status: 'resolved', resolvedOutcome: outcome, resolvedAt: new Date() },
    })

    // Pay out winners proportionally
    for (const pos of winningPositions) {
      if (totalWinningShares === 0) continue
      const payout = (pos.shares / totalWinningShares) * pool * 0.98 // 2% platform fee
      await tx.user.update({
        where: { id: pos.userId },
        data: {
          balance: { increment: payout },
          totalPnl: { increment: payout - pos.shares * pos.avgPrice },
        },
      })
      await tx.position.update({
        where: { id: pos.id },
        data: { claimed: true },
      })
      payoutsProcessed++
    }
  })

  return NextResponse.json({
    success: true,
    outcome,
    totalPool: pool,
    winnersCount: winningPositions.length,
    payoutsProcessed,
  })
}
