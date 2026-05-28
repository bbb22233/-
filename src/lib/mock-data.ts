import { Market, PricePoint, Position, Trade, User, LeaderboardEntry, Comment } from '@/types'

export const mockMarkets: Market[] = [
  // --- BTC ---
  {
    id: '1',
    title: 'Will Bitcoin exceed $150,000 before end of 2024?',
    description: 'Will the price of Bitcoin surpass $150,000 before December 31, 2024? Settlement based on Coinbase spot price.',
    category: 'BTC', status: 'active', yesPrice: 0.67, noPrice: 0.33,
    volume: 2450000, liquidity: 890000, endDate: '2024-12-31', createdAt: '2024-01-15',
    tags: ['Bitcoin', 'Price', 'ATH'], commentCount: 234, participantCount: 1892,
  },
  {
    id: '2',
    title: 'Will BTC reach a new ATH within 6 months of halving?',
    description: 'Will Bitcoin set a new all-time high (above $73,000) within 6 months of the fourth halving event?',
    category: 'BTC', status: 'active', yesPrice: 0.61, noPrice: 0.39,
    volume: 3210000, liquidity: 1100000, endDate: '2024-10-20', createdAt: '2024-04-20',
    tags: ['Bitcoin', 'Halving', 'ATH'], commentCount: 312, participantCount: 2156,
  },
  // --- ETH ---
  {
    id: '3',
    title: 'Will Ethereum staking exceed 30 million ETH?',
    description: 'Will total ETH staked on the Ethereum network surpass 30 million ETH?',
    category: 'ETH', status: 'active', yesPrice: 0.82, noPrice: 0.18,
    volume: 1230000, liquidity: 450000, endDate: '2024-06-30', createdAt: '2024-02-01',
    tags: ['Ethereum', 'Staking'], commentCount: 89, participantCount: 654,
  },
  {
    id: '4',
    title: 'Will Solana daily transactions surpass Ethereum?',
    description: 'Will Solana network daily transaction count exceed the combined total of Ethereum mainnet and all Layer 2s?',
    category: 'ETH', status: 'active', yesPrice: 0.53, noPrice: 0.47,
    volume: 1560000, liquidity: 560000, endDate: '2024-12-31', createdAt: '2024-02-20',
    tags: ['Solana', 'Ethereum', 'TPS'], commentCount: 198, participantCount: 1234,
  },
  // --- DeFi ---
  {
    id: '5',
    title: 'Will Uniswap V4 reach $5B TVL within 90 days of launch?',
    description: 'Will Uniswap V4 accumulate over $5 billion in total value locked within 90 days of its official launch?',
    category: 'DeFi', status: 'active', yesPrice: 0.45, noPrice: 0.55,
    volume: 670000, liquidity: 240000, endDate: '2024-12-31', createdAt: '2024-04-01',
    tags: ['Uniswap', 'DeFi', 'TVL'], commentCount: 78, participantCount: 512,
  },
  // --- Layer2 ---
  {
    id: '6',
    title: 'Will Arbitrum TVL surpass Optimism?',
    description: 'Will Arbitrum total value locked (TVL) exceed Optimism and maintain the lead for 30 consecutive days?',
    category: 'Layer2', status: 'active', yesPrice: 0.71, noPrice: 0.29,
    volume: 890000, liquidity: 320000, endDate: '2024-09-30', createdAt: '2024-03-01',
    tags: ['Arbitrum', 'Optimism', 'TVL'], commentCount: 145, participantCount: 923,
  },
  // --- NFT ---
  {
    id: '7',
    title: 'Will NFT market monthly volume return to $1 billion?',
    description: 'Will combined monthly trading volume across OpenSea, Blur, and other major NFT platforms exceed $1 billion?',
    category: 'NFT', status: 'active', yesPrice: 0.28, noPrice: 0.72,
    volume: 340000, liquidity: 120000, endDate: '2024-12-31', createdAt: '2024-03-15',
    tags: ['NFT', 'OpenSea', 'Market'], commentCount: 43, participantCount: 287,
  },
  // --- Regulation ---
  {
    id: '8',
    title: 'Will the SEC approve a spot Bitcoin ETF application?',
    description: 'Will the SEC approve any spot Bitcoin ETF application in Q1 2024?',
    category: 'Regulation', status: 'resolved', yesPrice: 1, noPrice: 0,
    volume: 5670000, liquidity: 0, endDate: '2024-03-31', createdAt: '2023-11-01',
    resolvedOutcome: 'yes', tags: ['Bitcoin', 'ETF', 'SEC'], commentCount: 567, participantCount: 4231,
  },
  // --- Politics ---
  {
    id: '9',
    title: 'Will Trump win the 2024 US presidential election?',
    description: 'Will Donald Trump win the 2024 US presidential election and return to the White House?',
    category: 'Politics', status: 'resolved', yesPrice: 1, noPrice: 0,
    volume: 12400000, liquidity: 0, endDate: '2024-11-05', createdAt: '2024-01-01',
    resolvedOutcome: 'yes', tags: ['Trump', 'USA', 'Election'], commentCount: 1892, participantCount: 9823,
  },
  {
    id: '10',
    title: 'Will the Fed cut rates more than 3 times in 2024?',
    description: 'Will the Federal Reserve implement more than 3 interest rate cuts during 2024?',
    category: 'Politics', status: 'active', yesPrice: 0.34, noPrice: 0.66,
    volume: 3200000, liquidity: 1200000, endDate: '2024-12-31', createdAt: '2024-01-10',
    tags: ['Fed', 'Interest Rate', 'Macro'], commentCount: 445, participantCount: 3211,
  },
  // --- Elections ---
  {
    id: '11',
    title: 'Will Labour win the 2024 UK general election?',
    description: 'Will the UK Labour Party win the 2024 general election and form a government?',
    category: 'Elections', status: 'resolved', yesPrice: 1, noPrice: 0,
    volume: 2100000, liquidity: 0, endDate: '2024-07-04', createdAt: '2024-05-01',
    resolvedOutcome: 'yes', tags: ['UK', 'Labour', 'Election'], commentCount: 234, participantCount: 1654,
  },
  {
    id: '12',
    title: 'Will the far-right win the 2027 French presidential election?',
    description: 'Will the National Rally or a far-right candidate win the final round of the 2027 French presidential election?',
    category: 'Elections', status: 'active', yesPrice: 0.44, noPrice: 0.56,
    volume: 890000, liquidity: 310000, endDate: '2027-04-30', createdAt: '2024-06-15',
    tags: ['France', 'Election', 'Le Pen'], commentCount: 167, participantCount: 892,
  },
  // --- Sports ---
  {
    id: '13',
    title: 'Will Brazil win the 2026 FIFA World Cup?',
    description: 'Will the Brazilian national football team win the 2026 FIFA World Cup championship?',
    category: 'Sports', status: 'active', yesPrice: 0.22, noPrice: 0.78,
    volume: 4500000, liquidity: 1800000, endDate: '2026-07-19', createdAt: '2024-01-01',
    tags: ['Football', 'World Cup', 'Brazil'], commentCount: 789, participantCount: 5432,
  },
  {
    id: '14',
    title: 'Will the LA Lakers win the 2024-25 NBA Championship?',
    description: 'Will the Los Angeles Lakers win the 2024-25 NBA Championship?',
    category: 'Sports', status: 'active', yesPrice: 0.12, noPrice: 0.88,
    volume: 2300000, liquidity: 890000, endDate: '2025-06-30', createdAt: '2024-10-01',
    tags: ['NBA', 'Lakers', 'LeBron'], commentCount: 543, participantCount: 3214,
  },
  {
    id: '15',
    title: 'Will Federer announce a comeback in 2025?',
    description: 'Will Roger Federer announce a return to professional tennis and compete in at least one ATP event in 2025?',
    category: 'Sports', status: 'active', yesPrice: 0.08, noPrice: 0.92,
    volume: 780000, liquidity: 290000, endDate: '2025-12-31', createdAt: '2024-03-01',
    tags: ['Tennis', 'Federer', 'ATP'], commentCount: 312, participantCount: 1876,
  },
  // --- Entertainment ---
  {
    id: '16',
    title: 'Will GTA VI release in 2025?',
    description: "Will Rockstar Games' GTA VI officially release before December 31, 2025?",
    category: 'Entertainment', status: 'active', yesPrice: 0.73, noPrice: 0.27,
    volume: 5600000, liquidity: 2100000, endDate: '2025-12-31', createdAt: '2024-01-15',
    tags: ['GTA6', 'Rockstar', 'Gaming'], commentCount: 1234, participantCount: 8921,
  },
  {
    id: '17',
    title: "Will Avengers 5 gross over $3 billion worldwide?",
    description: "Will Marvel's Avengers: Doomsday gross over $3 billion at the global box office?",
    category: 'Entertainment', status: 'active', yesPrice: 0.58, noPrice: 0.42,
    volume: 1200000, liquidity: 450000, endDate: '2026-12-31', createdAt: '2024-09-01',
    tags: ['Marvel', 'Avengers', 'Box Office'], commentCount: 456, participantCount: 3421,
  },
  // --- AI ---
  {
    id: '18',
    title: 'Will GPT-5 outperform GPT-4o on major benchmarks?',
    description: "Will OpenAI's GPT-5 surpass GPT-4o by more than 20% on major benchmarks like MMLU and HumanEval?",
    category: 'AI', status: 'active', yesPrice: 0.85, noPrice: 0.15,
    volume: 3400000, liquidity: 1300000, endDate: '2025-06-30', createdAt: '2024-02-01',
    tags: ['OpenAI', 'GPT-5', 'Benchmark'], commentCount: 678, participantCount: 4532,
  },
  {
    id: '19',
    title: 'Will AGI be achieved before 2026?',
    description: 'Will a major AI research organization (OpenAI/DeepMind/Anthropic) announce the achievement of AGI (Artificial General Intelligence) before 2026?',
    category: 'AI', status: 'active', yesPrice: 0.19, noPrice: 0.81,
    volume: 6700000, liquidity: 2400000, endDate: '2026-12-31', createdAt: '2024-01-01',
    tags: ['AGI', 'OpenAI', 'DeepMind'], commentCount: 1456, participantCount: 12341,
  },
  {
    id: '20',
    title: 'Will Sora become a mainstream creator tool by end of 2025?',
    description: 'Will OpenAI Sora be used by over 1 million creators for commercial content creation by end of 2025?',
    category: 'AI', status: 'active', yesPrice: 0.41, noPrice: 0.59,
    volume: 980000, liquidity: 380000, endDate: '2025-12-31', createdAt: '2024-02-15',
    tags: ['Sora', 'OpenAI', 'Video AI'], commentCount: 234, participantCount: 1892,
  },
  // --- Tech ---
  {
    id: '21',
    title: 'Will Apple Vision Pro ship over 1 million units in 2024?',
    description: 'Will Apple Vision Pro ship more than 1 million units during the full year of 2024?',
    category: 'Tech', status: 'active', yesPrice: 0.23, noPrice: 0.77,
    volume: 1800000, liquidity: 670000, endDate: '2024-12-31', createdAt: '2024-02-01',
    tags: ['Apple', 'Vision Pro', 'AR/VR'], commentCount: 345, participantCount: 2341,
  },
  {
    id: '22',
    title: 'Will SpaceX Starship complete an orbital flight and be recovered?',
    description: 'Will SpaceX Starship complete a full orbital mission and successfully recover both stages in 2024?',
    category: 'Tech', status: 'active', yesPrice: 0.69, noPrice: 0.31,
    volume: 2900000, liquidity: 1100000, endDate: '2024-12-31', createdAt: '2024-01-15',
    tags: ['SpaceX', 'Starship', 'Rocket'], commentCount: 567, participantCount: 4231,
  },
  // --- Economy ---
  {
    id: '23',
    title: 'Will the US enter a technical recession in 2024?',
    description: 'Will US GDP contract for two consecutive quarters in 2024, meeting the technical definition of a recession?',
    category: 'Economy', status: 'active', yesPrice: 0.18, noPrice: 0.82,
    volume: 4100000, liquidity: 1500000, endDate: '2024-12-31', createdAt: '2024-01-01',
    tags: ['USA', 'GDP', 'Recession'], commentCount: 678, participantCount: 5421,
  },
  {
    id: '24',
    title: 'Will gold break $3,000/oz in 2025?',
    description: 'Will the spot price of gold exceed $3,000 per troy ounce before December 31, 2025?',
    category: 'Economy', status: 'active', yesPrice: 0.76, noPrice: 0.24,
    volume: 3800000, liquidity: 1400000, endDate: '2025-12-31', createdAt: '2024-03-01',
    tags: ['Gold', 'Commodity', 'Inflation'], commentCount: 432, participantCount: 3214,
  },
  // --- World ---
  {
    id: '25',
    title: 'Will Russia and Ukraine sign a ceasefire agreement in 2024?',
    description: 'Will Russia and Ukraine sign a formal ceasefire or peace agreement before December 31, 2024?',
    category: 'World', status: 'active', yesPrice: 0.21, noPrice: 0.79,
    volume: 7800000, liquidity: 2900000, endDate: '2024-12-31', createdAt: '2024-01-01',
    tags: ['Russia', 'Ukraine', 'Ceasefire'], commentCount: 2341, participantCount: 18923,
  },
  {
    id: '26',
    title: 'Will a military conflict occur in the Taiwan Strait before 2026?',
    description: 'Will a formal military conflict (beyond exercises) occur in the Taiwan Strait before December 31, 2025?',
    category: 'World', status: 'active', yesPrice: 0.09, noPrice: 0.91,
    volume: 5400000, liquidity: 2000000, endDate: '2025-12-31', createdAt: '2024-01-01',
    tags: ['Taiwan', 'China', 'Geopolitics'], commentCount: 1876, participantCount: 14532,
  },
]

