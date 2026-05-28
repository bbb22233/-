import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-secret') === ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? 'all'
  const status = searchParams.get('status') ?? 'all'

  const statusFilter = status !== 'all' ? { status } : undefined

  const results: {
    deposits: Array<{
      id: string
      userId: string
      amount: number
      txHash: string
      status: string
      adminNote: string | null
      createdAt: Date
      updatedAt: Date
      user: { username: string; email: string }
    }>
    withdrawals: Array<{
      id: string
      userId: string
      amount: number
      toAddress: string
      status: string
      adminNote: string | null
      createdAt: Date
      updatedAt: Date
      user: { username: string; email: string }
    }>
  } = { deposits: [], withdrawals: [] }

  if (type === 'all' || type === 'deposit') {
    results.deposits = await prisma.depositRequest.findMany({
      where: statusFilter,
      include: { user: { select: { username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  if (type === 'all' || type === 'withdrawal') {
    results.withdrawals = await prisma.withdrawalRequest.findMany({
      where: statusFilter,
      include: { user: { select: { username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  return NextResponse.json(results)
}
