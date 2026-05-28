// Constant Product Market Maker (CPMM) for prediction markets
// yesShares * noShares = k (invariant)

export const FEE_RATE = 0.02 // 2%

export function calcBuyShares(
  outcome: 'yes' | 'no',
  amountIn: number,     // USDC in
  yesShares: number,
  noShares: number,
): { sharesOut: number; pricePerShare: number; newYesShares: number; newNoShares: number } {
  const k = yesShares * noShares
  const amountAfterFee = amountIn * (1 - FEE_RATE)

  if (outcome === 'yes') {
    // Buying YES: add USDC, receive YES shares
    // New noShares = noShares + amountAfterFee
    // New yesShares = k / newNoShares
    const newNoShares = noShares + amountAfterFee
    const newYesShares = k / newNoShares
    const sharesOut = yesShares - newYesShares
    return { sharesOut, pricePerShare: amountIn / sharesOut, newYesShares, newNoShares }
  } else {
    const newYesShares = yesShares + amountAfterFee
    const newNoShares = k / newYesShares
    const sharesOut = noShares - newNoShares
    return { sharesOut, pricePerShare: amountIn / sharesOut, newYesShares, newNoShares }
  }
}

export function calcSellShares(
  outcome: 'yes' | 'no',
  sharesIn: number,
  yesShares: number,
  noShares: number,
): { amountOut: number; pricePerShare: number; newYesShares: number; newNoShares: number } {
  const k = yesShares * noShares

  if (outcome === 'yes') {
    const newYesShares = yesShares + sharesIn
    const newNoShares = k / newYesShares
    const amountBeforeFee = noShares - newNoShares
    const amountOut = amountBeforeFee * (1 - FEE_RATE)
    return { amountOut, pricePerShare: amountOut / sharesIn, newYesShares, newNoShares }
  } else {
    const newNoShares = noShares + sharesIn
    const newYesShares = k / newNoShares
    const amountBeforeFee = yesShares - newYesShares
    const amountOut = amountBeforeFee * (1 - FEE_RATE)
    return { amountOut, pricePerShare: amountOut / sharesIn, newYesShares, newNoShares }
  }
}

export function calcPrices(yesShares: number, noShares: number) {
  const total = yesShares + noShares
  return {
    yesPrice: noShares / total,
    noPrice: yesShares / total,
  }
}
