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
  // Return a safe subset (no withdrawalPassword in GET response)
  const { withdrawalPassword: _wp, ...safeUser } = user
  return NextResponse.json({
    ...safeUser,
    hasWithdrawalPassword: !!_wp,
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const body = await req.json() as { username?: string }
    const { username } = body

    if (!username || !username.trim()) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const trimmed = username.trim()

    // Check if username is taken by another user
    const existing = await prisma.user.findUnique({ where: { username: trimmed } })
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { username: trimmed },
    })

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      username: updated.username,
      walletAddress: updated.walletAddress,
      balance: updated.balance,
      totalPnl: updated.totalPnl,
      winRate: updated.winRate,
      marketsTraded: updated.marketsTraded,
      createdAt: updated.createdAt,
    })
  } catch (err) {
    console.error('User PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
