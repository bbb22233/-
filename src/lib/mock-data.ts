import { Market, PricePoint, Position, Trade, User, LeaderboardEntry, Comment } from '@/types'

export const mockMarkets: Market[] = [
  {
    id: '1',
    title: 'Bitcoin超过150,000美元 - 2024年底前？',
    description: '比特币价格是否会在2024年12月31日之前突破150,000美元？以Coinbase现货价格为准。',
    category: 'BTC',
    status: 'active',
    yesPrice: 0.67,
    noPrice: 0.33,
    volume: 2450000,
    liquidity: 890000,
    endDate: '2024-12-31',
    createdAt: '2024-01-15',
    imageUrl: '/btc.png',
    tags: ['Bitcoin', 'Price', 'ATH'],
    commentCount: 234,
    participantCount: 1892,
  },
  {
    id: '2',
    title: 'Ethereum完成Shanghai升级后质押量超过3000万？',
    description: '以太坊网络总质押量是否会突破3000万ETH？',
    category: 'ETH',
    status: 'active',
    yesPrice: 0.82,
    noPrice: 0.18,
    volume: 1230000,
    liquidity: 450000,
    endDate: '2024-06-30',
    createdAt: '2024-02-01',
    tags: ['Ethereum', 'Staking'],
    commentCount: 89,
    participantCount: 654,
  },
  {
    id: '3',
    title: 'SEC批准比特币现货ETF申请？',
    description: 'SEC是否会在2024年第一季度批准任何比特币现货ETF申请？',
    category: 'Regulation',
    status: 'resolved',
    yesPrice: 1,
    noPrice: 0,
    volume: 5670000,
    liquidity: 0,
    endDate: '2024-03-31',
    createdAt: '2023-11-01',
    resolvedOutcome: 'yes',
    tags: ['Bitcoin', 'ETF', 'SEC'],
    commentCount: 567,
    participantCount: 4231,
  },
  {
    id: '4',
    title: 'Arbitrum TVL超过Optimism？',
    description: 'Arbitrum的总锁仓量(TVL)是否会超过Optimism，并在30天内保持领先？',
    category: 'Layer2',
    status: 'active',
    yesPrice: 0.71,
    noPrice: 0.29,
    volume: 890000,
    liquidity: 320000,
    endDate: '2024-09-30',
    createdAt: '2024-03-01',
    tags: ['Arbitrum', 'Optimism', 'TVL'],
    commentCount: 145,
    participantCount: 923,
  },
  {
    id: '5',
    title: 'Uniswap V4上线后TVL超过50亿美元？',
    description: 'Uniswap V4正式上线后90天内，TVL是否会超过50亿美元？',
    category: 'DeFi',
    status: 'active',
    yesPrice: 0.45,
    noPrice: 0.55,
    volume: 670000,
    liquidity: 240000,
    endDate: '2024-12-31',
    createdAt: '2024-04-01',
    tags: ['Uniswap', 'DeFi', 'TVL'],
    commentCount: 78,
    participantCount: 512,
  },
  {
    id: '6',
    title: 'NFT市场月交易量重返10亿美元？',
    description: 'OpenSea、Blur等主流NFT市场单月总交易量是否会重新超过10亿美元？',
    category: 'NFT',
    status: 'active',
    yesPrice: 0.28,
    noPrice: 0.72,
    volume: 340000,
    liquidity: 120000,
    endDate: '2024-12-31',
    createdAt: '2024-03-15',
    tags: ['NFT', 'OpenSea', 'Market'],
    commentCount: 43,
    participantCount: 287,
  },
  {
    id: '7',
    title: 'BTC减半后6个月内达到新高？',
    description: '比特币第四次减半发生后6个月内，价格是否会创历史新高（超过73,000美元）？',
    category: 'BTC',
    status: 'active',
    yesPrice: 0.61,
    noPrice: 0.39,
    volume: 3210000,
    liquidity: 1100000,
    endDate: '2024-10-20',
    createdAt: '2024-04-20',
    tags: ['Bitcoin', 'Halving', 'ATH'],
    commentCount: 312,
    participantCount: 2156,
  },
  {
    id: '8',
    title: 'Solana单日交易量超过以太坊？',
    description: 'Solana网络单日交易笔数是否会超过以太坊主网+Layer2的总和？',
    category: 'ETH',
    status: 'active',
    yesPrice: 0.53,
    noPrice: 0.47,
    volume: 1560000,
    liquidity: 560000,
    endDate: '2024-12-31',
    createdAt: '2024-02-20',
    tags: ['Solana', 'Ethereum', 'TPS'],
    commentCount: 198,
    participantCount: 1234,
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
      time: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      yes: Math.round(yes * 100),
      no: Math.round((1 - yes) * 100),
    })
  }
  return points
}

