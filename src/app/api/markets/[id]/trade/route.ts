import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { calcBuyShares, calcSellShares, calcPrices } from '@/lib/amm'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { userId, type, outcome, amount, shares: sharesIn } = body

  if (!userId || !type || !outcome) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const [market, user] = await Promise.all([
    prisma.market.findUnique({ where: { id } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ])

  if (!market) return NextResponse.json({ error: 'Market not found' }, { status: 404 })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (market.status !== 'active') return NextResponse.json({ error: 'Market not active' }, { status: 400 })

  let sharesOut = 0
  let amountOut = 0
  let pricePerShare = 0
  let newYesShares = market.yesShares
  let newNoShares = market.noShares
  let tradeCost = 0

  if (type === 'buy') {
    const usdcAmount = parseFloat(amount)
    if (usdcAmount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    if (user.balance < usdcAmount) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })

    const result = calcBuyShares(outcome, usdcAmount, market.yesShares, market.noShares)
    sharesOut = result.sharesOut
    pricePerShare = result.pricePerShare
    newYesShares = result.newYesShares
    newNoShares = result.newNoShares
    tradeCost = usdcAmount
  } else {
    const numShares = parseFloat(sharesIn)
    if (numShares <= 0) return NextResponse.json({ error: 'Invalid shares' }, { status: 400 })

    const position = await prisma.position.findUnique({
      where: { marketId_userId_outcome: { marketId: id, userId, outcome } },
    })
    if (!position || position.shares < numShares) {
      return NextResponse.json({ error: 'Insufficient shares' }, { status: 400 })
    }

    const result = calcSellShares(outcome, numShares, market.yesShares, market.noShares)
    amountOut = result.amountOut
    pricePerShare = result.pricePerShare
    newYesShares = result.newYesShares
    newNoShares = result.newNoShares
    sharesOut = numShares
  }

  const newPrices = calcPrices(newYesShares, newNoShares)
  const fee = tradeCost * 0.02

  // Persist in transaction
  const trade = await prisma.$transaction(async tx => {
    // Update market shares and prices
    await tx.market.update({
      where: { id },
      data: {
        yesShares: newYesShares,
        noShares: newNoShares,
        yesPrice: newPrices.yesPrice,
        noPrice: newPrices.noPrice,
        volume: { increment: tradeCost || amountOut },
        participantCount: { increment: 1 },
      },
    })

    // Update user balance
    if (type === 'buy') {
      await tx.user.update({ where: { id: userId }, data: { balance: { decrement: tradeCost } } })
      // Update or create position
      await tx.position.upsert({
        where: { marketId_userId_outcome: { marketId: id, userId, outcome } },
        update: { shares: { increment: sharesOut }, avgPrice: pricePerShare, updatedAt: new Date() },
        create: { marketId: id, userId, outcome, shares: sharesOut, avgPrice: pricePerShare },
      })
    } else {
      await tx.user.update({ where: { id: userId }, data: { balance: { increment: amountOut } } })
      await tx.position.update({
        where: { marketId_userId_outcome: { marketId: id, userId, outcome } },
        data: { shares: { decrement: sharesOut }, updatedAt: new Date() },
      })
    }

    // Record trade
    return tx.trade.create({
      data: {
        marketId: id,
        userId,
        type,
        outcome,
        shares: sharesOut,
        price: pricePerShare,
        total: tradeCost || amountOut,
        fee,
      },
    })
  })

  return NextResponse.json({
    success: true,
    trade,
    sharesReceived: type === 'buy' ? sharesOut : undefined,
    usdcReceived: type === 'sell' ? amountOut : undefined,
    newYesPrice: newPrices.yesPrice,
    newNoPrice: newPrices.noPrice,
  })
}
