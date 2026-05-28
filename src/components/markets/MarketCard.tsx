'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Users, Bookmark } from 'lucide-react'
import { Market } from '@/types'
import { formatVolume, timeUntil, getCategoryColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MarketCardProps {
  market: Market
}

function getCategoryGradient(category: string): string {
  const map: Record<string, string> = {
    BTC: 'from-orange-500 to-amber-600',
    ETH: 'from-blue-500 to-indigo-600',
    DeFi: 'from-purple-500 to-violet-600',
    Layer2: 'from-cyan-500 to-sky-600',
    NFT: 'from-pink-500 to-rose-600',
    Regulation: 'from-red-500 to-rose-600',
    Politics: 'from-rose-500 to-red-600',
    Elections: 'from-red-500 to-orange-600',
    Sports: 'from-green-500 to-emerald-600',
    Entertainment: 'from-yellow-500 to-amber-600',
    AI: 'from-violet-500 to-purple-600',
    Tech: 'from-sky-500 to-blue-600',
    Economy: 'from-emerald-500 to-teal-600',
    World: 'from-indigo-500 to-blue-600',
  }
  return map[category] || 'from-gray-600 to-gray-700'
}

function getCategoryInitial(category: string): string {
  const map: Record<string, string> = {
    BTC: '₿',
    ETH: 'Ξ',
    DeFi: 'D',
    Layer2: 'L2',
    NFT: 'N',
    Regulation: '⚖',
    Politics: '🗳',
    Elections: '🗳',
    Sports: '⚽',
    Entertainment: '🎬',
    AI: '🤖',
    Tech: '💻',
    Economy: '📈',
    World: '🌍',
  }
  return map[category] || category[0]
}

function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    BTC: 'BTC',
    ETH: 'ETH',
    DeFi: 'DeFi',
    Layer2: 'Layer2',
    NFT: 'NFT',
    Regulation: 'Regulation',
    Politics: 'Politics',
    Elections: 'Elections',
    Sports: 'Sports',
    Entertainment: 'Entertainment',
    AI: 'AI',
    Tech: 'Tech',
    Economy: 'Economy',
    World: 'World',
  }
  return map[category] || category
}

export const MarketCard = memo(function MarketCard({ market }: MarketCardProps) {
  const yesPercent = Math.round(market.yesPrice * 100)
  const isResolved = market.status === 'resolved'
  const gradient = getCategoryGradient(market.category)
  const initial = getCategoryInitial(market.category)
  const categoryLabel = getCategoryLabel(market.category)

  return (
    <Link href={`/markets/${market.id}`}>
      <div className="rounded-2xl border border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800/60 transition-all p-4 cursor-pointer h-full flex flex-col">
        {/* Top row: icon + title + meta */}
        <div className="flex items-start gap-3 mb-3">
          {/* Category icon */}
          <div
            className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 text-white text-lg font-bold select-none',
              gradient
            )}
          >
            {initial}
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug mb-1">
              {market.title}
            </h3>
            <p className="text-xs text-gray-500">
              {categoryLabel} · Closes {new Date(market.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Middle: price + buttons */}
        <div className="flex items-center justify-between mb-3 flex-1">
          {/* Percentage + label */}
          {isResolved ? (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-700 text-gray-300">
                Resolved
              </span>
              <span className={cn(
                'text-sm font-bold',
                market.resolvedOutcome === 'yes' ? 'text-emerald-400' : 'text-red-400'
              )}>
                {market.resolvedOutcome === 'yes' ? 'YES wins' : 'NO wins'}
              </span>
            </div>
          ) : (
            <div>
              <p className={cn(
                'text-2xl font-bold leading-none',
                yesPercent >= 50 ? 'text-emerald-400' : 'text-gray-300'
              )}>
                {yesPercent}%
              </p>
              <p className="text-xs text-gray-500 mt-0.5">YES</p>
            </div>
          )}

          {/* YES / NO pill buttons (only for active) */}
          {!isResolved && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-600 text-emerald-400 hover:bg-emerald-600/10 transition-colors">
                YES ↑
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold border border-red-600 text-red-400 hover:bg-red-600/10 transition-colors">
                NO ↓
              </span>
            </div>
          )}
        </div>

        {/* Bottom: volume + participants + bookmark */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-800/60">
          <div className="flex items-center gap-3">
            <span>{formatVolume(market.volume)} vol.</span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {market.participantCount.toLocaleString()}
            </span>
          </div>
          <Bookmark className="w-3.5 h-3.5 text-gray-600 hover:text-gray-400 transition-colors" />
        </div>
      </div>
    </Link>
  )
})
