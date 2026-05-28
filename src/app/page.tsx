'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Search, Zap, Flame } from 'lucide-react'
import { MarketCard } from '@/components/markets/MarketCard'
import { useMarkets } from '@/hooks/useMarkets'
import { MarketCategory, Market } from '@/types'
import { cn, formatVolume } from '@/lib/utils'

type SortType = 'volume' | 'newest' | 'ending'

type CategoryOption = {
  label: string
  value: MarketCategory | 'All' | '__hot__' | '__breaking__' | '__new__'
  sort?: SortType
}

const categoryPills: CategoryOption[] = [
  { label: '热门', value: '__hot__', sort: 'volume' },
  { label: '突发', value: '__breaking__', sort: 'newest' },
  { label: '最新', value: '__new__', sort: 'newest' },
  { label: '全部', value: 'All' },
  { label: 'BTC', value: 'BTC' },
  { label: 'ETH', value: 'ETH' },
  { label: 'DeFi', value: 'DeFi' },
  { label: '政治', value: 'Politics' },
  { label: '选举', value: 'Elections' },
  { label: '体育', value: 'Sports' },
  { label: 'AI', value: 'AI' },
  { label: '科技', value: 'Tech' },
  { label: '娱乐', value: 'Entertainment' },
  { label: '世界', value: 'World' },
  { label: '经济', value: 'Economy' },
  { label: '监管', value: 'Regulation' },
]

const SPECIAL_VALUES = new Set(['__hot__', '__breaking__', '__new__'])

function isMarketCategory(v: string): v is MarketCategory | 'All' {
  return !SPECIAL_VALUES.has(v)
}

function MarketCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 animate-pulse">
      <div className="flex gap-3 mb-3">
        <div className="w-12 h-12 bg-gray-800 rounded-xl shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-800 rounded w-1/2" />
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="h-8 bg-gray-800 rounded w-16" />
        <div className="flex gap-2">
          <div className="h-7 bg-gray-800 rounded-full w-16" />
          <div className="h-7 bg-gray-800 rounded-full w-16" />
        </div>
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-800/60">
        <div className="h-3 bg-gray-800 rounded w-1/3" />
        <div className="h-3 bg-gray-800 rounded w-4" />
      </div>
    </div>
  )
}

function TrendingSidebar({ markets }: { markets: Market[] }) {
  const top5 = markets.filter(m => m.status === 'active').slice(0, 5)
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 sticky top-20">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-400" /> 热门市场
      </h3>
      {top5.map((m, i) => (
        <Link
          key={m.id}
          href={`/markets/${m.id}`}
          className="flex items-start gap-3 py-2.5 border-b border-gray-800/60 last:border-0 hover:bg-gray-800/30 -mx-4 px-4 transition-colors"
        >
          <span className="text-xs text-gray-600 w-4 shrink-0 mt-0.5">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white font-medium line-clamp-2 leading-snug">{m.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatVolume(m.volume)}</p>
          </div>
          <span className="text-sm font-bold text-emerald-400 shrink-0">
            {Math.round(m.yesPrice * 100)}%
          </span>
        </Link>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [activePill, setActivePill] = useState<string>('__hot__')
  const [sort, setSort] = useState<SortType>('volume')
  const [showResolved, setShowResolved] = useState(false)

  // Derive category from active pill
  const category: MarketCategory | 'All' = useMemo(() => {
    if (isMarketCategory(activePill)) return activePill as MarketCategory | 'All'
    return 'All'
  }, [activePill])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { markets, isLoading } = useMarkets({ category, sort, search, showResolved })

  const activeCount = useMemo(() => markets.filter(m => m.status === 'active').length, [markets])

  // All markets for sidebar (always sorted by volume)
  const { markets: sidebarMarkets } = useMarkets({ category: 'All', sort: 'volume', search: '', showResolved: false })

  function handlePillClick(pill: CategoryOption) {
    setActivePill(pill.value)
    if (pill.sort) {
      setSort(pill.sort)
    }
  }

  const pillLabel = useMemo(() => {
    const found = categoryPills.find(p => p.value === activePill)
    return found?.label ?? '全部'
  }, [activePill])

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Compact stats bar */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 flex-wrap">
        <Flame className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-white font-medium">{activeCount} 个活跃市场</span>
        <span className="text-gray-600">·</span>
        <span>$87.4M 总交易量</span>
        <span className="text-gray-600">·</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          实时更新
        </span>
      </div>

      {/* Search bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="搜索市场、标签..."
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-700 bg-gray-900 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
      </div>

      {/* Category nav — single scrollable row */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-hide">
        {categoryPills.map(pill => (
          <button
            key={pill.value}
            onClick={() => handlePillClick(pill)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              activePill === pill.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white border border-gray-700'
            )}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Sort row */}
      <div className="flex items-center justify-between mb-4 mt-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">
            {searchInput ? `搜索: ${searchInput}` : pillLabel}
            <span className="text-gray-500 font-normal ml-2">({markets.length})</span>
          </span>
          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-3 h-3 accent-blue-600"
              checked={showResolved}
              onChange={e => setShowResolved(e.target.checked)}
            />
            显示已结算
          </label>
        </div>
        <select
          className="h-8 px-2 rounded-lg border border-gray-700 bg-gray-900 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={sort}
          onChange={e => setSort(e.target.value as SortType)}
        >
          <option value="volume">按交易量</option>
          <option value="newest">最新创建</option>
          <option value="ending">即将结束</option>
        </select>
      </div>

      {/* Main layout: 3-col grid + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Market grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => <MarketCardSkeleton key={i} />)}
            </div>
          ) : markets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
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

        {/* Sidebar */}
        <div className="lg:col-span-1 hidden lg:block">
          <TrendingSidebar markets={sidebarMarkets} />
        </div>
      </div>
    </div>
  )
}