export const generatePriceHistory = (currentYes: number): PricePoint[] => {
  const points: PricePoint[] = []
  let yes = 0.5
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    yes = Math.max(0.05, Math.min(0.95, yes + (Math.random() - 0.5) * 0.06))
    if (i === 0) yes = currentYes
    points.push({
      time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      yes: Math.round(yes * 100),
      no: Math.round((1 - yes) * 100),
    })
  }
  return points
}

export const mockPositions: Position[] = [
  {
    marketId: '1', market: mockMarkets[0], outcome: 'yes',
    shares: 150, avgPrice: 0.58, currentPrice: 0.67, pnl: 13.5, pnlPercent: 15.5,
  },
  {
    marketId: '6', market: mockMarkets[5], outcome: 'yes',
    shares: 80, avgPrice: 0.65, currentPrice: 0.71, pnl: 4.8, pnlPercent: 9.2,
  },
  {
    marketId: '18', market: mockMarkets[17], outcome: 'yes',
    shares: 200, avgPrice: 0.75, currentPrice: 0.85, pnl: 20.0, pnlPercent: 13.3,
  },
  {
    marketId: '16', market: mockMarkets[15], outcome: 'yes',
    shares: 100, avgPrice: 0.65, currentPrice: 0.73, pnl: 8.0, pnlPercent: 12.3,
  },
]

