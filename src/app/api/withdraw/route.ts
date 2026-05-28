import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, amount, toAddress, withdrawalPassword } = body as {
      userId: string
      amount: number
      toAddress: string
      withdrawalPassword?: string
    }

    if (!userId || !toAddress || toAddress.trim() === '') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify withdrawal password if user has set one
    if (user.withdrawalPassword) {
      if (!withdrawalPassword || withdrawalPassword !== user.withdrawalPassword) {
        return NextResponse.json({ error: 'Incorrect Withdrawal PIN' }, { status: 401 })
      }
    }

    if (user.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const request = await prisma.withdrawalRequest.create({
      data: {
        userId,
        amount,
        toAddress: toAddress.trim(),
        status: 'pending',
      },
    })

    return NextResponse.json(request)
  } catch (err) {
    console.error('Withdraw POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