export const mockPositions: Position[] = [
  {
    marketId: '1',
    market: mockMarkets[0],
    outcome: 'yes',
    shares: 150,
    avgPrice: 0.58,
    currentPrice: 0.67,
    pnl: 13.5,
    pnlPercent: 15.5,
  },
  {
    marketId: '4',
    market: mockMarkets[3],
    outcome: 'yes',
    shares: 80,
    avgPrice: 0.65,
    currentPrice: 0.71,
    pnl: 4.8,
    pnlPercent: 9.2,
  },
  {
    marketId: '5',
    market: mockMarkets[4],
    outcome: 'no',
    shares: 200,
    avgPrice: 0.52,
    currentPrice: 0.55,
    pnl: 6.0,
    pnlPercent: 5.8,
  },
]

export const mockTrades: Trade[] = [
  { id: '1', marketId: '1', marketTitle: 'Bitcoin超过150,000美元', type: 'buy', outcome: 'yes', shares: 150, price: 0.58, total: 87, timestamp: '2024-04-01T10:30:00Z' },
  { id: '2', marketId: '3', marketTitle: 'SEC批准比特币现货ETF', type: 'buy', outcome: 'yes', shares: 200, price: 0.72, total: 144, timestamp: '2024-01-05T14:20:00Z' },
  { id: '3', marketId: '3', marketTitle: 'SEC批准比特币现货ETF', type: 'sell', outcome: 'yes', shares: 200, price: 1.0, total: 200, timestamp: '2024-01-10T09:15:00Z' },
  { id: '4', marketId: '4', marketTitle: 'Arbitrum TVL超过Optimism', type: 'buy', outcome: 'yes', shares: 80, price: 0.65, total: 52, timestamp: '2024-03-15T16:45:00Z' },
  { id: '5', marketId: '5', marketTitle: 'Uniswap V4上线后TVL', type: 'buy', outcome: 'no', shares: 200, price: 0.52, total: 104, timestamp: '2024-04-05T11:00:00Z' },
]

export const mockUser: User = {
  id: '1',
  email: 'demo@example.com',
  username: 'CryptoWizard',
  walletAddress: '0x1234...5678',
  balance: 1250.50,
  totalPnl: 324.80,
  winRate: 68,
  marketsTraded: 24,
  joinedAt: '2023-12-01',
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
  { id: '1', userId: '2', username: 'BlockchainPro', content: '链上数据显示大量积累，看涨！', timestamp: '2024-04-10T10:00:00Z', likes: 24 },
  { id: '2', userId: '3', username: 'DeFiKing', content: '宏观环境不确定性太大，我选NO。减半虽然是利好但已经被价格消化了。', timestamp: '2024-04-09T15:30:00Z', likes: 18 },
  { id: '3', userId: '4', username: 'BTCMaxi', content: '历史上每次减半后12个月内都创新高，这次也不例外，YES稳了。', timestamp: '2024-04-08T09:20:00Z', likes: 41 },
  { id: '4', userId: '5', username: 'ETHBull', content: '机构资金持续流入BTC ETF，需求侧强劲支撑。', timestamp: '2024-04-07T14:10:00Z', likes: 15 },
]
