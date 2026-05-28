import { Market, PricePoint, Position, Trade, User, LeaderboardEntry, Comment } from '@/types'

export const mockMarkets: Market[] = [
  // --- BTC ---
  {
    id: '1',
    title: 'Bitcoin超过150,000美元 - 2024年底前？',
    description: '比特币价格是否会在2024年12月31日之前突破150,000美元？以Coinbase现货价格为准。',
    category: 'BTC', status: 'active', yesPrice: 0.67, noPrice: 0.33,
    volume: 2450000, liquidity: 890000, endDate: '2024-12-31', createdAt: '2024-01-15',
    tags: ['Bitcoin', 'Price', 'ATH'], commentCount: 234, participantCount: 1892,
  },
  {
    id: '2',
    title: 'BTC减半后6个月内达到新高？',
    description: '比特币第四次减半发生后6个月内，价格是否会创历史新高（超过73,000美元）？',
    category: 'BTC', status: 'active', yesPrice: 0.61, noPrice: 0.39,
    volume: 3210000, liquidity: 1100000, endDate: '2024-10-20', createdAt: '2024-04-20',
    tags: ['Bitcoin', 'Halving', 'ATH'], commentCount: 312, participantCount: 2156,
  },
  // --- ETH ---
  {
    id: '3',
    title: 'Ethereum质押量超过3000万ETH？',
    description: '以太坊网络总质押量是否会突破3000万ETH？',
    category: 'ETH', status: 'active', yesPrice: 0.82, noPrice: 0.18,
    volume: 1230000, liquidity: 450000, endDate: '2024-06-30', createdAt: '2024-02-01',
    tags: ['Ethereum', 'Staking'], commentCount: 89, participantCount: 654,
  },
  {
    id: '4',
    title: 'Solana单日交易量超过以太坊？',
    description: 'Solana网络单日交易笔数是否会超过以太坊主网+Layer2的总和？',
    category: 'ETH', status: 'active', yesPrice: 0.53, noPrice: 0.47,
    volume: 1560000, liquidity: 560000, endDate: '2024-12-31', createdAt: '2024-02-20',
    tags: ['Solana', 'Ethereum', 'TPS'], commentCount: 198, participantCount: 1234,
  },
  // --- DeFi ---
  {
    id: '5',
    title: 'Uniswap V4上线后TVL超过50亿美元？',
    description: 'Uniswap V4正式上线后90天内，TVL是否会超过50亿美元？',
    category: 'DeFi', status: 'active', yesPrice: 0.45, noPrice: 0.55,
    volume: 670000, liquidity: 240000, endDate: '2024-12-31', createdAt: '2024-04-01',
    tags: ['Uniswap', 'DeFi', 'TVL'], commentCount: 78, participantCount: 512,
  },
  // --- Layer2 ---
  {
    id: '6',
    title: 'Arbitrum TVL超过Optimism？',
    description: 'Arbitrum的总锁仓量(TVL)是否会超过Optimism，并在30天内保持领先？',
    category: 'Layer2', status: 'active', yesPrice: 0.71, noPrice: 0.29,
    volume: 890000, liquidity: 320000, endDate: '2024-09-30', createdAt: '2024-03-01',
    tags: ['Arbitrum', 'Optimism', 'TVL'], commentCount: 145, participantCount: 923,
  },
  // --- NFT ---
  {
    id: '7',
    title: 'NFT市场月交易量重返10亿美元？',
    description: 'OpenSea、Blur等主流NFT市场单月总交易量是否会重新超过10亿美元？',
    category: 'NFT', status: 'active', yesPrice: 0.28, noPrice: 0.72,
    volume: 340000, liquidity: 120000, endDate: '2024-12-31', createdAt: '2024-03-15',
    tags: ['NFT', 'OpenSea', 'Market'], commentCount: 43, participantCount: 287,
  },
  // --- Regulation ---
  {
    id: '8',
    title: 'SEC批准比特币现货ETF申请？',
    description: 'SEC是否会在2024年第一季度批准任何比特币现货ETF申请？',
    category: 'Regulation', status: 'resolved', yesPrice: 1, noPrice: 0,
    volume: 5670000, liquidity: 0, endDate: '2024-03-31', createdAt: '2023-11-01',
    resolvedOutcome: 'yes', tags: ['Bitcoin', 'ETF', 'SEC'], commentCount: 567, participantCount: 4231,
  },
  // --- Politics ---
  {
    id: '9',
    title: '特朗普赢得2024年美国总统大选？',
    description: '唐纳德·特朗普是否会赢得2024年美国总统大选，重返白宫？',
    category: 'Politics', status: 'resolved', yesPrice: 1, noPrice: 0,
    volume: 12400000, liquidity: 0, endDate: '2024-11-05', createdAt: '2024-01-01',
    resolvedOutcome: 'yes', tags: ['Trump', 'USA', 'Election'], commentCount: 1892, participantCount: 9823,
  },
  {
    id: '10',
    title: '美联储2024年降息超过3次？',
    description: '美联储在2024年是否会进行3次以上的降息操作？',
    category: 'Politics', status: 'active', yesPrice: 0.34, noPrice: 0.66,
    volume: 3200000, liquidity: 1200000, endDate: '2024-12-31', createdAt: '2024-01-10',
    tags: ['Fed', 'Interest Rate', 'Macro'], commentCount: 445, participantCount: 3211,
  },
  // --- Elections ---
  {
    id: '11',
    title: '英国工党赢得2024年大选？',
    description: '英国工党是否会在2024年英国大选中获胜并组建政府？',
    category: 'Elections', status: 'resolved', yesPrice: 1, noPrice: 0,
    volume: 2100000, liquidity: 0, endDate: '2024-07-04', createdAt: '2024-05-01',
    resolvedOutcome: 'yes', tags: ['UK', 'Labour', 'Election'], commentCount: 234, participantCount: 1654,
  },
  {
    id: '12',
    title: '法国2027年大选极右翼获胜？',
    description: '法国2027年总统大选，国民联盟或极右翼候选人是否会赢得最终胜利？',
    category: 'Elections', status: 'active', yesPrice: 0.44, noPrice: 0.56,
    volume: 890000, liquidity: 310000, endDate: '2027-04-30', createdAt: '2024-06-15',
    tags: ['France', 'Election', 'Le Pen'], commentCount: 167, participantCount: 892,
  },
  // --- Sports ---
  {
    id: '13',
    title: '巴西赢得2026年世界杯？',
    description: '巴西国家足球队是否会赢得2026年FIFA世界杯冠军？',
    category: 'Sports', status: 'active', yesPrice: 0.22, noPrice: 0.78,
    volume: 4500000, liquidity: 1800000, endDate: '2026-07-19', createdAt: '2024-01-01',
    tags: ['Football', 'World Cup', 'Brazil'], commentCount: 789, participantCount: 5432,
  },
  {
    id: '14',
    title: 'NBA总冠军：湖人队2025赛季夺冠？',
    description: '洛杉矶湖人队是否会赢得2024-25赛季NBA总冠军？',
    category: 'Sports', status: 'active', yesPrice: 0.12, noPrice: 0.88,
    volume: 2300000, liquidity: 890000, endDate: '2025-06-30', createdAt: '2024-10-01',
    tags: ['NBA', 'Lakers', 'LeBron'], commentCount: 543, participantCount: 3214,
  },
  {
    id: '15',
    title: '费德勒宣布复出参赛？',
    description: '罗杰·费德勒是否会在2025年宣布复出并参加至少一项ATP赛事？',
    category: 'Sports', status: 'active', yesPrice: 0.08, noPrice: 0.92,
    volume: 780000, liquidity: 290000, endDate: '2025-12-31', createdAt: '2024-03-01',
    tags: ['Tennis', 'Federer', 'ATP'], commentCount: 312, participantCount: 1876,
  },
  // --- Entertainment ---
  {
    id: '16',
    title: 'GTA VI 2025年内发售？',
    description: 'Rockstar Games的GTA VI是否会在2025年12月31日前正式发售？',
    category: 'Entertainment', status: 'active', yesPrice: 0.73, noPrice: 0.27,
    volume: 5600000, liquidity: 2100000, endDate: '2025-12-31', createdAt: '2024-01-15',
    tags: ['GTA6', 'Rockstar', 'Gaming'], commentCount: 1234, participantCount: 8921,
  },
  {
    id: '17',
    title: '《复仇者联盟5》全球票房超过30亿？',
    description: '漫威《复仇者联盟：审判日》全球票房是否会超过30亿美元？',
    category: 'Entertainment', status: 'active', yesPrice: 0.58, noPrice: 0.42,
    volume: 1200000, liquidity: 450000, endDate: '2026-12-31', createdAt: '2024-09-01',
    tags: ['Marvel', 'Avengers', 'Box Office'], commentCount: 456, participantCount: 3421,
  },
  // --- AI ---
  {
    id: '18',
    title: 'GPT-5在主要基准上超越GPT-4o？',
    description: 'OpenAI发布的GPT-5是否会在MMLU、HumanEval等主要基准测试中超越GPT-4o 20%以上？',
    category: 'AI', status: 'active', yesPrice: 0.85, noPrice: 0.15,
    volume: 3400000, liquidity: 1300000, endDate: '2025-06-30', createdAt: '2024-02-01',
    tags: ['OpenAI', 'GPT-5', 'Benchmark'], commentCount: 678, participantCount: 4532,
  },
  {
    id: '19',
    title: 'AGI在2026年前实现？',
    description: '主流AI研究机构（OpenAI/DeepMind/Anthropic等）是否会在2026年前宣布实现AGI（通用人工智能）？',
    category: 'AI', status: 'active', yesPrice: 0.19, noPrice: 0.81,
    volume: 6700000, liquidity: 2400000, endDate: '2026-12-31', createdAt: '2024-01-01',
    tags: ['AGI', 'OpenAI', 'DeepMind'], commentCount: 1456, participantCount: 12341,
  },
  {
    id: '20',
    title: 'Sora视频AI成为创作者主流工具？',
    description: 'OpenAI Sora是否会在2025年底前被超过100万创作者用于商业内容创作？',
    category: 'AI', status: 'active', yesPrice: 0.41, noPrice: 0.59,
    volume: 980000, liquidity: 380000, endDate: '2025-12-31', createdAt: '2024-02-15',
    tags: ['Sora', 'OpenAI', 'Video AI'], commentCount: 234, participantCount: 1892,
  },
  // --- Tech ---
  {
    id: '21',
    title: 'Apple Vision Pro出货量超过100万台？',
    description: 'Apple Vision Pro在2024年全年出货量是否会超过100万台？',
    category: 'Tech', status: 'active', yesPrice: 0.23, noPrice: 0.77,
    volume: 1800000, liquidity: 670000, endDate: '2024-12-31', createdAt: '2024-02-01',
    tags: ['Apple', 'Vision Pro', 'AR/VR'], commentCount: 345, participantCount: 2341,
  },
  {
    id: '22',
    title: 'SpaceX星舰完成首次轨道飞行并安全回收？',
    description: 'SpaceX Starship是否会在2024年完成完整的轨道飞行任务并成功回收两级火箭？',
    category: 'Tech', status: 'active', yesPrice: 0.69, noPrice: 0.31,
    volume: 2900000, liquidity: 1100000, endDate: '2024-12-31', createdAt: '2024-01-15',
    tags: ['SpaceX', 'Starship', 'Rocket'], commentCount: 567, participantCount: 4231,
  },
  // --- Economy ---
  {
    id: '23',
    title: '美国2024年陷入技术性衰退？',
    description: '美国GDP是否会在2024年连续两个季度出现负增长（技术性衰退）？',
    category: 'Economy', status: 'active', yesPrice: 0.18, noPrice: 0.82,
    volume: 4100000, liquidity: 1500000, endDate: '2024-12-31', createdAt: '2024-01-01',
    tags: ['USA', 'GDP', 'Recession'], commentCount: 678, participantCount: 5421,
  },
  {
    id: '24',
    title: '黄金2025年突破3000美元/盎司？',
    description: '黄金现货价格是否会在2025年12月31日前突破每盎司3000美元？',
    category: 'Economy', status: 'active', yesPrice: 0.76, noPrice: 0.24,
    volume: 3800000, liquidity: 1400000, endDate: '2025-12-31', createdAt: '2024-03-01',
    tags: ['Gold', 'Commodity', 'Inflation'], commentCount: 432, participantCount: 3214,
  },
  // --- World ---
  {
    id: '25',
    title: '俄乌冲突2024年内停火协议？',
    description: '俄罗斯和乌克兰是否会在2024年12月31日前签署正式停火或和平协议？',
    category: 'World', status: 'active', yesPrice: 0.21, noPrice: 0.79,
    volume: 7800000, liquidity: 2900000, endDate: '2024-12-31', createdAt: '2024-01-01',
    tags: ['Russia', 'Ukraine', 'Ceasefire'], commentCount: 2341, participantCount: 18923,
  },
  {
    id: '26',
    title: '台海局势：2025年前发生军事冲突？',
    description: '台湾海峡是否会在2025年12月31日前发生正式军事冲突（超过演习范围）？',
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
      time: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
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
  { id: '1', marketId: '1', marketTitle: 'Bitcoin超过150,000美元', type: 'buy', outcome: 'yes', shares: 150, price: 0.58, total: 87, timestamp: '2024-04-01T10:30:00Z' },
  { id: '2', marketId: '8', marketTitle: 'SEC批准比特币现货ETF', type: 'buy', outcome: 'yes', shares: 200, price: 0.72, total: 144, timestamp: '2024-01-05T14:20:00Z' },
  { id: '3', marketId: '8', marketTitle: 'SEC批准比特币现货ETF', type: 'sell', outcome: 'yes', shares: 200, price: 1.0, total: 200, timestamp: '2024-01-10T09:15:00Z' },
  { id: '4', marketId: '18', marketTitle: 'GPT-5超越GPT-4o', type: 'buy', outcome: 'yes', shares: 200, price: 0.75, total: 150, timestamp: '2024-04-05T11:00:00Z' },
  { id: '5', marketId: '16', marketTitle: 'GTA VI 2025年内发售', type: 'buy', outcome: 'yes', shares: 100, price: 0.65, total: 65, timestamp: '2024-03-20T16:00:00Z' },
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
  { id: '1', userId: '2', username: 'BlockchainPro', content: '链上数据显示大量积累，看涨！', timestamp: '2024-04-10T10:00:00Z', likes: 24 },
  { id: '2', userId: '3', username: 'DeFiKing', content: '宏观环境不确定性太大，我选NO。减半虽然是利好但已经被价格消化了。', timestamp: '2024-04-09T15:30:00Z', likes: 18 },
  { id: '3', userId: '4', username: 'BTCMaxi', content: '历史上每次减半后12个月内都创新高，这次也不例外，YES稳了。', timestamp: '2024-04-08T09:20:00Z', likes: 41 },
  { id: '4', userId: '5', username: 'ETHBull', content: '机构资金持续流入BTC ETF，需求侧强劲支撑。', timestamp: '2024-04-07T14:10:00Z', likes: 15 },
]
