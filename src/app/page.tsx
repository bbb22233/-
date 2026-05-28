'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, TrendingUp, Flame, Zap } from 'lucide-react'
import { MarketCard } from '@/components/markets/MarketCard'
import { useMarkets } from '@/hooks/useMarkets'
import { MarketCategory } from '@/types'
import { cn } from '@/lib/utils'

type CategoryOption = { label: string; value: MarketCategory | 'All' }

const categoryGroups: { label: string; items: CategoryOption[] }[] = [
  {
    label: '加密货币',
    items: [
      { label: '全部', value: 'All' },
      { label: '₿ BTC', value: 'BTC' },
      { label: 'Ξ ETH', value: 'ETH' },
      { label: 'DeFi', value: 'DeFi' },
      { label: 'Layer2', value: 'Layer2' },
      { label: 'NFT', value: 'NFT' },
      { label: '监管', value: 'Regulation' },
    ],
  },
  {
    label: '时事',
    items: [
      { label: '🗳 政治', value: 'Politics' },
      { label: '🗳 选举', value: 'Elections' },
      { label: '🌍 世界', value: 'World' },
      { label: '📈 经济', value: 'Economy' },
    ],
  },
  {
    label: '科技娱乐',
    items: [
      { label: '🤖 AI', value: 'AI' },
      { label: '💻 科技', value: 'Tech' },
      { label: '⚽ 体育', value: 'Sports' },
      { label: '🎬 娱乐', value: 'Entertainment' },
    ],
  },
]

const allCategories: CategoryOption[] = categoryGroups.flatMap(g => g.items)

type SortType = 'volume' | 'newest' | 'ending'

function MarketCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-800 rounded w-1/2 mb-4" />
      <div className="h-2 bg-gray-800 rounded-full mb-3" />
      <div className="flex justify-between">
        <div className="h-3 bg-gray-800 rounded w-1/4" />
        <div className="h-3 bg-gray-800 rounded w-1/4" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<MarketCategory | 'All'>('All')
  const [sort, setSort] = useState<SortType>('volume')
  const [showResolved, setShowResolved] = useState(false)

  // Debounce search: wait 300ms after user stops typing before fetching
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { markets, isLoading } = useMarkets({ category, sort, search, showResolved })

  // Featured = top 4 active markets by volume (already sorted by volume from API)
  const featured = useMemo(
    () => markets.filter(m => m.status === 'active').slice(0, 4),
    [markets]
  )

  const activeCount = useMemo(() => markets.filter(m => m.status === 'active').length, [markets])
  const totalCount = markets.length

  const stats = [
    { label: '总交易量', value: '$87.4M', icon: TrendingUp, color: 'text-blue-400' },
    { label: '活跃市场', value: String(activeCount), icon: Flame, color: 'text-orange-400' },
    { label: '市场总数', value: String(totalCount), icon: Zap, color: 'text-yellow-400' },
  ]

  const showFeatured = category === 'All' && !searchInput

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-blue-400 text-sm mb-3">
          <Zap className="w-4 h-4" />
          <span>基于链上智能合约，公开透明</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          预测任何事件的结果
        </h1>
        <p className="text-gray-400 text-lg mb-6 max-w-2xl">
          加密货币、政治、体育、AI……对你的判断下注，赢取收益。
        </p>
        <div className="flex flex-wrap gap-3">
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

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="搜索市场、标签..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-700 bg-gray-900 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
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

      {/* Category filter - grouped */}
      <div className="mb-6 space-y-2">
        {categoryGroups.map(group => (
          <div key={group.label} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-14 shrink-0 hidden sm:block">{group.label}</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 flex-wrap">
              {group.items.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0',
                    category === cat.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-gray-600 w-14 shrink-0 hidden sm:block" />
          <button
            onClick={() => setShowResolved(!showResolved)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              showResolved ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300'
            )}
          >
            {showResolved ? '✓ 显示已结算' : '显示已结算'}
          </button>
        </div>
      </div>

      {/* Featured section */}
      {showFeatured && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-white">热门市场</h2>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <MarketCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {featured.map(market => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* All markets */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">
          {category === 'All' ? '全部市场' : allCategories.find(c => c.value === category)?.label}
          <span className="text-gray-500 font-normal ml-2">({markets.length})</span>
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <MarketCardSkeleton key={i} />)}
        </div>
      ) : markets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {markets.map(market => (
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
