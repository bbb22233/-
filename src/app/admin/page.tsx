'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shield, Plus, CheckCircle, XCircle, RefreshCw, Trash2, Globe, TrendingUp, Users, AlertTriangle, ChevronDown, ChevronUp, Loader2, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatVolume, formatDate, getCategoryColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

const ADMIN_SECRET = 'admin123'

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

const categories = ['BTC', 'ETH', 'DeFi', 'Layer2', 'NFT', 'Regulation', 'Politics', 'Elections', 'Sports', 'Entertainment', 'AI', 'Tech', 'Economy', 'World']

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [markets, setMarkets] = useState<AdminMarket[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ synced: number; errors: number } | null>(null)
  const [activeTab, setActiveTab] = useState<'deposits' | 'markets' | 'create' | 'stats'>('deposits')
  const [settleModal, setSettleModal] = useState<AdminMarket | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  // Create form
  const [form, setForm] = useState({ title: '', description: '', category: 'BTC', endDate: '', liquidity: '100', tags: '' })
  const [creating, setCreating] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)

  // Deposit/Withdrawal management
  const [depositAddress, setDepositAddress] = useState('')
  const [savingAddress, setSavingAddress] = useState(false)
  const [saveAddressMsg, setSaveAddressMsg] = useState('')
  const [pendingDeposits, setPendingDeposits] = useState<DepositRequestRow[]>([])
  const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalRequestRow[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState<Record<string, string>>({})

  const headers = { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET }

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

  useEffect(() => {
    if (authenticated) {
      loadMarkets()
      loadSettings()
      loadPendingRequests()
    }
  }, [authenticated, loadMarkets, loadSettings, loadPendingRequests])

  const handleSaveAddress = async () => {
    setSavingAddress(true)
    setSaveAddressMsg('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers,
        body: JSON.stringify({ key: 'depositAddress', value: depositAddress }),
      })
      if (res.ok) {
        setSaveAddressMsg('保存成功')
      } else {
        setSaveAddressMsg('保存失败')
      }
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

  const handleLogin = () => {
    if (password === ADMIN_SECRET) setAuthenticated(true)
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

  const filteredMarkets = statusFilter === 'all' ? markets : markets.filter(m => m.status === statusFilter)

  const stats = {
    total: markets.length,
    active: markets.filter(m => m.status === 'active').length,
    resolved: markets.filter(m => m.status === 'resolved').length,
    fromPolymarket: markets.filter(m => m.polymarketId).length,
    totalVolume: markets.reduce((s, m) => s + m.volume, 0),
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadMarkets} disabled={loading}>
            <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', loading && 'animate-spin')} />
            刷新
          </Button>
          <Button size="sm" onClick={handleSync} disabled={syncing} className="bg-purple-600 hover:bg-purple-700">
            {syncing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Globe className="w-3.5 h-3.5 mr-1.5" />}
            同步 Polymarket
          </Button>
        </div>
      </div>

      {/* Sync result */}
      {syncResult && (
        <div className={cn('rounded-xl border p-4 mb-6 flex items-center gap-3', syncResult.errors === 0 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-yellow-500/30 bg-yellow-500/5')}>
          {syncResult.errors === 0 ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-yellow-400" />}
          <p className="text-sm text-white">同步完成：新增/更新 <span className="text-emerald-400 font-bold">{syncResult.synced}</span> 个市场，失败 <span className="text-red-400">{syncResult.errors}</span> 个</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[
          { label: '市场总数', value: stats.total, color: 'text-white' },
          { label: '活跃中', value: stats.active, color: 'text-emerald-400' },
          { label: '已结算', value: stats.resolved, color: 'text-gray-400' },
          { label: '来自Polymarket', value: stats.fromPolymarket, color: 'text-purple-400' },
          { label: '总交易量', value: formatVolume(stats.totalVolume), color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-center">
            <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800 mb-6">
        {(['deposits', 'markets', 'create', 'stats'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-4 py-2.5 text-sm font-medium transition-colors border-b-2', activeTab === tab ? 'text-white border-blue-500' : 'text-gray-500 border-transparent hover:text-gray-300')}>
            {tab === 'deposits' ? `充提管理 (${pendingDeposits.length + pendingWithdrawals.length})` : tab === 'markets' ? `市场管理 (${filteredMarkets.length})` : tab === 'create' ? '创建市场' : '数据统计'}
          </button>
        ))}
      </div>

      {/* Deposits management tab */}
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
                                <button
                                  onClick={() => handleRequestAction(req.id, 'deposit', 'approve')}
                                  className="px-2 py-1 rounded text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 transition-colors"
                                >
                                  批准
                                </button>
                                <button
                                  onClick={() => handleRequestAction(req.id, 'deposit', 'reject')}
                                  className="px-2 py-1 rounded text-xs bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors"
                                >
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
                                <button
                                  onClick={() => handleRequestAction(req.id, 'withdrawal', 'approve')}
                                  className="px-2 py-1 rounded text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 transition-colors"
                                >
                                  批准
                                </button>
                                <button
                                  onClick={() => handleRequestAction(req.id, 'withdrawal', 'reject')}
                                  className="px-2 py-1 rounded text-xs bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors"
                                >
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

      {/* Markets tab */}
      {activeTab === 'markets' && (
        <div>
          {/* Status filter */}
          <div className="flex gap-2 mb-4">
            {['all', 'active', 'pending', 'resolved'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white')}>
                {s === 'all' ? '全部' : s === 'active' ? '活跃' : s === 'pending' ? '待审核' : '已结算'}
              </button>
            ))}
          </div>

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

      {/* Create tab */}
      {activeTab === 'create' && (
        <div className="max-w-2xl">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">手动创建市场</h2>
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
        </div>
      )}

      {/* Stats tab */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />分类分布
            </h3>
            <div className="space-y-2">
              {categories.map(cat => {
                const count = markets.filter(m => m.category === cat).length
                if (!count) return null
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className={cn('text-xs w-24 shrink-0', getCategoryColor(cat).split(' ')[0])}>{cat}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-800">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(count / markets.length) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />数据来源
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">手动创建</span>
                <span className="text-white font-medium">{markets.length - stats.fromPolymarket}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">来自 Polymarket</span>
                <span className="text-purple-400 font-medium">{stats.fromPolymarket}</span>
              </div>
              <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
                <span className="text-sm text-gray-300 font-medium">总计</span>
                <span className="text-white font-bold">{markets.length}</span>
              </div>
            </div>
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