export const mockTrades: Trade[] = [
  { id: '1', marketId: '1', marketTitle: 'Will Bitcoin exceed $150,000 before end of 2024?', type: 'buy', outcome: 'yes', shares: 150, price: 0.58, total: 87, timestamp: '2024-04-01T10:30:00Z' },
  { id: '2', marketId: '8', marketTitle: 'Will the SEC approve a spot Bitcoin ETF?', type: 'buy', outcome: 'yes', shares: 200, price: 0.72, total: 144, timestamp: '2024-01-05T14:20:00Z' },
  { id: '3', marketId: '8', marketTitle: 'Will the SEC approve a spot Bitcoin ETF?', type: 'sell', outcome: 'yes', shares: 200, price: 1.0, total: 200, timestamp: '2024-01-10T09:15:00Z' },
  { id: '4', marketId: '18', marketTitle: 'Will GPT-5 outperform GPT-4o on major benchmarks?', type: 'buy', outcome: 'yes', shares: 200, price: 0.75, total: 150, timestamp: '2024-04-05T11:00:00Z' },
  { id: '5', marketId: '16', marketTitle: 'Will GTA VI release in 2025?', type: 'buy', outcome: 'yes', shares: 100, price: 0.65, total: 65, timestamp: '2024-03-20T16:00:00Z' },
]

