'use client'

import { useState } from 'react'
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from 'recharts'
import {
  Download, Upload, Wallet, CheckCircle2, Clock,
  TrendingUp, TrendingDown,
} from 'lucide-react'
import { mockPositions, mockTrades } from '@/lib/mock-data'
import { useAuth } from '@/hooks/useAuth'
import { LoginModal } from '@/components/auth/LoginModal'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// ── types ──────────────────────────────────────────────────────────────────
type PnlPeriod = '1天' | '1周' | '1个月' | '1年' | '年初至今' | '全部'
type PortfolioTab = 'positions' | 'orders' | 'history'

// ── mock P&L chart data ────────────────────────────────────────────────────
function generateChartData(points: number): { t: number; v: number }[] {
  const data: { t: number; v: number }[] = []
  let val = 1200
  for (let i = 0; i < points; i++) {
    val = Math.max(800, val + (Math.random() - 0.46) * 40)
    data.push({ t: i, v: parseFloat(val.toFixed(2)) })
  }
  return data
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────
function ChartTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-white text-xs font-semibold">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

const chartDataByPeriod: Record<PnlPeriod, { t: number; v: number }[]> = {
  '1天':    generateChartData(24),
  '1周':    generateChartData(7),
  '1个月':  generateChartData(30),
  '1年':    generateChartData(52),
  '年初至今': generateChartData(20),
  '全部':   generateChartData(60),
}

// ── helpers ────────────────────────────────────────────────────────────────
function pnlDelta(data: { v: number }[]) {
  if (data.length < 2) return { delta: 0, pct: 0 }
  const first = data[0].v
  const last = data[data.length - 1].v
  return { delta: last - first, pct: ((last - first) / first) * 100 }
}

// ── Deposit Modal ──────────────────────────────────────────────────────────
function DepositModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [coin, setCoin] = useState<'USDC' | 'USDT'>('USDC')
  const [amount, setAmount] = useState('')
  const [success, setSuccess] = useState(false)

  const handleConfirm = () => {
    if (!amount) return
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setAmount('')
      onClose()
    }, 2000)
  }

  return (
    <Modal open={open} onClose={onClose} title="充值">
      {success ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>
          <p className="text-white font-semibold text-lg">充值请求已提交</p>
          <p className="text-gray-400 text-sm">资金将在确认后到账</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Coin selector */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">选择币种</p>
            <div className="flex gap-2">
              {(['USDC', 'USDT'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCoin(c)}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all',
                    coin === c
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-700 bg-gray-800/60 text-gray-400 hover:border-gray-600 hover:text-gray-300',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* QR placeholder */}
          <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gray-800/40 border border-gray-700/60">
            <div className="w-32 h-32 rounded-xl bg-white p-3 flex items-center justify-center">
              <div className="w-full h-full grid grid-cols-7 gap-0.5">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'rounded-sm',
                      [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,48,15,16,17,22,26,33,37,38,39,40,44,45,46].includes(i)
                        ? 'bg-gray-900'
                        : 'bg-transparent',
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="text-center w-full">
              <p className="text-xs text-gray-500 mb-2">扫码充值 {coin}，或复制地址</p>
              <code className="block text-xs text-gray-400 font-mono bg-gray-900/80 px-3 py-2 rounded-lg break-all border border-gray-700/60">
                0x1234567890abcdef1234567890abcdef12345678
              </code>
            </div>
          </div>

          {/* Amount */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">充值金额（可选）</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">$</span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {['100', '500', '1000'].map(v => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className="flex-1 py-1.5 rounded-md text-xs font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 border border-gray-700 transition-all"
                >
                  ${v}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full h-11" onClick={handleConfirm}>
            确认充值
          </Button>
        </div>
      )}
    </Modal>
  )
}

// ── Withdraw Modal ─────────────────────────────────────────────────────────
function WithdrawModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [success, setSuccess] = useState(false)

  const handleConfirm = () => {
    if (!address || !amount) return
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setAddress('')
      setAmount('')
      onClose()
    }, 2000)
  }

  return (
    <Modal open={open} onClose={onClose} title="提现">
      {success ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>
          <p className="text-white font-semibold text-lg">提现申请已提交</p>
          <p className="text-gray-400 text-sm">资金将在处理后到账</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">提现地址</p>
            <Input
              placeholder="输入钱包地址（0x...）"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium">提现金额</p>
              <button
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                onClick={() => setAmount('1250.50')}
              >
                全部提现
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">$</span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
          <div className="rounded-lg bg-gray-800/50 border border-gray-700/60 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">可用余额</span>
            <span className="text-sm text-white font-semibold">$1,250.50</span>
          </div>
          <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 px-4 py-2.5">
            <p className="text-xs text-yellow-400/80">提现通常在 1-3 个工作日内处理，请确保地址正确。</p>
          </div>
          <Button
            className="w-full h-11"
            variant="outline"
            onClick={handleConfirm}
            disabled={!address || !amount}
          >
            确认提现
          </Button>
        </div>
      )}
    </Modal>
  )
}

