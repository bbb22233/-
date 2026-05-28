import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-secret') === ADMIN_SECRET
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { type, action, adminNote } = body as {
    type: 'deposit' | 'withdrawal'
    action: 'approve' | 'reject'
    adminNote?: string
  }

  if (!type || !action) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    if (type === 'deposit') {
      if (action === 'approve') {
        const depositReq = await prisma.depositRequest.findUnique({ where: { id } })
        if (!depositReq) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
        if (depositReq.status !== 'pending') {
          return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
        }

        const result = await prisma.$transaction([
          prisma.depositRequest.update({
            where: { id },
            data: { status: 'approved', adminNote: adminNote ?? null },
          }),
          prisma.user.update({
            where: { id: depositReq.userId },
            data: { balance: { increment: depositReq.amount } },
          }),
        ])
        return NextResponse.json({ success: true, request: result[0] })
      } else {
        const result = await prisma.depositRequest.update({
          where: { id },
          data: { status: 'rejected', adminNote: adminNote ?? null },
        })
        return NextResponse.json({ success: true, request: result })
      }
    } else if (type === 'withdrawal') {
      if (action === 'approve') {
        const withdrawReq = await prisma.withdrawalRequest.findUnique({
          where: { id },
          include: { user: true },
        })
        if (!withdrawReq) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
        if (withdrawReq.status !== 'pending') {
          return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
        }
        if (withdrawReq.user.balance < withdrawReq.amount) {
          return NextResponse.json({ error: 'User has insufficient balance' }, { status: 400 })
        }

        const result = await prisma.$transaction([
          prisma.withdrawalRequest.update({
            where: { id },
            data: { status: 'approved', adminNote: adminNote ?? null },
          }),
          prisma.user.update({
            where: { id: withdrawReq.userId },
            data: { balance: { decrement: withdrawReq.amount } },
          }),
        ])
        return NextResponse.json({ success: true, request: result[0] })
      } else {
        const result = await prisma.withdrawalRequest.update({
          where: { id },
          data: { status: 'rejected', adminNote: adminNote ?? null },
        })
        return NextResponse.json({ success: true, request: result })
      }
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    console.error('Admin requests [id] POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
