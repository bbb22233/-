export type MarketCategory =
  | 'All'
  | 'BTC' | 'ETH' | 'DeFi' | 'Layer2' | 'NFT' | 'Regulation'
  | 'Politics' | 'Elections' | 'Sports' | 'Entertainment'
  | 'AI' | 'Tech' | 'Economy' | 'World'

export type MarketStatus = 'active' | 'resolved' | 'pending'

export type TradeType = 'buy' | 'sell'
export type OutcomeType = 'yes' | 'no'

export interface Market {
  id: string
  title: string
  description: string
  category: MarketCategory
  status: MarketStatus
  yesPrice: number
  noPrice: number
  volume: number
  liquidity: number
  endDate: string
  createdAt: string
  resolvedOutcome?: 'yes' | 'no'
  imageUrl?: string
  tags: string[]
  commentCount: number
  participantCount: number
}

export interface PricePoint {
  time: string
  yes: number
  no: number
}

export interface Position {
  marketId: string
  market: Market
  outcome: OutcomeType
  shares: number
  avgPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
}

export interface Trade {
  id: string
  marketId: string
  marketTitle: string
  type: TradeType
  outcome: OutcomeType
  shares: number
  price: number
  total: number
  timestamp: string
}

export interface User {
  id: string
  email: string
  username: string
  avatarUrl?: string
  walletAddress: string
  balance: number
  totalPnl: number
  winRate: number
  marketsTraded: number
  joinedAt: string
}

export interface LeaderboardEntry {
  rank: number
  user: User
  profit: number
  winRate: number
  marketsTraded: number
}

export interface Comment {
  id: string
  userId: string
  username: string
  avatarUrl?: string
  content: string
  timestamp: string
  likes: number
}
