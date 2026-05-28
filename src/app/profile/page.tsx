'use client'

import { useState } from 'react'
import { User, TrendingUp, Trophy, BarChart2, Calendar, Wallet, Edit2, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { LoginModal } from '@/components/auth/LoginModal'
import { mockTrades, mockPositions } from '@/lib/mock-data'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const { user, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth()
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState(user?.username || '')
  const [saved, setSaved] = useState(false)

  if (!user) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">个人资料</h2>
          <p className="text-gray-400 mb-6">登录后查看个人资料</p>
          <Button onClick={openLoginModal}>登录 / 注册</Button>
        </div>
        <LoginModal open={isLoginModalOpen} onClose={closeLoginModal} />
      </>
    )
  }

  const handleSaveUsername = () => {
    setSaved(true)
    setEditingUsername(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const stats = [
    { label: '总盈亏', value: `+${formatCurrency(user.totalPnl)}`, color: 'text-emerald-400', icon: TrendingUp },
    { label: '胜率', value: `${user.winRate}%`, color: 'text-blue-400', icon: Trophy },
    { label: '交易市场数', value: user.marketsTraded, color: 'text-purple-400', icon: BarChart2 },
    { label: '加入时间', value: formatDate(user.joinedAt), color: 'text-gray-400', icon: Calendar },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile card */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
              {user.username[0]}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-gray-900" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {editingUsername ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    className="h-8 w-40 text-sm"
                    autoFocus
                  />
                  <button onClick={handleSaveUsername} className="text-emerald-400 hover:text-emerald-300">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-white">{user.username}</h1>
                  <button onClick={() => setEditingUsername(true)} className="text-gray-500 hover:text-gray-300 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {saved && <span className="text-xs text-emerald-400">已保存</span>}
                </>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-2">{user.email}</p>
            <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-800 rounded-lg px-3 py-1.5 w-fit">
              <Wallet className="w-3.5 h-3.5" />
              <span className="font-mono">{user.walletAddress}</span>
            </div>
          </div>

          {/* Balance */}
          <div className="sm:text-right">
            <p className="text-xs text-gray-500 mb-1">可用余额</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(user.balance)}</p>
            <div className="flex sm:justify-end gap-2 mt-2">
              <Button size="sm" variant="outline">充值</Button>
              <Button size="sm" variant="secondary">提现</Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-800">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <stat.icon className={cn('w-4 h-4 mx-auto mb-1', stat.color)} />
              <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">最近交易</h2>
        <div className="space-y-3">
          {mockTrades.slice(0, 5).map(trade => (
            <div key={trade.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0', trade.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}>
                {trade.type === 'buy' ? '↑' : '↓'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{trade.marketTitle}</p>
                <p className="text-xs text-gray-500">
                  {trade.type === 'buy' ? '买入' : '卖出'} {trade.outcome.toUpperCase()} · {trade.shares}份 · {Math.round(trade.price * 100)}¢
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={cn('text-sm font-medium', trade.type === 'sell' ? 'text-emerald-400' : 'text-white')}>
                  {trade.type === 'sell' ? '+' : '-'}${trade.total}
                </p>
                <p className="text-xs text-gray-600">{formatDate(trade.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
