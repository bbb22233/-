import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { seedDatabase } from '@/lib/db/seed'

export async function POST(req: NextRequest) {
  await seedDatabase()
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 999)

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      username,
      balance: 100, // $100 demo balance
    },
  })

  // Generate simple wallet address for demo
  if (!user.walletAddress) {
    const addr = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    await prisma.user.update({ where: { id: user.id }, data: { walletAddress: addr } })
    return NextResponse.json({ ...user, walletAddress: addr })
  }

  return NextResponse.json(user)
}
