'use client'

import { useState, useMemo } from 'react'
import { Search, TrendingUp, Flame, Clock, ChevronRight, Zap } from 'lucide-react'
import { MarketCard } from '@/components/markets/MarketCard'
import { mockMarkets } from '@/lib/mock-data'
import { MarketCategory } from '@/types'
import { formatVolume } from '@/lib/utils'
import { cn } from '@/lib/utils'

const categories: { label: string; value: MarketCategory | 'All' }[] = [
  { label: '全部', value: 'All' },
  { label: '₿ BTC', value: 'BTC' },
  { label: 'Ξ ETH', value: 'ETH' },
  { label: 'DeFi', value: 'DeFi' },
  { label: 'Layer2', value: 'Layer2' },
  { label: '监管', value: 'Regulation' },
  { label: 'NFT', value: 'NFT' },
]

type SortType = 'volume' | 'newest' | 'ending'

const stats = [
  { label: '总交易量', value: '$14.2M', icon: TrendingUp, color: 'text-blue-400' },
  { label: '活跃市场', value: '7', icon: Flame, color: 'text-orange-400' },
  { label: '本周新增', value: '3', icon: Zap, color: 'text-yellow-400' },
]

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<MarketCategory | 'All'>('All')
  const [sort, setSort] = useState<SortType>('volume')
  const [showResolved, setShowResolved] = useState(false)

  const filtered = useMemo(() => {
    let list = mockMarkets
    if (!showResolved) list = list.filter(m => m.status !== 'resolved')
    if (category !== 'All') list = list.filter(m => m.category === category)
    if (search) list = list.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) || m.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
    if (sort === 'volume') list = [...list].sort((a, b) => b.volume - a.volume)
    if (sort === 'newest') list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (sort === 'ending') list = [...list].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    return list
  }, [search, category, sort, showResolved])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-blue-400 text-sm mb-3">
          <Zap className="w-4 h-4" />
          <span>基于链上智能合约，公开透明</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          预测加密货币市场走势
        </h1>
        <p className="text-gray-400 text-lg mb-6 max-w-2xl">
          对你的判断下注，赢取收益。支持邮箱登录，自动生成智能钱包，无需助记词。
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5">
              <s.icon className={cn('w-4 h-4', s.color)} />
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-sm font-bold text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="搜索市场、标签..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-700 bg-gray-900 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 px-3 rounded-lg border border-gray-700 bg-gray-900 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sort}
          onChange={e => setSort(e.target.value as SortType)}
        >
          <option value="volume">按交易量</option>
          <option value="newest">最新创建</option>
          <option value="ending">即将结束</option>
        </select>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0',
              category === cat.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
            )}
          >
            {cat.label}
          </button>
        ))}
        <button
          onClick={() => setShowResolved(!showResolved)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 border',
            showResolved ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-gray-300'
          )}
        >
          {showResolved ? '隐藏' : '显示'}已结算
        </button>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{filtered.length} 个市场</p>
      </div>

      {/* Market grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(market => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>没有找到匹配的市场</p>
        </div>
      )}
    </div>
  )
}
