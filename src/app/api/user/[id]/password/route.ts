import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const body = await req.json() as {
      type: string
      newPassword: string
      currentPassword?: string
    }

    const { type, newPassword, currentPassword } = body

    if (type !== 'withdrawal') {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'PIN must be at least 6 characters' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user already has a withdrawal password, require current password
    if (user.withdrawalPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Please enter your current Withdrawal PIN' }, { status: 400 })
      }
      if (currentPassword !== user.withdrawalPassword) {
        return NextResponse.json({ error: 'Incorrect Withdrawal PIN' }, { status: 401 })
      }
    }

    await prisma.user.update({
      where: { id },
      data: { withdrawalPassword: newPassword },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Password PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