// ── Quick Sell Modal ───────────────────────────────────────────────────────
function SellModal({
  open,
  onClose,
  marketTitle,
  outcome,
  shares,
  currentPrice,
}: {
  open: boolean
  onClose: () => void
  marketTitle: string
  outcome: 'yes' | 'no'
  shares: number
  currentPrice: number
}) {
  const [sellShares, setSellShares] = useState(String(shares))
  const [success, setSuccess] = useState(false)

  const handleSell = () => {
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      onClose()
    }, 2000)
  }

  const qty = Math.min(Math.max(0, parseFloat(sellShares) || 0), shares)
  const estimated = qty * currentPrice

  return (
    <Modal open={open} onClose={onClose} title="卖出仓位">
      {success ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>
          <p className="text-white font-semibold text-lg">订单已提交</p>
          <p className="text-gray-400 text-sm">卖出指令已发送</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="p-3.5 rounded-xl bg-gray-800/50 border border-gray-700/60">
            <p className="text-xs text-gray-500 mb-1.5 font-medium">市场</p>
            <p className="text-sm text-white font-semibold leading-snug line-clamp-2">{marketTitle}</p>
            <div className="mt-2.5">
              <Badge variant={outcome === 'yes' ? 'success' : 'danger'} className="text-xs">
                {outcome.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium">卖出份数</p>
              <button
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                onClick={() => setSellShares(String(shares))}
              >
                全部 ({shares} 份)
              </button>
            </div>
            <Input
              type="number"
              value={sellShares}
              min={1}
              max={shares}
              onChange={e => setSellShares(e.target.value)}
            />
            <input
              type="range"
              min={0}
              max={shares}
              value={qty}
              onChange={e => setSellShares(e.target.value)}
              className="w-full mt-2 accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-600 -mt-0.5">
              <span>0</span>
              <span>{shares}</span>
            </div>
          </div>

          <div className="rounded-xl bg-gray-800/50 border border-gray-700/60 divide-y divide-gray-700/60">
            <div className="flex items-center justify-between px-4 py-2.5 text-xs">
              <span className="text-gray-500">当前价格</span>
              <span className="text-gray-300 font-medium">{Math.round(currentPrice * 100)}¢</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-xs">
              <span className="text-gray-500">卖出份数</span>
              <span className="text-gray-300 font-medium">{qty} 份</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-gray-400 font-medium">预计收入</span>
              <span className="text-white font-bold">{formatCurrency(estimated)}</span>
            </div>
          </div>

          <Button variant="no" className="w-full h-11" onClick={handleSell} disabled={qty === 0}>
            确认卖出
          </Button>
        </div>
      )}
    </Modal>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const { user, openLoginModal, isLoginModalOpen, closeLoginModal } = useAuth()

  const [period, setPeriod] = useState<PnlPeriod>('1天')
  const [tab, setTab] = useState<PortfolioTab>('positions')
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [sellTarget, setSellTarget] = useState<(typeof mockPositions)[0] | null>(null)

  const chartData = chartDataByPeriod[period]
  const { delta, pct } = pnlDelta(chartData)
  const isPositive = delta >= 0

  const totalValue = mockPositions.reduce((s, p) => s + p.shares * p.currentPrice, 0)

  const periods: PnlPeriod[] = ['1天', '1周', '1个月', '1年', '年初至今', '全部']
  const tabs: { key: PortfolioTab; label: string }[] = [
    { key: 'positions', label: `持仓 (${mockPositions.length})` },
    { key: 'orders', label: '未成交订单' },
    { key: 'history', label: `历史记录 (${mockTrades.length})` },
  ]

  if (!user) {
    return (
      <>
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-5">
            <Wallet className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">查看你的持仓</h2>
          <p className="text-gray-400 mb-8">登录后查看你的所有持仓和交易记录</p>
          <Button size="lg" onClick={openLoginModal}>登录 / 注册</Button>
        </div>
        <LoginModal open={isLoginModalOpen} onClose={closeLoginModal} />
      </>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* ── Header ── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">资产组合</p>
        <div className="flex items-end gap-3 flex-wrap">
          <h1 className="text-5xl font-bold text-white tracking-tight">{formatCurrency(totalValue + 1250.50)}</h1>
          <span
            className={cn(
              'text-sm font-semibold pb-1.5 flex items-center gap-1',
              isPositive ? 'text-emerald-400' : 'text-red-400',
            )}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            过去{period}&nbsp;{isPositive ? '+' : ''}{formatCurrency(delta)}&nbsp;({isPositive ? '+' : ''}{pct.toFixed(2)}%)
          </span>
        </div>
        <div className="flex gap-6 mt-2 text-xs text-gray-500">
          <span>持仓价值 <span className="text-gray-300 font-medium ml-1">{formatCurrency(totalValue)}</span></span>
          <span>现金余额 <span className="text-gray-300 font-medium ml-1">{formatCurrency(1250.50)}</span></span>
        </div>
      </div>

      {/* ── Period Tabs ── */}
      <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1 w-fit">
        {periods.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              period === p
                ? 'bg-gray-700 text-white'
                : 'text-gray-500 hover:text-gray-300',
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* ── P&L Chart ── */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 px-2 pt-5 pb-3">
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#3b82f6' : '#ef4444'} stopOpacity={0.25} />
                <stop offset="95%" stopColor={isPositive ? '#3b82f6' : '#ef4444'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" hide />
            <YAxis domain={['auto', 'auto']} hide />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="v"
              stroke={isPositive ? '#3b82f6' : '#ef4444'}
              strokeWidth={2}
              fill="url(#pnlGrad)"
              dot={false}
              activeDot={{ r: 4, fill: isPositive ? '#3b82f6' : '#ef4444', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex gap-3">
        <Button
          className="flex-1 h-12 text-base gap-2"
          onClick={() => setDepositOpen(true)}
        >
          <Download className="w-4 h-4" />
          充值
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-12 text-base gap-2"
          onClick={() => setWithdrawOpen(true)}
        >
          <Upload className="w-4 h-4" />
          提现
        </Button>
      </div>

      {/* ── Content Tabs ── */}
      <div>
        <div className="flex border-b border-gray-800 mb-5">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                tab === t.key
                  ? 'text-white border-blue-500'
                  : 'text-gray-500 border-transparent hover:text-gray-300',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Positions Tab ── */}
        {tab === 'positions' && (
          <div className="space-y-3">
            {mockPositions.map(pos => (
              <div
                key={pos.marketId}
                className="rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-700 transition-all p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge variant={pos.outcome === 'yes' ? 'success' : 'danger'}>
                        {pos.outcome.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">{pos.shares} 份</span>
                      <span className="text-xs text-gray-600">·</span>
                      <span className="text-xs text-gray-500">均价 {Math.round(pos.avgPrice * 100)}¢</span>
                    </div>
                    <h3 className="text-sm font-medium text-white leading-snug line-clamp-2">
                      {pos.market.title}
                    </h3>
                  </div>

                  {/* Right */}
                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(pos.shares * pos.currentPrice)}
                    </p>
                    <p className={cn('text-xs font-medium flex items-center gap-0.5', pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {pos.pnl >= 0
                        ? <TrendingUp className="w-3 h-3" />
                        : <TrendingDown className="w-3 h-3" />}
                      {pos.pnl >= 0 ? '+' : ''}{formatCurrency(pos.pnl)}
                      <span className="text-gray-500 ml-0.5">
                        ({pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(1)}%)
                      </span>
                    </p>
                    <button
                      onClick={() => setSellTarget(pos)}
                      className="mt-1 px-3 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                    >
                      卖出
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>当前 {Math.round(pos.currentPrice * 100)}¢</span>
                    <span>结算 100¢</span>
                  </div>
                  <div className="h-1 rounded-full bg-gray-800">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        pos.outcome === 'yes' ? 'bg-emerald-500' : 'bg-red-500',
                      )}
                      style={{ width: `${pos.currentPrice * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Open Orders Tab ── */}
        {tab === 'orders' && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800/80 border border-gray-700/60 flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <p className="text-gray-300 font-semibold text-base mb-1">暂无未成交订单</p>
              <p className="text-gray-600 text-sm">你的限价单和挂单将显示在这里</p>
            </div>
          </div>
        )}

        {/* ── History Tab ── */}
        {tab === 'history' && (
          <div className="rounded-2xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/80">
                  <th className="text-left px-4 py-3.5 text-xs text-gray-500 font-medium uppercase tracking-wide">市场</th>
                  <th className="text-left px-4 py-3.5 text-xs text-gray-500 font-medium uppercase tracking-wide hidden sm:table-cell">操作</th>
                  <th className="text-right px-4 py-3.5 text-xs text-gray-500 font-medium uppercase tracking-wide">份额</th>
                  <th className="text-right px-4 py-3.5 text-xs text-gray-500 font-medium uppercase tracking-wide">价格</th>
                  <th className="text-right px-4 py-3.5 text-xs text-gray-500 font-medium uppercase tracking-wide">总额</th>
                  <th className="text-right px-4 py-3.5 text-xs text-gray-500 font-medium uppercase tracking-wide hidden md:table-cell">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {mockTrades.map(trade => (
                  <tr key={trade.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="text-white text-xs font-semibold line-clamp-1 mb-1">{trade.marketTitle}</p>
                      <Badge
                        variant={trade.outcome === 'yes' ? 'success' : 'danger'}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {trade.outcome.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <Badge variant={trade.type === 'buy' ? 'success' : 'danger'}>
                        {trade.type === 'buy' ? '买入' : '卖出'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right text-gray-300 text-xs font-medium">{trade.shares}</td>
                    <td className="px-4 py-3.5 text-right text-gray-300 text-xs font-medium">{Math.round(trade.price * 100)}¢</td>
                    <td className="px-4 py-3.5 text-right font-bold text-xs text-white">
                      {formatCurrency(trade.total)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-gray-500 text-xs hidden md:table-cell">
                      {formatDate(trade.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />
      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
      {sellTarget && (
        <SellModal
          open={!!sellTarget}
          onClose={() => setSellTarget(null)}
          marketTitle={sellTarget.market.title}
          outcome={sellTarget.outcome}
          shares={sellTarget.shares}
          currentPrice={sellTarget.currentPrice}
        />
      )}

    </div>
  )
}
