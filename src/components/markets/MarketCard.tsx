'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Users, MessageCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { Market } from '@/types'
import { Badge } from '@/components/ui/badge'
import { formatVolume, timeUntil, getCategoryColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MarketCardProps {
  market: Market
}

export const MarketCard = memo(function MarketCard({ market }: MarketCardProps) {
  const yesPercent = Math.round(market.yesPrice * 100)
  const isResolved = market.status === 'resolved'

  return (
    <Link href={`/markets/${market.id}`}>
      <div className="group rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800/80 transition-all duration-200 p-5 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium', getCategoryColor(market.category))}>
              {market.category}
            </span>
            {isResolved && (
              <Badge variant={market.resolvedOutcome === 'yes' ? 'success' : 'danger'}>
                {market.resolvedOutcome === 'yes' ? 'YES 胜出' : 'NO 胜出'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
            <Clock className="w-3 h-3" />
            {timeUntil(market.endDate)}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-white mb-4 line-clamp-2 group-hover:text-blue-300 transition-colors">
          {market.title}
        </h3>

        {/* Price bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-emerald-400 font-medium">YES {yesPercent}%</span>
            <span className="text-red-400 font-medium">NO {100 - yesPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${yesPercent}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {formatVolume(market.volume)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {market.participantCount.toLocaleString()}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {market.commentCount}
          </span>
        </div>
      </div>
    </Link>
  )
})
