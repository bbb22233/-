'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Clock, ArrowUpRight, Wallet, BarChart2, History } from 'lucide-react'
import { mockPositions, mockTrades, mockUser } from '@/lib/mock-data'
import { useAuth } from '@/hooks/useAuth'
import { LoginModal } from '@/components/auth/LoginModal'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Tab = 'positions' | 'history'

export default function PortfolioPage() {
  const { user, openLoginModal, isLoginModalOpen, closeLoginModal } = useAuth()
  const [tab, setTab] = useState<Tab>('positions')

  const totalValue = mockPositions.reduce((s, p) => s + p.shares * p.currentPrice, 0)
  const totalPnl = mockPositions.reduce((s, p) => s + p.pnl, 0)
  const totalInvested = mockPositions.reduce((s, p) => s + p.shares * p.avgPrice, 0)

  if (!user) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">查看你的持仓</h2>
          <p className="text-gray-400 mb-6">登录后查看你的所有持仓和交易记录</p>
          <button onClick={openLoginModal} className="px-6 py-3 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors">
            登录 / 注册
          </button>
        </div>
        <LoginModal open={isLoginModalOpen} onClose={closeLoginModal} />
      </>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">我的持仓</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '可用余额', value: formatCurrency(user.balance), icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: '持仓市值', value: formatCurrency(totalValue), icon: BarChart2, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: '总盈亏', value: `+${formatCurrency(totalPnl)}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: '总投入', value: formatCurrency(totalInvested), icon: History, color: 'text-gray-400', bg: 'bg-gray-700' },
        ].map(card => (
          <div key={card.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', card.bg)}>
              <card.icon className={cn('w-4 h-4', card.color)} />
            </div>
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className={cn('text-lg font-bold', card.color)}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-6">
        {(['positions', 'history'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
              tab === t ? 'text-white border-blue-500' : 'text-gray-500 border-transparent hover:text-gray-300'
            )}
          >
            {t === 'positions' ? `持仓中 (${mockPositions.length})` : `交易记录 (${mockTrades.length})`}
          </button>
        ))}
      </div>

      {tab === 'positions' && (
        <div className="space-y-3">
          {mockPositions.map(pos => (
            <Link key={pos.marketId} href={`/markets/${pos.marketId}`}>
              <div className="rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-600 transition-all p-5 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn(
                        'px-2 py-0.5 rounded-md text-xs font-bold',
                        pos.outcome === 'yes' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      )}>
                        {pos.outcome.toUpperCase()}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <h3 className="text-sm font-medium text-white truncate mb-1">{pos.market.title}</h3>
                    <p className="text-xs text-gray-500">{pos.shares} 份 · 均价 {Math.round(pos.avgPrice * 100)}¢</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-white mb-1">
                      {formatCurrency(pos.shares * pos.currentPrice)}
                    </p>
                    <p className={cn('text-sm font-medium flex items-center gap-1 justify-end', pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {pos.pnl >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {pos.pnl >= 0 ? '+' : ''}{formatCurrency(pos.pnl)}
                      <span className="text-xs">({pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(1)}%)</span>
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>当前价格 {Math.round(pos.currentPrice * 100)}¢</span>
                    <span>目标 100¢</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-800">
                    <div
                      className={cn('h-full rounded-full', pos.outcome === 'yes' ? 'bg-emerald-500' : 'bg-red-500')}
                      style={{ width: `${pos.currentPrice * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">市场</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium hidden sm:table-cell">操作</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">份额</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">价格</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">总额</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium hidden md:table-cell">时间</th>
              </tr>
            </thead>
            <tbody>
              {mockTrades.map((trade, i) => (
                <tr key={trade.id} className={cn('border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors', i === mockTrades.length - 1 && 'border-0')}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white text-xs font-medium line-clamp-1">{trade.marketTitle}</p>
                      <span className={cn('text-xs', trade.outcome === 'yes' ? 'text-emerald-400' : 'text-red-400')}>
                        {trade.outcome.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', trade.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}>
                      {trade.type === 'buy' ? '买入' : '卖出'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300 text-xs">{trade.shares}</td>
                  <td className="px-4 py-3 text-right text-gray-300 text-xs">{Math.round(trade.price * 100)}¢</td>
                  <td className="px-4 py-3 text-right font-medium text-xs text-white">${trade.total}</td>
                  <td className="px-4 py-3 text-right text-gray-500 text-xs hidden md:table-cell">{formatDate(trade.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
