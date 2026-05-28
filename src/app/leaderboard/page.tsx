'use client'

import { useState } from 'react'
import { Trophy, TrendingUp, Crown } from 'lucide-react'
import { mockLeaderboard } from '@/lib/mock-data'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Period = 'all' | 'month' | 'week'

const medalColors: Record<number, string> = {
  1: 'text-yellow-400',
  2: 'text-gray-300',
  3: 'text-orange-400',
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<Period>('all')

  const myRank = mockLeaderboard.find(e => e.user.username === user?.username)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">排行榜</h1>
          <p className="text-gray-400 text-sm">按总收益排名</p>
        </div>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[mockLeaderboard[1], mockLeaderboard[0], mockLeaderboard[2]].map((entry, visualIndex) => {
          const isCenter = visualIndex === 1
          return (
            <div
              key={entry.rank}
              className={cn(
                'rounded-xl border bg-gray-900 p-4 text-center transition-all',
                isCenter ? 'border-yellow-500/50 bg-yellow-500/5 scale-105' : 'border-gray-800',
              )}
            >
              <div className="mb-2">
                {entry.rank === 1 ? (
                  <Crown className="w-6 h-6 text-yellow-400 mx-auto" />
                ) : (
                  <span className={cn('text-lg font-bold', medalColors[entry.rank] || 'text-gray-400')}>
                    #{entry.rank}
                  </span>
                )}
              </div>
              <div className={cn('w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold text-white', isCenter ? 'bg-yellow-500' : 'bg-blue-600')}>
                {entry.user.username[0]}
              </div>
              <p className="text-xs font-medium text-white truncate">{entry.user.username}</p>
              <p className="text-sm font-bold text-emerald-400 mt-1">+{formatCurrency(entry.profit)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{entry.winRate}% 胜率</p>
            </div>
          )
        })}
      </div>

      {/* Period filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'month', 'week'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm transition-colors',
              period === p ? 'bg-blue-600 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'
            )}
          >
            {p === 'all' ? '全部时间' : p === 'month' ? '本月' : '本周'}
          </button>
        ))}
      </div>

      {/* My rank banner */}
      {user && myRank && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 mb-4 flex items-center gap-4">
          <span className="text-sm text-blue-400 font-medium">我的排名</span>
          <span className="text-2xl font-bold text-white">#{myRank.rank}</span>
          <div className="ml-auto text-right">
            <p className="text-sm font-bold text-emerald-400">+{formatCurrency(myRank.profit)}</p>
            <p className="text-xs text-gray-500">{myRank.winRate}% 胜率</p>
          </div>
        </div>
      )}

      {/* Full leaderboard */}
      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/50">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium w-12">排名</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">用户</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">总收益</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium hidden sm:table-cell">胜率</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium hidden md:table-cell">参与市场</th>
            </tr>
          </thead>
          <tbody>
            {mockLeaderboard.map((entry, i) => (
              <tr
                key={entry.rank}
                className={cn(
                  'border-b border-gray-800/50 transition-colors',
                  i === mockLeaderboard.length - 1 && 'border-0',
                  user?.username === entry.user.username ? 'bg-blue-500/5' : 'hover:bg-gray-800/30'
                )}
              >
                <td className="px-4 py-3.5">
                  <span className={cn('font-bold text-sm', medalColors[entry.rank] || 'text-gray-500')}>
                    {entry.rank <= 3 ? `#${entry.rank}` : entry.rank}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white', entry.rank === 1 ? 'bg-yellow-500' : 'bg-gradient-to-br from-blue-600 to-purple-600')}>
                      {entry.user.username[0]}
                    </div>
                    <span className={cn('text-sm font-medium', user?.username === entry.user.username ? 'text-blue-400' : 'text-white')}>
                      {entry.user.username}
                      {user?.username === entry.user.username && ' (我)'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <span className="text-emerald-400 font-semibold text-sm">+{formatCurrency(entry.profit)}</span>
                </td>
                <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="w-16 h-1.5 rounded-full bg-gray-800 hidden lg:block">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${entry.winRate}%` }} />
                    </div>
                    <span className="text-gray-300 text-xs">{entry.winRate}%</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right text-gray-400 text-xs hidden md:table-cell">{entry.marketsTraded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
