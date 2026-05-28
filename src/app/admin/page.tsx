'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Shield, Plus, CheckCircle, XCircle, RefreshCw, Trash2, Globe,
  TrendingUp, Users, AlertTriangle, Loader2, Wallet,
  BarChart2, DollarSign, ArrowDownCircle, ArrowUpCircle,
  Clock, CheckCircle2, MessageCircle, Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatVolume, formatDate, getCategoryColor, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const ADMIN_SECRET = 'admin123'

type TabId = 'overview' | 'markets' | 'deposits' | 'users' | 'support'

interface AdminMarket {
  id: string
  title: string
  category: string
  status: string
  yesPrice: number
  noPrice: number
  volume: number
  endDate: string
  createdAt: string
  resolvedOutcome?: string
  polymarketId?: string
  _count?: { trades: number; positions: number }
}

interface DepositRequestRow {
  id: string
  userId: string
  amount: number
  txHash: string
  status: string
  adminNote: string | null
  createdAt: string
  user: { username: string; email: string }
}

interface WithdrawalRequestRow {
  id: string
  userId: string
  amount: number
  toAddress: string
  status: string
  adminNote: string | null
  createdAt: string
  user: { username: string; email: string }
}

interface AdminUser {
  id: string
  email: string
  username: string
  balance: number
  totalPnl: number
  marketsTraded: number
  winRate: number
  createdAt: string
  isAdmin: boolean
}

interface AdminStats {
  totalUsers: number
  totalMarkets: number
  activeMarkets: number
  resolvedMarkets: number
  totalVolume: number
  totalFees: number
  pendingDeposits: number
  pendingWithdrawals: number
  totalDeposited: number
  totalWithdrawn: number
}

