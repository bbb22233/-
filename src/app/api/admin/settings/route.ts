import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-secret') === ADMIN_SECRET
}

export async function GET() {
  try {
    const settings = await prisma.setting.findMany()
    const result: Record<string, string> = {}
    for (const s of settings) {
      result[s.key] = s.value
    }
    return NextResponse.json(result)
  } catch (err) {
    console.error('Settings GET error:', err)
    return NextResponse.json({})
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { key, value } = body as { key: string; value: string }

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Missing key or value' }, { status: 400 })
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    return NextResponse.json(setting)
  } catch (err) {
    console.error('Settings POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
