import { NextRequest, NextResponse } from 'next/server'
import { syncPolymarketEvents } from '@/lib/polymarket/sync'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('x-admin-secret')
  if (auth !== ADMIN_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { limit = 50 } = await req.json().catch(() => ({}))
  const result = await syncPolymarketEvents(limit)
  return NextResponse.json(result)
}
