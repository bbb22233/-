import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

function generateWalletAddress(): string {
  const chars = '0123456789abcdef'
  let addr = '0x'
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)]
  return addr
}

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()
    if (!email || !code) {
      return NextResponse.json({ error: '参数缺失' }, { status: 400 })
    }

    const record = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!record) {
      return NextResponse.json({ error: '验证码错误或已过期' }, { status: 401 })
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { used: true },
    })

    // Upsert user
    const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user'
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      const base = username.slice(0, 16)
      let finalUsername = base
      let suffix = 1
      while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
        finalUsername = `${base}${suffix++}`
      }
      user = await prisma.user.create({
        data: {
          email,
          username: finalUsername,
          walletAddress: generateWalletAddress(),
          balance: 100,
        },
      })
    }

    return NextResponse.json(user)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
