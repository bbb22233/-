'use client'

import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { MarketCard } from '@/components/markets/MarketCard'
import { useMarkets } from '@/hooks/useMarkets'
import { MarketCategory } from '@/types'
import { cn } from '@/lib/utils'

type SortType = 'volume' | 'newest' | 'ending'

const categories: { label: string; value: MarketCategory | 'All' }[] = [
  { label: '全部', value: 'All' },
  { label: 'BTC', value: 'BTC' },
  { label: 'ETH', value: 'ETH' },
  { label: 'DeFi', value: 'DeFi' },
  { label: 'Layer2', value: 'Layer2' },
  { label: 'NFT', value: 'NFT' },
  { label: 'AI', value: 'AI' },
  { label: '政治', value: 'Politics' },
  { label: '选举', value: 'Elections' },
  { label: '体育', value: 'Sports' },
  { label: '娱乐', value: 'Entertainment' },
  { label: '科技', value: 'Tech' },
  { label: '经济', value: 'Economy' },
  { label: '世界', value: 'World' },
  { label: '监管', value: 'Regulation' },
]

function Skeleton() {
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

export default function MarketsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<MarketCategory | 'All'>('All')
  const [sort, setSort] = useState<SortType>('volume')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { markets, isLoading } = useMarkets({ category, sort, search })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索市场..."
          className="w-full h-11 pl-9 pr-4 rounded-xl border border-gray-700 bg-gray-900 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
      </div>

      {/* Category pills — single scrollable row */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {categories.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              category === c.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white border border-gray-700'
            )}
          >
            {c.label}
          </button>
        ))}
        <select
          className="shrink-0 h-7 px-2 rounded-full border border-gray-700 bg-gray-900 text-xs text-gray-400 focus:outline-none ml-1"
          value={sort}
          onChange={e => setSort(e.target.value as SortType)}
        >
          <option value="volume">按交易量</option>
          <option value="newest">最新</option>
          <option value="ending">即将结束</option>
        </select>
      </div>

      {/* Count row */}
      <p className="text-xs text-gray-500 mb-3">
        {search ? `搜索"${search}"` : categories.find(c => c.value === category)?.label} · {markets.length} 个市场
      </p>

      {/* Results — 2-column grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : markets.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          {search ? `没有找到"${search}"相关市场` : '暂无市场'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {markets.map(m => <MarketCard key={m.id} market={m} />)}
        </div>
      )}
    </div>
  )
}
