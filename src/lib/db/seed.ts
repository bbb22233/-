import { prisma } from './client'
import { mockMarkets } from '../mock-data'

export async function seedDatabase() {
  const count = await prisma.market.count()
  if (count > 0) return

  // Seed admin user
  await prisma.user.upsert({
    where: { email: 'admin@cryptopredict.com' },
    update: {},
    create: {
      email: 'admin@cryptopredict.com',
      username: 'Admin',
      balance: 999999,
      isAdmin: true,
    },
  })

  // Seed demo user
  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      username: 'CryptoWizard',
      balance: 1250.50,
      totalPnl: 324.80,
      winRate: 68,
      marketsTraded: 24,
    },
  })

  // Seed markets from mock data
  for (const m of mockMarkets) {
    await prisma.market.create({
      data: {
        id: m.id,
        title: m.title,
        description: m.description,
        category: m.category,
        status: m.status === 'resolved' ? 'resolved' : 'active',
        yesPrice: m.yesPrice,
        noPrice: m.noPrice,
        volume: m.volume,
        liquidity: m.liquidity,
        endDate: new Date(m.endDate),
        resolvedOutcome: m.resolvedOutcome ?? null,
        tags: JSON.stringify(m.tags),
        commentCount: m.commentCount,
        participantCount: m.participantCount,
      },
    })
  }

  console.log('Database seeded successfully')
}
