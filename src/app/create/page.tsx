'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, Info, Loader2, CheckCircle, Calendar, DollarSign, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { LoginModal } from '@/components/auth/LoginModal'
import { MarketCategory } from '@/types'
import { cn } from '@/lib/utils'

const categories: MarketCategory[] = ['BTC', 'ETH', 'DeFi', 'Layer2', 'NFT', 'Regulation', 'Politics', 'Elections', 'Sports', 'Entertainment', 'AI', 'Tech', 'Economy', 'World']
const resolutionSources = ['Chainlink Oracle', '管理员手动结算', 'CoinGecko API', 'Dune Analytics']

export default function CreateMarketPage() {
  const router = useRouter()
  const { user, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '' as MarketCategory | '',
    endDate: '',
    resolution: '',
    liquidity: '100',
    tags: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim() || form.title.length < 10) e.title = '标题至少10个字符'
    if (!form.description.trim() || form.description.length < 20) e.description = '描述至少20个字符'
    if (!form.category) e.category = '请选择分类'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e: Record<string, string> = {}
    if (!form.endDate) e.endDate = '请选择截止日期'
    else if (new Date(form.endDate) <= new Date()) e.endDate = '截止日期必须在未来'
    if (!form.resolution) e.resolution = '请选择结算来源'
    if (!form.liquidity || parseFloat(form.liquidity) < 50) e.liquidity = '最低初始流动性为 $50'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    if (step === 2 && validateStep2()) setStep(3)
  }

  const handleSubmit = async () => {
    if (!user) { openLoginModal(); return }
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 2000))
    setIsSubmitting(false)
    setDone(true)
    setTimeout(() => router.push('/'), 2000)
  }

  if (!user) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <PlusCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">创建预测市场</h2>
          <p className="text-gray-400 mb-6">登录后即可创建你自己的预测市场</p>
          <Button onClick={openLoginModal}>登录 / 注册</Button>
        </div>
        <LoginModal open={isLoginModalOpen} onClose={closeLoginModal} />
      </>
    )
  }

  if (done) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">市场创建成功！</h2>
        <p className="text-gray-400">正在跳转到首页...</p>
      </div>
    )
  }

  const stepLabels = ['基本信息', '规则设置', '确认发布']

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
          <PlusCircle className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">创建预测市场</h1>
          <p className="text-gray-400 text-sm">赚取交易手续费的50%</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {stepLabels.map((label, idx) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
              step > idx + 1 ? 'bg-emerald-500 text-white' : step === idx + 1 ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'
            )}>
              {step > idx + 1 ? '✓' : idx + 1}
            </div>
            <span className={cn('text-xs hidden sm:block', step === idx + 1 ? 'text-white' : 'text-gray-500')}>{label}</span>
            {idx < stepLabels.length - 1 && <div className={cn('h-px w-8 transition-colors', step > idx + 1 ? 'bg-emerald-500' : 'bg-gray-700')} />}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-white">基本信息</h2>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">市场问题 *</label>
              <Input
                placeholder="例：Bitcoin在2024年底前会超过10万美元吗？"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
              <p className="text-xs text-gray-600 mt-1">{form.title.length}/200字符</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">市场描述 *</label>
              <textarea
                className={cn(
                  'w-full h-28 px-3 py-2 rounded-lg border bg-gray-800 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none',
                  errors.description ? 'border-red-500' : 'border-gray-700'
                )}
                placeholder="详细描述市场规则、结算条件和数据来源..."
                value={form.description}
                onChange={e => update('description', e.target.value)}
              />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">分类 *</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => update('category', cat)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                      form.category === cat ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">标签 (逗号分隔)</label>
              <Input placeholder="Bitcoin, Price, ATH" value={form.tags} onChange={e => update('tags', e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-white">规则设置</h2>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">截止日期 *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="date"
                  className={cn('pl-9', errors.endDate ? 'border-red-500' : '')}
                  value={form.endDate}
                  onChange={e => update('endDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.endDate && <p className="text-red-400 text-xs mt-1">{errors.endDate}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">结算来源 *</label>
              <select
                className={cn('w-full h-10 px-3 rounded-lg border bg-gray-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500', errors.resolution ? 'border-red-500' : 'border-gray-700')}
                value={form.resolution}
                onChange={e => update('resolution', e.target.value)}
              >
                <option value="">选择结算来源</option>
                {resolutionSources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.resolution && <p className="text-red-400 text-xs mt-1">{errors.resolution}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">初始流动性 (USDC) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="number"
                  className={cn('pl-9', errors.liquidity ? 'border-red-500' : '')}
                  value={form.liquidity}
                  onChange={e => update('liquidity', e.target.value)}
                  min={50}
                />
              </div>
              {errors.liquidity && <p className="text-red-400 text-xs mt-1">{errors.liquidity}</p>}
              <p className="text-xs text-gray-600 mt-1">你将获得该市场手续费收入的50%</p>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-300">市场创建后将经过平台审核（约24小时），审核通过后自动上线。初始流动性将从你的余额中扣除。</p>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">确认发布</h2>
            <div className="rounded-lg bg-gray-800/60 p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">市场问题</span>
                <span className="text-white text-right max-w-xs">{form.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">分类</span>
                <span className="text-white">{form.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">截止日期</span>
                <span className="text-white">{form.endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">结算来源</span>
                <span className="text-white">{form.resolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">初始流动性</span>
                <span className="text-white">${form.liquidity}</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between font-medium">
                <span className="text-gray-400">创建费用</span>
                <span className="text-white">$0 (免费)</span>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
              <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-300">发布后无法修改市场内容。请确认所有信息正确无误。</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
              上一步
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} className="flex-1">
              下一步
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />发布中...</> : '确认发布'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
