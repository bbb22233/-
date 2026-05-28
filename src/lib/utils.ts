import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatVolume(num: number): string {
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`
  return `$${num}`
}

export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}

export function formatPercent(num: number): string {
  return `${(num * 100).toFixed(0)}%`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function timeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff < 0) return '已结束'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 30) return `${Math.floor(days / 30)}个月后`
  if (days > 0) return `${days}天后`
  return '今天结束'
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    BTC: 'text-orange-400 bg-orange-400/10',
    ETH: 'text-blue-400 bg-blue-400/10',
    DeFi: 'text-purple-400 bg-purple-400/10',
    Layer2: 'text-cyan-400 bg-cyan-400/10',
    Regulation: 'text-red-400 bg-red-400/10',
    NFT: 'text-pink-400 bg-pink-400/10',
  }
  return map[category] || 'text-gray-400 bg-gray-400/10'
}
