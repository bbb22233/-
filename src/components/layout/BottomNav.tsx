'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Search, Zap, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const tabs = [
  {
    label: '首页',
    icon: TrendingUp,
    href: '/',
    matchExact: true,
  },
  {
    label: '搜索',
    icon: Search,
    href: '/?search=1',
    matchExact: false,
  },
  {
    label: '突发',
    icon: Zap,
    href: '/?tab=hot',
    matchExact: false,
  },
  {
    label: '持仓',
    icon: BarChart2,
    href: '/portfolio',
    matchExact: true,
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  function isActive(tab: (typeof tabs)[number]): boolean {
    if (tab.matchExact) {
      return pathname === tab.href
    }
    return pathname === tab.href
  }

  function formatBalance(balance: number): string {
    if (balance >= 1000) {
      return `$${(balance / 1000).toFixed(1)}k`
    }
    return `$${balance.toFixed(2)}`
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-gray-950 border-t border-gray-800">
      <div className="flex items-stretch h-16 pb-safe">
        {tabs.map((tab) => {
          const active = isActive(tab)
          const isPortfolio = tab.href === '/portfolio'

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 gap-0.5 px-1 transition-colors',
                active ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <tab.icon className="w-5 h-5 shrink-0" />
              {isPortfolio && user ? (
                <span className={cn('text-[10px] font-medium leading-tight', active ? 'text-blue-400' : 'text-emerald-400')}>
                  {formatBalance(user.balance)}
                </span>
              ) : (
                <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
