import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-secret') === ADMIN_SECRET
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json() as { balance?: number; isAdmin?: boolean }

  const data: { balance?: number; isAdmin?: boolean } = {}
  if (typeof body.balance === 'number') data.balance = body.balance
  if (typeof body.isAdmin === 'boolean') data.isAdmin = body.isAdmin

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      username: true,
      balance: true,
      totalPnl: true,
      marketsTraded: true,
      winRate: true,
      createdAt: true,
      isAdmin: true,
    },
  })

  return NextResponse.json(user)
}
