'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Trophy, BarChart2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const tabs = [
  { label: 'Home',       icon: Home,     href: '/',            exact: true  },
  { label: 'Search',     icon: Search,   href: '/markets',     exact: false },
  { label: 'Leaderboard', icon: Trophy,  href: '/leaderboard', exact: true  },
  { label: 'Portfolio',  icon: BarChart2, href: '/portfolio',  exact: true  },
  { label: 'Profile',    icon: User,     href: '/profile',     exact: true  },
]

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-gray-950/95 backdrop-blur border-t border-gray-800"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-stretch h-14">
        {tabs.map(tab => {
          const active = isActive(tab.href, tab.exact)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 gap-0.5 px-1 transition-colors active:opacity-70',
                active ? 'text-blue-400' : 'text-gray-500'
              )}
            >
              <tab.icon className="w-5 h-5 shrink-0" strokeWidth={active ? 2.5 : 2} />
              {tab.href === '/portfolio' && user ? (
                <span className={cn('text-[10px] font-medium leading-tight tabular-nums',
                  active ? 'text-blue-400' : 'text-emerald-400')}>
                  ${user.balance.toFixed(0)}
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
