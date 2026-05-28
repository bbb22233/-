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
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function timeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff < 0) return 'Ended'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 30) return `${Math.floor(days / 30)}mo`
  if (days > 0) return `${days}d`
  return 'Ends today'
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    BTC: 'text-orange-400 bg-orange-400/10',
    ETH: 'text-blue-400 bg-blue-400/10',
    DeFi: 'text-purple-400 bg-purple-400/10',
    Layer2: 'text-cyan-400 bg-cyan-400/10',
    Regulation: 'text-red-400 bg-red-400/10',
    NFT: 'text-pink-400 bg-pink-400/10',
    Politics: 'text-rose-400 bg-rose-400/10',
    Elections: 'text-red-400 bg-red-400/10',
    Sports: 'text-green-400 bg-green-400/10',
    Entertainment: 'text-yellow-400 bg-yellow-400/10',
    AI: 'text-violet-400 bg-violet-400/10',
    Tech: 'text-sky-400 bg-sky-400/10',
    Economy: 'text-emerald-400 bg-emerald-400/10',
    World: 'text-indigo-400 bg-indigo-400/10',
  }
  return map[category] || 'text-gray-400 bg-gray-400/10'
}
