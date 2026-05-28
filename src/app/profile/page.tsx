'use client'

import { useState, useEffect } from 'react'
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
  MessageCircle,
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

// ── Set Withdrawal Password Modal ─────────────────────────────────────────
function SetWithdrawalPasswordModal({
  open,
  onClose,
  userId,
  isUpdate,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  userId: string
  isUpdate: boolean
  onSuccess: () => void
}) {
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (isUpdate && !currentPwd) {
      setError('请输入当前提款密码')
      return
    }
    if (!newPwd || newPwd.length < 6) {
      setError('新密码至少需要 6 位字符')
      return
    }
    if (newPwd !== confirmPwd) {
      setError('两次输入的新密码不一致')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/user/${userId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'withdrawal',
          newPassword: newPwd,
          ...(isUpdate ? { currentPassword: currentPwd } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '操作失败')
        return
      }
      setSuccess(true)
      onSuccess()
      setTimeout(() => {
        setSuccess(false)
        setCurrentPwd('')
        setNewPwd('')
        setConfirmPwd('')
        onClose()
      }, 2000)
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isUpdate ? '修改提款密码' : '设置提款密码'}>
      {success ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>
          <p className="text-white font-semibold text-lg">
            {isUpdate ? '提款密码修改成功' : '提款密码设置成功'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {isUpdate && (
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">当前提款密码</p>
              <Input
                type="password"
                placeholder="输入当前提款密码"
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
              />
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">新密码</p>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                placeholder="至少 6 位字符"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                className="pr-10"
              />
              <button
                onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">确认新密码</p>
            <Input
              type="password"
              placeholder="再次输入新密码"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button className="w-full h-11 mt-2" onClick={handleSubmit} disabled={loading}>
            {loading ? '提交中...' : '确认'}
          </Button>
        </div>
      )}
    </Modal>
  )
}

// ── Support Channel settings type ──────────────────────────────────────────
interface SupportSettings {
  whatsapp?: string
  telegram?: string
  discord?: string
  wechat?: string
  wechatQr?: string
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, logout, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth()

  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState(user?.username ?? '')
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [copied, setCopied] = useState(false)

  // notification toggles
  const [notifySettlement, setNotifySettlement] = useState(true)
  const [notifyPrice, setNotifyPrice] = useState(false)

  // security
  const [twoFactor, setTwoFactor] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  // withdrawal password
  const [hasWithdrawalPassword, setHasWithdrawalPassword] = useState(false)
  const [withdrawalPasswordModalOpen, setWithdrawalPasswordModalOpen] = useState(false)

  // support settings
  const [supportSettings, setSupportSettings] = useState<SupportSettings | null>(null)

  useEffect(() => {
    if (user) {
      // Fetch withdrawal password status
      fetch(`/api/user/${user.id}`)
        .then(r => r.json())
        .then((data: { hasWithdrawalPassword?: boolean }) => {
          setHasWithdrawalPassword(!!data.hasWithdrawalPassword)
        })
        .catch(() => {})

      // Fetch support settings
      fetch('/api/admin/settings')
        .then(r => r.json())
        .then((data: Record<string, string>) => {
          setSupportSettings({
            whatsapp: data.whatsapp || '',
            telegram: data.telegram || '',
            discord: data.discord || '',
            wechat: data.wechat || '',
            wechatQr: data.wechatQr || '',
          })
        })
        .catch(() => {})
    }
  }, [user])

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

  const handleSaveUsername = async () => {
    setSaveError('')
    try {
      const res = await fetch(`/api/user/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data.error ?? '保存失败')
        return
      }
      // Update localStorage
      const stored = localStorage.getItem('auth_user')
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, unknown>
        localStorage.setItem('auth_user', JSON.stringify({ ...parsed, username: newUsername }))
      }
      setSaved(true)
      setEditingUsername(false)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setSaveError('网络错误，请重试')
    }
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

  const hasSupportChannels = supportSettings && (
    supportSettings.whatsapp ||
    supportSettings.telegram ||
    supportSettings.discord ||
    supportSettings.wechat ||
    supportSettings.wechatQr
  )

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
                <div className="flex flex-col gap-1.5">
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
                  {saveError && (
                    <p className="text-xs text-red-400">{saveError}</p>
                  )}
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-white">{newUsername || user.username}</h1>
                  <button
                    onClick={() => { setNewUsername(user.username); setEditingUsername(true); setSaveError('') }}
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

      {/* ── Withdrawal Password ── */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">提款密码</h2>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-white">提款密码</p>
            <p className="text-xs text-gray-500 mt-0.5">用于保护提款操作的安全</p>
          </div>
          <div className="flex items-center gap-3">
            {hasWithdrawalPassword ? (
              <Badge variant="success" className="text-[10px] px-1.5 py-0">已设置</Badge>
            ) : (
              <Badge className="text-[10px] px-1.5 py-0 bg-gray-700 text-gray-400 border-gray-600">尚未设置</Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWithdrawalPasswordModalOpen(true)}
            >
              {hasWithdrawalPassword ? '修改提款密码' : '设置提款密码'}
            </Button>
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

      {/* ── Online Support ── */}
      <div id="support" className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">在线客服</h2>
        </div>
        <div className="px-5 py-4">
          {!hasSupportChannels ? (
            <p className="text-sm text-gray-400">
              暂无在线客服，请发送邮件至{' '}
              <a href="mailto:support@example.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                support@example.com
              </a>
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {supportSettings?.whatsapp && (
                <a
                  href={supportSettings.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 transition-all text-sm font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.525 3.49" />
                  </svg>
                  WhatsApp
                </a>
              )}
              {supportSettings?.telegram && (
                <a
                  href={supportSettings.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all text-sm font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  Telegram
                </a>
              )}
              {supportSettings?.discord && (
                <a
                  href={supportSettings.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all text-sm font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.91 19.91 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Discord
                </a>
              )}
              {(supportSettings?.wechat || supportSettings?.wechatQr) && (
                <a
                  href={supportSettings.wechat || supportSettings.wechatQr || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 transition-all text-sm font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 0 0 .186-.066l1.979-1.091a.864.864 0 0 1 .717-.08 9.94 9.94 0 0 0 2.742.389c.28 0 .555-.012.825-.037-.271-.757-.42-1.566-.42-2.415 0-3.797 3.568-6.873 7.97-6.873.29 0 .574.017.853.048C16.547 4.616 12.876 2.188 8.691 2.188zm-1.77 3.818a1.18 1.18 0 1 1 0 2.36 1.18 1.18 0 0 1 0-2.36zm3.94 0a1.18 1.18 0 1 1 0 2.36 1.18 1.18 0 0 1 0-2.36zM15.27 9.5c-3.624 0-6.563 2.677-6.563 5.978 0 3.302 2.939 5.979 6.563 5.979a8.157 8.157 0 0 0 2.26-.323.71.71 0 0 1 .589.065l1.632.9a.271.271 0 0 0 .154.054.243.243 0 0 0 .239-.243c0-.059-.024-.113-.04-.175l-.323-1.22a.485.485 0 0 1 .176-.548C21.023 18.85 22 17.26 22 15.478 22 12.177 19.06 9.5 15.27 9.5zm-1.977 3.125a.972.972 0 1 1 0 1.944.972.972 0 0 1 0-1.944zm3.954 0a.972.972 0 1 1 0 1.944.972.972 0 0 1 0-1.944z" />
                  </svg>
                  微信
                </a>
              )}
            </div>
          )}
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
      <SetWithdrawalPasswordModal
        open={withdrawalPasswordModalOpen}
        onClose={() => setWithdrawalPasswordModalOpen(false)}
        userId={user.id}
        isUpdate={hasWithdrawalPassword}
        onSuccess={() => setHasWithdrawalPassword(true)}
      />
    </div>
  )
}
