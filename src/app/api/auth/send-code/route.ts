import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/db/client'

const resend = new Resend(process.env.RESEND_API_KEY)

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '请输入有效邮箱' }, { status: 400 })
    }

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Invalidate old codes for this email
    await prisma.$executeRaw`
      UPDATE "VerificationCode" SET used = true
      WHERE email = ${email} AND used = false
    `

    await prisma.verificationCode.create({
      data: { email, code, expiresAt },
    })

    await resend.emails.send({
      from: 'CryptoPredict <onboarding@resend.dev>',
      to: email,
      subject: '您的登录验证码',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f1117;color:#fff;border-radius:12px;">
          <h2 style="margin:0 0 8px;font-size:20px;">登录验证码</h2>
          <p style="color:#9ca3af;margin:0 0 24px;font-size:14px;">您正在登录 CryptoPredict，验证码有效期 5 分钟。</p>
          <div style="background:#1f2937;border-radius:8px;padding:20px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700;color:#60a5fa;">
            ${code}
          </div>
          <p style="color:#6b7280;margin:24px 0 0;font-size:12px;">如果这不是您的操作，请忽略此邮件。</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: '发送失败，请稍后重试' }, { status: 500 })
  }
}
