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
  { label: 'AI', value: 'AI' },
  { label: '政治', value: 'Politics' },
  { label: '体育', value: 'Sports' },
  { label: '娱乐', value: 'Entertainment' },
]

function Skeleton() {
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
    <div className="max-w-3xl mx-auto px-4 py-6">
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

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {categories.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              category === c.value
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-700 bg-gray-900 text-gray-400 hover:text-white'
            )}
          >
            {c.label}
          </button>
        ))}
        <select
          className="shrink-0 h-7 px-2 rounded-full border border-gray-700 bg-gray-900 text-xs text-gray-400 focus:outline-none"
          value={sort}
          onChange={e => setSort(e.target.value as SortType)}
        >
          <option value="volume">按交易量</option>
          <option value="newest">最新</option>
          <option value="ending">即将结束</option>
        </select>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : markets.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          {search ? `没有找到"${search}"相关市场` : '暂无市场'}
        </div>
      ) : (
        <div className="grid gap-3">
          {markets.map(m => <MarketCard key={m.id} market={m} />)}
        </div>
      )}
    </div>
  )
}
