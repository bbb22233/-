'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  const [tradeError, setTradeError] = useState<string | null>(null)
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
    setTradeError(null)
    try {
      const res = await fetch(`/api/markets/${market.id}/trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, type: 'buy', outcome, amount: parseFloat(amount) }),
      })
      if (!res.ok) throw new Error('trade failed')
      setSuccess(true)
      setAmount('')
      setTimeout(() => setSuccess(false), 2500)
    } catch {
      setTradeError('Trade failed, please try again')
    } finally {
      setIsLoading(false)
    }
  }

  if (market.status === 'resolved') {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
        <div className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-3',
          market.resolvedOutcome === 'yes' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        )}>
          Market Resolved: {market.resolvedOutcome === 'yes' ? 'YES wins' : 'NO wins'}
        </div>
        <p className="text-gray-500 text-sm">This market has been resolved and is no longer tradeable</p>
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
            {t === 'buy' ? 'Buy' : 'Sell'}
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
          <label className="text-xs text-gray-500 mb-1.5 block">Amount (USDC)</label>
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
              <span>Est. shares</span>
              <span className="text-white font-medium">{shares}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Current price</span>
              <span className="text-white">{Math.round(price * 100)}¢/share</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Fee (2%)</span>
              <span className="text-white">${fee}</span>
            </div>
            <div className="border-t border-gray-700 pt-2 flex justify-between font-medium">
              <span className="text-gray-300">Total</span>
              <span className="text-white">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Potential payout</span>
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
          Advanced settings
        </button>
        {showAdvanced && (
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Max slippage (%)</label>
            <Input type="number" value={slippage} onChange={e => setSlippage(e.target.value)} className="h-8 text-sm" />
          </div>
        )}

        {/* Balance warning */}
        {user && amount && parseFloat(amount) > user.balance && (
          <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-400/10 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Insufficient balance. Available: {formatCurrency(user.balance)}
          </div>
        )}

        {/* Error message */}
        {tradeError && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {tradeError}
          </div>
        )}

        {/* CTA */}
        {success ? (
          <div className="w-full py-3 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium text-center space-y-1">
            <div>Trade successful! ✓</div>
            <Link href="/portfolio" className="block text-xs text-emerald-300 underline underline-offset-2 hover:text-emerald-200">
              View portfolio
            </Link>
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
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
            ) : !user ? (
              'Sign In to Trade'
            ) : (
              `Buy ${outcome.toUpperCase()}`
            )}
          </Button>
        )}

        {user && (
          <p className="text-center text-xs text-gray-600">
            Available: {formatCurrency(user.balance)}
          </p>
        )}
      </div>
    </div>
  )
}
