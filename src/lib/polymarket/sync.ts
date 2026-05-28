import axios from 'axios'
import { prisma } from '@/lib/db/client'

const GAMMA_API = 'https://gamma-api.polymarket.com'

interface PolymarketEvent {
  id: string
  title: string
  description: string
  endDate: string
  volume: number
  liquidity: number
  markets: PolymarketMarket[]
  tags?: { label: string }[]
}

interface PolymarketMarket {
  id: string
  question: string
  outcomePrices: string // JSON "[yes_price, no_price]"
  volume: string
  endDate: string
  closed: boolean
}

const CATEGORY_MAP: Record<string, string> = {
  politics: 'Politics',
  crypto: 'BTC',
  sports: 'Sports',
  entertainment: 'Entertainment',
  science: 'Tech',
  business: 'Economy',
  world: 'World',
  elections: 'Elections',
  ai: 'AI',
}

function mapCategory(tags: string[]): string {
  for (const tag of tags) {
    const lower = tag.toLowerCase()
    if (lower.includes('bitcoin') || lower.includes('btc')) return 'BTC'
    if (lower.includes('ethereum') || lower.includes('eth')) return 'ETH'
    if (lower.includes('defi')) return 'DeFi'
    if (lower.includes('nft')) return 'NFT'
    if (lower.includes('election')) return 'Elections'
    if (lower.includes('politic') || lower.includes('president')) return 'Politics'
    if (lower.includes('sport') || lower.includes('nba') || lower.includes('soccer') || lower.includes('football')) return 'Sports'
    if (lower.includes('ai') || lower.includes('openai') || lower.includes('gpt')) return 'AI'
    if (lower.includes('tech') || lower.includes('apple') || lower.includes('google')) return 'Tech'
    if (lower.includes('economy') || lower.includes('fed') || lower.includes('inflation')) return 'Economy'
    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
      if (lower.includes(key)) return val
    }
  }
  return 'World'
}

export async function syncPolymarketEvents(limit = 50): Promise<{ synced: number; errors: number }> {
  let synced = 0
  let errors = 0

  try {
    const response = await axios.get(`${GAMMA_API}/events`, {
      params: { limit, active: true, closed: false },
      timeout: 10000,
    })

    const events: PolymarketEvent[] = response.data

    for (const event of events) {
      try {
        // Only sync binary markets (YES/NO)
        const binaryMarket = event.markets?.find(m => !m.closed)
        if (!binaryMarket) continue

        let yesPrice = 0.5
        let noPrice = 0.5
        try {
          const prices = JSON.parse(binaryMarket.outcomePrices)
          yesPrice = parseFloat(prices[0]) || 0.5
          noPrice = parseFloat(prices[1]) || 0.5
        } catch {}

        const tags = event.tags?.map(t => t.label) ?? []
        const category = mapCategory(tags)

        await prisma.market.upsert({
          where: { polymarketId: event.id },
          update: {
            yesPrice,
            noPrice,
            volume: parseFloat(String(event.volume)) || 0,
            liquidity: parseFloat(String(event.liquidity)) || 0,
            updatedAt: new Date(),
          },
          create: {
            title: event.title,
            description: event.description || event.title,
            category,
            status: 'active',
            yesPrice,
            noPrice,
            volume: parseFloat(String(event.volume)) || 0,
            liquidity: parseFloat(String(event.liquidity)) || 0,
            endDate: new Date(event.endDate),
            tags: JSON.stringify(tags.slice(0, 5)),
            polymarketId: event.id,
          },
        })
        synced++
      } catch (e) {
        errors++
      }
    }
  } catch (e) {
    console.error('Polymarket sync failed:', e)
    errors++
  }

  return { synced, errors }
}