export const mockUser: User = {
  id: '1', email: 'demo@example.com', username: 'CryptoWizard',
  walletAddress: '0x1234...5678', balance: 1250.50, totalPnl: 324.80,
  winRate: 68, marketsTraded: 24, joinedAt: '2023-12-01',
}

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, user: { ...mockUser, id: '1', username: 'CryptoOracle', totalPnl: 45230 }, profit: 45230, winRate: 78, marketsTraded: 156 },
  { rank: 2, user: { ...mockUser, id: '2', username: 'BlockchainPro', totalPnl: 38900 }, profit: 38900, winRate: 72, marketsTraded: 203 },
  { rank: 3, user: { ...mockUser, id: '3', username: 'DeFiKing', totalPnl: 29400 }, profit: 29400, winRate: 69, marketsTraded: 89 },
  { rank: 4, user: { ...mockUser, id: '4', username: 'BTCMaxi', totalPnl: 21100 }, profit: 21100, winRate: 65, marketsTraded: 45 },
  { rank: 5, user: { ...mockUser, id: '5', username: 'ETHBull', totalPnl: 18700 }, profit: 18700, winRate: 71, marketsTraded: 127 },
  { rank: 6, user: { ...mockUser, id: '6', username: 'AltcoinTrader', totalPnl: 15200 }, profit: 15200, winRate: 63, marketsTraded: 312 },
  { rank: 7, user: { ...mockUser, id: '7', username: 'CryptoWizard', totalPnl: 12800 }, profit: 12800, winRate: 67, marketsTraded: 78 },
  { rank: 8, user: { ...mockUser, id: '8', username: 'Web3Native', totalPnl: 9340 }, profit: 9340, winRate: 61, marketsTraded: 234 },
  { rank: 9, user: { ...mockUser, id: '9', username: 'SatoshiFollower', totalPnl: 7890 }, profit: 7890, winRate: 59, marketsTraded: 67 },
  { rank: 10, user: { ...mockUser, id: '10', username: 'LayerZeroFan', totalPnl: 6230 }, profit: 6230, winRate: 64, marketsTraded: 145 },
]

export const mockComments: Comment[] = [
  { id: '1', userId: '2', username: 'BlockchainPro', content: 'On-chain data shows heavy accumulation — bullish!', timestamp: '2024-04-10T10:00:00Z', likes: 24 },
  { id: '2', userId: '3', username: 'DeFiKing', content: 'Too much macro uncertainty for me, going NO. The halving is already priced in.', timestamp: '2024-04-09T15:30:00Z', likes: 18 },
  { id: '3', userId: '4', username: 'BTCMaxi', content: 'Every halving cycle has produced a new ATH within 12 months. History says YES.', timestamp: '2024-04-08T09:20:00Z', likes: 41 },
  { id: '4', userId: '5', username: 'ETHBull', content: 'Institutional inflows into BTC ETFs remain strong — demand side looks solid.', timestamp: '2024-04-07T14:10:00Z', likes: 15 },
]
