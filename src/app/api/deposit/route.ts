import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, amount, txHash } = body as { userId: string; amount: number; txHash: string }

    if (!userId || !txHash || txHash.trim() === '') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const request = await prisma.depositRequest.create({
      data: {
        userId,
        amount,
        txHash: txHash.trim(),
        status: 'pending',
      },
    })

    return NextResponse.json(request)
  } catch (err) {
    console.error('Deposit POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
