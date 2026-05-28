'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, MessageCircle, Clock, TrendingUp, Share2, Bookmark, Info } from 'lucide-react'
import { mockMarkets, generatePriceHistory, mockComments } from '@/lib/mock-data'
import { PriceChart } from '@/components/charts/PriceChart'
import { TradingPanel } from '@/components/markets/TradingPanel'
import { CommentSection } from '@/components/markets/CommentSection'
import { Badge } from '@/components/ui/badge'
import { LoginModal } from '@/components/auth/LoginModal'
import { useAuth } from '@/hooks/useAuth'
import { formatVolume, formatDate, timeUntil, getCategoryColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const market = mockMarkets.find(m => m.id === id)
  const { isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'chart' | 'comments' | 'info'>('chart')
  const [bookmarked, setBookmarked] = useState(false)

  if (!market) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400">市场不存在</p>
        <Link href="/" className="text-blue-400 hover:underline mt-2 block">返回首页</Link>
      </div>
    )
  }

  const priceHistory = generatePriceHistory(market.yesPrice)
  const yesPercent = Math.round(market.yesPrice * 100)

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/" className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            返回市场
          </Link>
          <span className="text-gray-700">/</span>
          <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium', getCategoryColor(market.category))}>
            {market.category}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {market.status === 'resolved' && (
                    <Badge variant={market.resolvedOutcome === 'yes' ? 'success' : 'danger'}>
                      已结算：{market.resolvedOutcome === 'yes' ? 'YES 胜出' : 'NO 胜出'}
                    </Badge>
                  )}
                  {market.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-400 text-xs">#{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => setBookmarked(!bookmarked)} className={cn('p-2 rounded-lg transition-colors', bookmarked ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800')}>
                    <Bookmark className={cn('w-4 h-4', bookmarked && 'fill-yellow-400')} />
                  </button>
                  <button className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-white mb-4">{market.title}</h1>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{market.description}</p>

              {/* Current odds */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-emerald-400 font-semibold">YES {yesPercent}%</span>
                    <span className="text-red-400 font-semibold">NO {100 - yesPercent}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all" style={{ width: `${yesPercent}%` }} />
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: '交易量', value: formatVolume(market.volume), icon: TrendingUp },
                  { label: '流动性', value: formatVolume(market.liquidity), icon: TrendingUp },
                  { label: '参与者', value: market.participantCount.toLocaleString(), icon: Users },
                  { label: '截止日期', value: timeUntil(market.endDate), icon: Clock },
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-800/60 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-sm font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div>
              <div className="flex border-b border-gray-800 mb-4">
                {(['chart', 'comments', 'info'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
                      activeTab === tab ? 'text-white border-blue-500' : 'text-gray-500 border-transparent hover:text-gray-300'
                    )}
                  >
                    {tab === 'chart' ? '价格走势' : tab === 'comments' ? `评论 (${mockComments.length})` : '规则'}
                  </button>
                ))}
              </div>

              {activeTab === 'chart' && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                  <h3 className="text-sm font-medium text-gray-400 mb-4">30天价格历史</h3>
                  <PriceChart data={priceHistory} />
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" />YES 概率</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500 inline-block rounded" />NO 概率</span>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                  <CommentSection comments={mockComments} onOpenLogin={() => setLoginModalOpen(true)} />
                </div>
              )}

              {activeTab === 'info' && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">结算规则</h4>
                      <p className="text-sm text-gray-400">市场将根据 Chainlink 预言机提供的链上数据进行自动结算。结算时间为截止日期后24小时内。如预言机数据不可用，将由管理员进行手动结算。</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-800 pt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">创建时间</span>
                      <span className="text-gray-300">{formatDate(market.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">截止时间</span>
                      <span className="text-gray-300">{formatDate(market.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">交易手续费</span>
                      <span className="text-gray-300">2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">结算来源</span>
                      <span className="text-gray-300">Chainlink Oracle</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Trading panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <TradingPanel market={market} onOpenLogin={() => setLoginModalOpen(true)} />
            </div>
          </div>
        </div>
      </div>

      <LoginModal open={loginModalOpen || isLoginModalOpen} onClose={() => { setLoginModalOpen(false); closeLoginModal() }} />
    </>
  )
}