const categories = ['BTC', 'ETH', 'DeFi', 'Layer2', 'NFT', 'Regulation', 'Politics', 'Elections', 'Sports', 'Entertainment', 'AI', 'Tech', 'Economy', 'World']

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  // --- Markets state ---
  const [markets, setMarkets] = useState<AdminMarket[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ synced: number; errors: number } | null>(null)
  const [settleModal, setSettleModal] = useState<AdminMarket | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState({ title: '', description: '', category: 'BTC', endDate: '', liquidity: '100', tags: '' })
  const [creating, setCreating] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // --- Deposits/Withdrawals state ---
  const [depositAddress, setDepositAddress] = useState('')
  const [savingAddress, setSavingAddress] = useState(false)
  const [saveAddressMsg, setSaveAddressMsg] = useState('')
  const [pendingDeposits, setPendingDeposits] = useState<DepositRequestRow[]>([])
  const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalRequestRow[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState<Record<string, string>>({})

  // --- Stats state ---
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // --- Users state ---
  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [editingBalance, setEditingBalance] = useState<Record<string, string>>({})
  const [savingBalance, setSavingBalance] = useState<Record<string, boolean>>({})
  const [balanceChanged, setBalanceChanged] = useState<Record<string, boolean>>({})

  // --- Support settings state ---
  const [supportSettings, setSupportSettings] = useState<Record<string, string>>({})
  const [savingSupport, setSavingSupport] = useState<Record<string, boolean>>({})
  const [savedSupport, setSavedSupport] = useState<Record<string, boolean>>({})

  const headers = { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET }

  // ---- Loaders ----
  const loadMarkets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/markets', { headers })
      const data = await res.json()
      if (Array.isArray(data)) setMarkets(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data: Record<string, string> = await res.json()
      if (data.depositAddress) setDepositAddress(data.depositAddress)
      setSupportSettings({
        supportWhatsapp: data.supportWhatsapp ?? '',
        supportTelegram: data.supportTelegram ?? '',
        supportDiscord: data.supportDiscord ?? '',
        supportWechat: data.supportWechat ?? '',
      })
    } catch { /* ignore */ }
  }, [])

  const loadPendingRequests = useCallback(async () => {
    setRequestsLoading(true)
    try {
      const res = await fetch('/api/admin/requests?status=pending', { headers })
      const data = await res.json()
      if (data.deposits) setPendingDeposits(data.deposits)
      if (data.withdrawals) setPendingWithdrawals(data.withdrawals)
    } finally {
      setRequestsLoading(false)
    }
  }, [])

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/admin/stats', { headers })
      const data = await res.json()
      setStats(data)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const loadUsers = useCallback(async (search = '') => {
    setUsersLoading(true)
    try {
      const url = search ? `/api/admin/users?search=${encodeURIComponent(search)}` : '/api/admin/users'
      const res = await fetch(url, { headers })
      const data = await res.json()
      if (Array.isArray(data)) setUsers(data)
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      loadMarkets()
      loadSettings()
      loadPendingRequests()
      loadStats()
      loadUsers()
    }
  }, [authenticated, loadMarkets, loadSettings, loadPendingRequests, loadStats, loadUsers])

  // ---- Handlers ----
  const handleLogin = () => {
    if (password === ADMIN_SECRET) setAuthenticated(true)
  }

  const handleSaveAddress = async () => {
    setSavingAddress(true)
    setSaveAddressMsg('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers,
        body: JSON.stringify({ key: 'depositAddress', value: depositAddress }),
      })
      setSaveAddressMsg(res.ok ? '保存成功' : '保存失败')
    } catch {
      setSaveAddressMsg('网络错误')
    } finally {
      setSavingAddress(false)
      setTimeout(() => setSaveAddressMsg(''), 3000)
    }
  }

  const handleRequestAction = async (id: string, type: 'deposit' | 'withdrawal', action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type, action }),
      })
      const data = await res.json()
      if (res.ok) {
        setActionMsg(prev => ({ ...prev, [id]: action === 'approve' ? '已批准' : '已拒绝' }))
        loadPendingRequests()
      } else {
        setActionMsg(prev => ({ ...prev, [id]: data.error ?? '操作失败' }))
      }
    } catch {
      setActionMsg(prev => ({ ...prev, [id]: '网络错误' }))
    }
    setTimeout(() => setActionMsg(prev => { const n = { ...prev }; delete n[id]; return n }), 3000)
  }

  const handleSettle = async (outcome: 'yes' | 'no') => {
    if (!settleModal) return
    const res = await fetch('/api/admin/settle', {
      method: 'POST',
      headers,
      body: JSON.stringify({ marketId: settleModal.id, outcome }),
    })
    const data = await res.json()
    if (data.success) {
      setSettleModal(null)
      loadMarkets()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此市场？')) return
    await fetch('/api/admin/markets', { method: 'DELETE', headers, body: JSON.stringify({ id }) })
    loadMarkets()
  }

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.endDate) return
    setCreating(true)
    const res = await fetch('/api/admin/markets', {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }),
    })
    if (res.ok) {
      setCreateSuccess(true)
      setForm({ title: '', description: '', category: 'BTC', endDate: '', liquidity: '100', tags: '' })
      setTimeout(() => setCreateSuccess(false), 3000)
      loadMarkets()
    }
    setCreating(false)
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/admin/sync', { method: 'POST', headers, body: JSON.stringify({ limit: 50 }) })
      const data = await res.json()
      setSyncResult(data)
      loadMarkets()
    } finally {
      setSyncing(false)
    }
  }

  const handleSaveBalance = async (userId: string) => {
    const newBalance = parseFloat(editingBalance[userId] ?? '')
    if (isNaN(newBalance)) return
    setSavingBalance(prev => ({ ...prev, [userId]: true }))
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ balance: newBalance }),
      })
      if (res.ok) {
        const updated: AdminUser = await res.json()
        setUsers(prev => prev.map(u => u.id === userId ? updated : u))
        setEditingBalance(prev => { const n = { ...prev }; delete n[userId]; return n })
        setBalanceChanged(prev => ({ ...prev, [userId]: true }))
        setTimeout(() => setBalanceChanged(prev => { const n = { ...prev }; delete n[userId]; return n }), 3000)
      }
    } finally {
      setSavingBalance(prev => { const n = { ...prev }; delete n[userId]; return n })
    }
  }

  const handleSaveSupport = async (key: string) => {
    setSavingSupport(prev => ({ ...prev, [key]: true }))
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers,
        body: JSON.stringify({ key, value: supportSettings[key] ?? '' }),
      })
      if (res.ok) {
        setSavedSupport(prev => ({ ...prev, [key]: true }))
        setTimeout(() => setSavedSupport(prev => { const n = { ...prev }; delete n[key]; return n }), 3000)
      }
    } finally {
      setSavingSupport(prev => { const n = { ...prev }; delete n[key]; return n })
    }
  }

  const filteredMarkets = statusFilter === 'all' ? markets : markets.filter(m => m.status === statusFilter)

  // ---- Login screen ----
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">管理员后台</h1>
              <p className="text-xs text-gray-500">CryptoPredict Admin</p>
            </div>
          </div>
          <Input
            type="password"
            placeholder="管理员密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="mb-3"
          />
          <Button className="w-full" onClick={handleLogin}>登录</Button>
        </div>
      </div>
    )
  }

  // ---- Main panel ----
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">管理员后台</h1>
            <p className="text-xs text-gray-500">CryptoPredict Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-8 flex-wrap">
        {(
          [
            { id: 'overview', label: '概览' },
            { id: 'markets', label: '市场管理' },
            { id: 'deposits', label: `充提审核 (${pendingDeposits.length + pendingWithdrawals.length})` },
            { id: 'users', label: '用户管理' },
            { id: 'support', label: '客服设置' },
          ] as { id: TabId; label: string }[]
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ====== Tab: 概览 ====== */}
      {activeTab === 'overview' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">平台概览</h2>
            <Button variant="outline" size="sm" onClick={loadStats} disabled={statsLoading}>
              <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', statsLoading && 'animate-spin')} />
              刷新
            </Button>
          </div>
          {statsLoading || !stats ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Row 1 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-500">总用户数</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-gray-500">活跃市场</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">{stats.activeMarkets}</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-gray-500">总交易量</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">{formatCurrency(stats.totalVolume)}</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-gray-500">平台手续费</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">{formatCurrency(stats.totalFees)}</p>
                </div>
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-gray-500">累计充值</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.totalDeposited)}</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-gray-500">累计提款</span>
                  </div>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(stats.totalWithdrawn)}</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-gray-500">待审核充值</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-400">{stats.pendingDeposits}</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-gray-500">待审核提款</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-400">{stats.pendingWithdrawals}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====== Tab: 市场管理 ====== */}
      {activeTab === 'markets' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 flex-wrap">
              {['all', 'active', 'pending', 'resolved'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white')}>
                  {s === 'all' ? '全部' : s === 'active' ? '活跃' : s === 'pending' ? '待审核' : '已结算'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadMarkets} disabled={loading}>
                <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', loading && 'animate-spin')} />
                刷新
              </Button>
              <Button size="sm" onClick={handleSync} disabled={syncing} className="bg-purple-600 hover:bg-purple-700">
                {syncing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Globe className="w-3.5 h-3.5 mr-1.5" />}
                同步 Polymarket
              </Button>
              <Button size="sm" onClick={() => setShowCreateForm(v => !v)}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                创建市场
              </Button>
            </div>
          </div>

          {syncResult && (
            <div className={cn('rounded-xl border p-4 mb-4 flex items-center gap-3',
              syncResult.errors === 0 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-yellow-500/30 bg-yellow-500/5')}>
              {syncResult.errors === 0 ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-yellow-400" />}
              <p className="text-sm text-white">同步完成：新增/更新 <span className="text-emerald-400 font-bold">{syncResult.synced}</span> 个市场，失败 <span className="text-red-400">{syncResult.errors}</span> 个</p>
            </div>
          )}

          {showCreateForm && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-6 space-y-4">
              <h2 className="text-base font-semibold text-white">手动创建市场</h2>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">市场问题 *</label>
                <Input placeholder="会发生...吗？" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">详细描述 *</label>
                <textarea className="w-full h-24 px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="结算条件、数据来源..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">分类 *</label>
                  <select className="w-full h-10 px-3 rounded-lg border border-gray-700 bg-gray-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">截止日期 *</label>
                  <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">初始流动性 (USDC)</label>
                  <Input type="number" value={form.liquidity} onChange={e => setForm(f => ({ ...f, liquidity: e.target.value }))} min={10} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">标签 (逗号分隔)</label>
                  <Input placeholder="Tag1, Tag2" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                </div>
              </div>
              {createSuccess && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle className="w-4 h-4" /> 市场创建成功！
                </div>
              )}
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />创建中...</> : <><Plus className="w-4 h-4 mr-2" />创建市场</>}
              </Button>
            </div>
          )}

          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/60">
                  <th className="text-left px-4 py-3 text-xs text-gray-500">市场</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">分类</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">状态</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 hidden md:table-cell">YES/NO</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 hidden md:table-cell">交易量</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarkets.map((market, i) => (
                  <tr key={market.id} className={cn('border-b border-gray-800/50 hover:bg-gray-800/30', i === filteredMarkets.length - 1 && 'border-0')}>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="flex items-start gap-2">
                        {market.polymarketId && <Globe className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />}
                        <p className="text-sm text-white line-clamp-2">{market.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className={cn('px-2 py-0.5 rounded-md text-xs', getCategoryColor(market.category))}>{market.category}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                      <Badge variant={market.status === 'active' ? 'success' : market.status === 'resolved' ? 'secondary' : 'warning'}>
                        {market.status === 'active' ? '活跃' : market.status === 'resolved' ? '已结算' : '待审核'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden md:table-cell">
                      <span className="text-emerald-400 text-xs">{Math.round(market.yesPrice * 100)}%</span>
                      <span className="text-gray-600 mx-1">/</span>
                      <span className="text-red-400 text-xs">{Math.round(market.noPrice * 100)}%</span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs text-gray-400 hidden md:table-cell">{formatVolume(market.volume)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {market.status === 'active' && (
                          <button onClick={() => setSettleModal(market)}
                            className="px-2 py-1 rounded text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 transition-colors whitespace-nowrap">
                            结算
                          </button>
                        )}
                        {market.status === 'resolved' && (
                          <span className={cn('text-xs font-medium', market.resolvedOutcome === 'yes' ? 'text-emerald-400' : 'text-red-400')}>
                            {market.resolvedOutcome?.toUpperCase()}
                          </span>
                        )}
                        <button onClick={() => handleDelete(market.id)} className="p-1 text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====== Tab: 充提审核 ====== */}
      {activeTab === 'deposits' && (
        <div className="space-y-8">
          {/* Deposit address setting */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-400" />
              充值地址设置
            </h2>
            <div className="flex gap-3">
              <Input
                placeholder="输入充值钱包地址（0x...）"
                value={depositAddress}
                onChange={e => setDepositAddress(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSaveAddress} disabled={savingAddress}>
                {savingAddress ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
              </Button>
            </div>
            {saveAddressMsg && (
              <p className={cn('text-xs mt-2', saveAddressMsg === '保存成功' ? 'text-emerald-400' : 'text-red-400')}>{saveAddressMsg}</p>
            )}
          </div>

          {/* Pending deposits */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white">待审核充值 ({pendingDeposits.length})</h2>
              <Button variant="outline" size="sm" onClick={loadPendingRequests} disabled={requestsLoading}>
                <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', requestsLoading && 'animate-spin')} />
                刷新
              </Button>
            </div>
            {pendingDeposits.length === 0 ? (
              <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-8 text-center text-sm text-gray-500">暂无待审核充值</div>
            ) : (
              <div className="rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/60">
                      <th className="text-left px-4 py-3 text-xs text-gray-500">用户</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500">金额</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500 hidden md:table-cell">交易Hash</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">时间</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDeposits.map((req, i) => (
                      <tr key={req.id} className={cn('border-b border-gray-800/50 hover:bg-gray-800/30', i === pendingDeposits.length - 1 && 'border-0')}>
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-white font-medium">{req.user.username}</p>
                          <p className="text-xs text-gray-500">{req.user.email}</p>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-emerald-400 font-semibold">${req.amount.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <code className="text-xs text-gray-400 font-mono truncate max-w-[180px] block">{req.txHash}</code>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500 hidden lg:table-cell">{formatDate(req.createdAt)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            {actionMsg[req.id] ? (
                              <span className="text-xs text-gray-400">{actionMsg[req.id]}</span>
                            ) : (
                              <>
                                <button onClick={() => handleRequestAction(req.id, 'deposit', 'approve')}
                                  className="px-2 py-1 rounded text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 transition-colors">
                                  批准
                                </button>
                                <button onClick={() => handleRequestAction(req.id, 'deposit', 'reject')}
                                  className="px-2 py-1 rounded text-xs bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors">
                                  拒绝
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pending withdrawals */}
          <div>
            <h2 className="text-base font-semibold text-white mb-3">待审核提款 ({pendingWithdrawals.length})</h2>
            {pendingWithdrawals.length === 0 ? (
              <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-8 text-center text-sm text-gray-500">暂无待审核提款</div>
            ) : (
              <div className="rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/60">
                      <th className="text-left px-4 py-3 text-xs text-gray-500">用户</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500">金额</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500 hidden md:table-cell">提现地址</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">时间</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingWithdrawals.map((req, i) => (
                      <tr key={req.id} className={cn('border-b border-gray-800/50 hover:bg-gray-800/30', i === pendingWithdrawals.length - 1 && 'border-0')}>
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-white font-medium">{req.user.username}</p>
                          <p className="text-xs text-gray-500">{req.user.email}</p>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-red-400 font-semibold">${req.amount.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <code className="text-xs text-gray-400 font-mono truncate max-w-[180px] block">{req.toAddress}</code>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500 hidden lg:table-cell">{formatDate(req.createdAt)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            {actionMsg[req.id] ? (
                              <span className="text-xs text-gray-400">{actionMsg[req.id]}</span>
                            ) : (
                              <>
                                <button onClick={() => handleRequestAction(req.id, 'withdrawal', 'approve')}
                                  className="px-2 py-1 rounded text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 transition-colors">
                                  批准
                                </button>
                                <button onClick={() => handleRequestAction(req.id, 'withdrawal', 'reject')}
                                  className="px-2 py-1 rounded text-xs bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors">
                                  拒绝
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====== Tab: 用户管理 ====== */}
      {activeTab === 'users' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="搜索邮箱或用户名..."
                value={userSearch}
                onChange={e => {
                  setUserSearch(e.target.value)
                  loadUsers(e.target.value)
                }}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => loadUsers(userSearch)} disabled={usersLoading}>
              <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', usersLoading && 'animate-spin')} />
              刷新
            </Button>
          </div>

          {usersLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/60">
                    <th className="text-left px-4 py-3 text-xs text-gray-500">用户名</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 hidden md:table-cell">邮箱</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500">余额</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">盈亏</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">交易数</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">注册时间</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr key={user.id} className={cn('border-b border-gray-800/50 hover:bg-gray-800/30', i === users.length - 1 && 'border-0')}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-white font-medium">{user.username}</p>
                          {user.isAdmin && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600/20 text-red-400">Admin</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400 hidden md:table-cell">{user.email}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={cn('text-sm font-semibold', balanceChanged[user.id] ? 'text-green-400' : 'text-white')}>
                          {formatCurrency(user.balance)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                        <span className={cn('text-xs', user.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {user.totalPnl >= 0 ? '+' : ''}{formatCurrency(user.totalPnl)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs text-gray-400 hidden lg:table-cell">{user.marketsTraded}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 hidden lg:table-cell">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {editingBalance[user.id] !== undefined ? (
                            <>
                              <Input
                                type="number"
                                value={editingBalance[user.id]}
                                onChange={e => setEditingBalance(prev => ({ ...prev, [user.id]: e.target.value }))}
                                className="w-24 h-7 text-xs px-2"
                              />
                              <button
                                onClick={() => handleSaveBalance(user.id)}
                                disabled={savingBalance[user.id]}
                                className="px-2 py-1 rounded text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 transition-colors"
                              >
                                {savingBalance[user.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : '保存'}
                              </button>
                              <button
                                onClick={() => setEditingBalance(prev => { const n = { ...prev }; delete n[user.id]; return n })}
                                className="px-2 py-1 rounded text-xs text-gray-500 hover:text-gray-300 transition-colors"
                              >
                                取消
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setEditingBalance(prev => ({ ...prev, [user.id]: String(user.balance) }))}
                              className="px-2 py-1 rounded text-xs bg-gray-800 text-gray-400 hover:text-white transition-colors"
                            >
                              调整余额
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">暂无用户</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ====== Tab: 客服设置 ====== */}
      {activeTab === 'support' && (
        <div className="max-w-2xl">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white">客服渠道设置</h2>
            <p className="text-xs text-gray-500 mt-1">配置后用户可在个人资料页看到客服入口</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 divide-y divide-gray-800">
            {[
              { key: 'supportWhatsapp', label: 'WhatsApp', iconColor: 'text-green-400', bgColor: 'bg-green-400/10' },
              { key: 'supportTelegram', label: 'Telegram', iconColor: 'text-blue-400', bgColor: 'bg-blue-400/10' },
              { key: 'supportDiscord', label: 'Discord', iconColor: 'text-indigo-400', bgColor: 'bg-indigo-400/10' },
              { key: 'supportWechat', label: '微信客服二维码链接', iconColor: 'text-green-400', bgColor: 'bg-green-400/10' },
            ].map(({ key, label, iconColor, bgColor }) => (
              <div key={key} className="p-5 flex items-center gap-4">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', bgColor)}>
                  <MessageCircle className={cn('w-4 h-4', iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white mb-1.5">{label}</p>
                  <Input
                    placeholder={`输入 ${label} 链接或地址`}
                    value={supportSettings[key] ?? ''}
                    onChange={e => setSupportSettings(prev => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
                <button
                  onClick={() => handleSaveSupport(key)}
                  disabled={savingSupport[key]}
                  className="shrink-0 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 transition-colors disabled:opacity-50"
                >
                  {savingSupport[key] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : savedSupport[key] ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />已保存
                    </span>
                  ) : (
                    '保存'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settle Modal */}
      {settleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">结算市场</h3>
            <p className="text-sm text-gray-400 mb-6 line-clamp-2">{settleModal.title}</p>
            <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 mb-6">
              <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
              <p className="text-xs text-yellow-300">结算后不可撤销，胜方将自动获得奖金。</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button variant="yes" size="lg" onClick={() => handleSettle('yes')}>
                <CheckCircle className="w-4 h-4 mr-2" />YES 胜出
              </Button>
              <Button variant="no" size="lg" onClick={() => handleSettle('no')}>
                <XCircle className="w-4 h-4 mr-2" />NO 胜出
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setSettleModal(null)}>取消</Button>
          </div>
        </div>
      )}
    </div>
  )
}
