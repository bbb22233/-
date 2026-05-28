import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-secret') === ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [
    totalUsers,
    totalMarkets,
    activeMarkets,
    resolvedMarkets,
    tradeAgg,
    pendingDeposits,
    pendingWithdrawals,
    approvedDeposits,
    approvedWithdrawals,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.market.count(),
    prisma.market.count({ where: { status: 'active' } }),
    prisma.market.count({ where: { status: 'resolved' } }),
    prisma.trade.aggregate({ _sum: { fee: true, total: true } }),
    prisma.depositRequest.count({ where: { status: 'pending' } }),
    prisma.withdrawalRequest.count({ where: { status: 'pending' } }),
    prisma.depositRequest.aggregate({ where: { status: 'approved' }, _sum: { amount: true } }),
    prisma.withdrawalRequest.aggregate({ where: { status: 'approved' }, _sum: { amount: true } }),
  ])

  return NextResponse.json({
    totalUsers,
    totalMarkets,
    activeMarkets,
    resolvedMarkets,
    totalVolume: tradeAgg._sum.total ?? 0,
    totalFees: tradeAgg._sum.fee ?? 0,
    pendingDeposits,
    pendingWithdrawals,
    totalDeposited: approvedDeposits._sum.amount ?? 0,
    totalWithdrawn: approvedWithdrawals._sum.amount ?? 0,
  })
}
