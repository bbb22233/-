'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Market, OutcomeType } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface TradingPanelProps {
  market: Market
  onOpenLogin: () => void
}

type TabType = 'buy' | 'sell'

export function TradingPanel({ market, onOpenLogin }: TradingPanelProps) {
  const { user } = useAuth()
  const [tab, setTab] = useState<TabType>('buy')
  const [outcome, setOutcome] = useState<OutcomeType>('yes')
  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState('1')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const price = outcome === 'yes' ? market.yesPrice : market.noPrice
  const shares = amount ? (parseFloat(amount) / price).toFixed(2) : '0'
  const fee = amount ? (parseFloat(amount) * 0.02).toFixed(2) : '0'
  const total = amount ? parseFloat(amount) : 0

  const quickAmounts = [10, 50, 100, 500]

  const handleTrade = async () => {
    if (!user) { onOpenLogin(); return }
    if (!amount || parseFloat(amount) <= 0) return
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setIsLoading(false)
    setSuccess(true)
    setTimeout(() => { setSuccess(false); setAmount('') }, 2500)
  }

  if (market.status === 'resolved') {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
        <div className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-3',
          market.resolvedOutcome === 'yes' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        )}>
          市场已结算：{market.resolvedOutcome === 'yes' ? 'YES 胜出' : 'NO 胜出'}
        </div>
        <p className="text-gray-500 text-sm">此市场已结算，无法继续交易</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {(['buy', 'sell'] as TabType[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-3.5 text-sm font-medium transition-colors',
              tab === t ? 'text-white border-b-2 border-blue-500 bg-gray-800/50' : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {t === 'buy' ? '买入' : '卖出'}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {/* Outcome selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setOutcome('yes')}
            className={cn(
              'py-3 rounded-lg text-sm font-semibold transition-all border-2',
              outcome === 'yes'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
            )}
          >
            YES
            <span className="block text-xs font-normal mt-0.5">
              {Math.round(market.yesPrice * 100)}¢
            </span>
          </button>
          <button
            onClick={() => setOutcome('no')}
            className={cn(
              'py-3 rounded-lg text-sm font-semibold transition-all border-2',
              outcome === 'no'
                ? 'border-red-500 bg-red-500/10 text-red-400'
                : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
            )}
          >
            NO
            <span className="block text-xs font-normal mt-0.5">
              {Math.round(market.noPrice * 100)}¢
            </span>
          </button>
        </div>

        {/* Amount input */}
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">投入金额 (USDC)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <Input
              type="number"
              placeholder="0.00"
              className="pl-7 text-lg font-medium"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          {/* Quick amounts */}
          <div className="flex gap-1.5 mt-2">
            {quickAmounts.map(v => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className="flex-1 py-1 text-xs rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              >
                ${v}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {amount && parseFloat(amount) > 0 && (
          <div className="rounded-lg bg-gray-800/60 p-3 space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>预计获得份额</span>
              <span className="text-white font-medium">{shares} 份</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>当前价格</span>
              <span className="text-white">{Math.round(price * 100)}¢/份</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>手续费 (2%)</span>
              <span className="text-white">${fee}</span>
            </div>
            <div className="border-t border-gray-700 pt-2 flex justify-between font-medium">
              <span className="text-gray-300">总计</span>
              <span className="text-white">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>胜出可得</span>
              <span className="text-emerald-400 font-medium">+${(parseFloat(shares) * (1 - 0.02)).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Advanced */}
        <button
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <ChevronDown className={cn('w-3 h-3 transition-transform', showAdvanced && 'rotate-180')} />
          高级设置
        </button>
        {showAdvanced && (
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">最大滑点 (%)</label>
            <Input type="number" value={slippage} onChange={e => setSlippage(e.target.value)} className="h-8 text-sm" />
          </div>
        )}

        {/* Balance warning */}
        {user && amount && parseFloat(amount) > user.balance && (
          <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-400/10 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            余额不足，当前余额 {formatCurrency(user.balance)}
          </div>
        )}

        {/* CTA */}
        {success ? (
          <div className="w-full py-3 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium text-center">
            交易成功！✓
          </div>
        ) : (
          <Button
            className="w-full"
            variant={outcome === 'yes' ? 'yes' : 'no'}
            size="lg"
            onClick={handleTrade}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />交易中...</>
            ) : !user ? (
              '登录后交易'
            ) : (
              `买入 ${outcome.toUpperCase()}`
            )}
          </Button>
        )}

        {user && (
          <p className="text-center text-xs text-gray-600">
            可用余额：{formatCurrency(user.balance)}
          </p>
        )}
      </div>
    </div>
  )
}
