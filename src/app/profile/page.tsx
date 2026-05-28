'use client'

import { useState } from 'react'
import {
  TrendingUp,
  Trophy,
  BarChart2,
  Calendar,
  Wallet,
  Edit2,
  Check,
  Copy,
  CheckCircle2,
  Bell,
  Shield,
  Lock,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { LoginModal } from '@/components/auth/LoginModal'
import { mockTrades, mockUser } from '@/lib/mock-data'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'

// ── Toggle Switch ─────────────────────────────────────────────────────────
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
        enabled ? 'bg-blue-500' : 'bg-gray-700',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
          enabled ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  )
}

// ── Change Password Modal ─────────────────────────────────────────────────
function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = () => {
    setError('')
    if (!current || !next || !confirm) {
      setError('请填写所有字段')
      return
    }
    if (next.length < 8) {
      setError('新密码至少需要 8 位字符')
      return
    }
    if (next !== confirm) {
      setError('两次输入的新密码不一致')
      return
    }
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setCurrent('')
      setNext('')
      setConfirm('')
      onClose()
    }, 2000)
  }

  return (
    <Modal open={open} onClose={onClose} title="修改密码">
      {success ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>
          <p className="text-white font-semibold text-lg">密码修改成功</p>
          <p className="text-gray-400 text-sm">请使用新密码重新登录</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">当前密码</p>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                placeholder="输入当前密码"
                value={current}
                onChange={e => setCurrent(e.target.value)}
                className="pr-10"
              />
              <button
                onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">新密码</p>
            <div className="relative">
              <Input
                type={showNext ? 'text' : 'password'}
                placeholder="至少 8 位字符"
                value={next}
                onChange={e => setNext(e.target.value)}
                className="pr-10"
              />
              <button
                onClick={() => setShowNext(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">确认新密码</p>
            <Input
              type="password"
              placeholder="再次输入新密码"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button className="w-full h-11 mt-2" onClick={handleSubmit}>
            确认修改
          </Button>
        </div>
      )}
    </Modal>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, logout, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth()

  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState(user?.username ?? '')
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  // notification toggles
  const [notifySettlement, setNotifySettlement] = useState(true)
  const [notifyPrice, setNotifyPrice] = useState(false)

  // security
  const [twoFactor, setTwoFactor] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  if (!user) {
    return (
      <>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
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
    setTimeout(() => setSaved(false), 2500)
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(user.walletAddress).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // truncate wallet address for display
  const shortAddress = user.walletAddress.length > 12
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : user.walletAddress

  const stats = [
    {
      label: '总盈亏',
      value: `+${formatCurrency(mockUser.totalPnl)}`,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      icon: TrendingUp,
    },
    {
      label: '胜率',
      value: `${mockUser.winRate}%`,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      icon: Trophy,
    },
    {
      label: '交易市场数',
      value: String(mockUser.marketsTraded),
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      icon: BarChart2,
    },
    {
      label: '加入时间',
      value: formatDate(mockUser.joinedAt),
      color: 'text-gray-400',
      bg: 'bg-gray-500/10',
      icon: Calendar,
    },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

      {/* ── Profile Card ── */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {user.username[0]?.toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-gray-900" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Username row */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {editingUsername ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    className="h-8 w-44 text-sm"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleSaveUsername()}
                  />
                  <button
                    onClick={handleSaveUsername}
                    className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-white">{newUsername || user.username}</h1>
                  <button
                    onClick={() => { setNewUsername(user.username); setEditingUsername(true) }}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {saved && <span className="text-xs text-emerald-400 font-medium">已保存</span>}
                </>
              )}
            </div>

            {/* Email */}
            <p className="text-gray-400 text-sm mb-3">{user.email}</p>

            {/* Wallet address */}
            <div className="flex items-center gap-2 w-fit">
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-800/60 border border-gray-700/60 rounded-lg px-3 py-1.5">
                <Wallet className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="font-mono text-gray-400">{shortAddress}</span>
              </div>
              <button
                onClick={handleCopyAddress}
                className="w-7 h-7 rounded-lg bg-gray-800/60 border border-gray-700/60 text-gray-500 hover:text-gray-300 hover:border-gray-600 flex items-center justify-center transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Balance (right side) */}
          <div className="hidden sm:block text-right shrink-0">
            <p className="text-xs text-gray-500 mb-0.5">可用余额</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(user.balance)}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-800">
          {stats.map(stat => (
            <div key={stat.label} className="flex flex-col items-center text-center gap-1.5">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-4 h-4', stat.color)} />
              </div>
              <p className={cn('text-base font-bold leading-tight', stat.color)}>{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Notification Settings ── */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">通知设置</h2>
        </div>
        <div className="divide-y divide-gray-800/60">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">市场结算通知</p>
              <p className="text-xs text-gray-500 mt-0.5">当你持仓的市场结算时通知你</p>
            </div>
            <Toggle
              enabled={notifySettlement}
              onToggle={() => setNotifySettlement(v => !v)}
            />
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">价格提醒</p>
              <p className="text-xs text-gray-500 mt-0.5">当价格发生重大变动时提醒你</p>
            </div>
            <Toggle
              enabled={notifyPrice}
              onToggle={() => setNotifyPrice(v => !v)}
            />
          </div>
        </div>
      </div>

      {/* ── Security Settings ── */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">账户安全</h2>
        </div>
        <div className="divide-y divide-gray-800/60">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">登录密码</p>
              <p className="text-xs text-gray-500 mt-0.5">定期修改密码可以保护账户安全</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChangePasswordOpen(true)}
            >
              修改密码
            </Button>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">两步验证</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {twoFactor ? '已开启，使用验证器 App 保护账户' : '开启后登录需要额外验证码'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {twoFactor && (
                <Badge variant="success" className="text-[10px] px-1.5 py-0">已开启</Badge>
              )}
              <Toggle
                enabled={twoFactor}
                onToggle={() => setTwoFactor(v => !v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">最近交易</h2>
        </div>
        <div className="divide-y divide-gray-800/60">
          {mockTrades.slice(0, 5).map(trade => (
            <div
              key={trade.id}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-800/30 transition-colors"
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  trade.type === 'buy'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-red-500/15 text-red-400',
                )}
              >
                {trade.type === 'buy' ? '↑' : '↓'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{trade.marketTitle}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge
                    variant={trade.type === 'buy' ? 'success' : 'danger'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {trade.type === 'buy' ? '买入' : '卖出'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {trade.outcome.toUpperCase()} · {trade.shares} 份 · {Math.round(trade.price * 100)}¢
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    trade.type === 'sell' ? 'text-emerald-400' : 'text-white',
                  )}
                >
                  {trade.type === 'sell' ? '+' : '-'}{formatCurrency(trade.total)}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{formatDate(trade.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="rounded-2xl border border-red-900/30 bg-red-950/10 p-5">
        <div className="flex items-center gap-2 mb-1">
          <LogOut className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold text-red-400">退出登录</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">退出后你需要重新登录才能访问账户</p>
        <Button
          variant="destructive"
          size="sm"
          onClick={logout}
          className="gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          退出登录
        </Button>
      </div>

      {/* ── Modals ── */}
      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  )
}

