'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Trophy, PlusCircle, Wallet, LogOut, User, Menu, X, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoginModal } from '@/components/auth/LoginModal'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: '市场', icon: TrendingUp },
  { href: '/portfolio', label: '持仓', icon: BarChart2 },
  { href: '/leaderboard', label: '排行榜', icon: Trophy },
  { href: '/create', label: '创建市场', icon: PlusCircle },
]

export function Header() {
  const pathname = usePathname()
  const { user, logout, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-gray-800/80 bg-gray-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg hidden sm:block">CryptoPredict</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-white bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 hover:bg-gray-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.username[0]}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-medium text-white leading-none">{user.username}</p>
                    <p className="text-xs text-emerald-400 leading-none mt-0.5">{formatCurrency(user.balance)}</p>
                  </div>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-800 bg-gray-950 shadow-2xl p-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-800 mb-1">
                      <p className="text-sm font-medium text-white">{user.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{user.walletAddress}</p>
                    </div>
                    <Link href="/portfolio" className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setProfileOpen(false)}>
                      <Wallet className="w-4 h-4" /> 我的持仓
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setProfileOpen(false)}>
                      <User className="w-4 h-4" /> 个人资料
                    </Link>
                    <button onClick={() => { logout(); setProfileOpen(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" /> 退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={openLoginModal} size="sm">
                登录 / 注册
              </Button>
            )}
            {/* Mobile menu */}
            <button className="md:hidden text-gray-400 hover:text-white p-1" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
                onClick={() => setMobileOpen(false)}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <LoginModal open={isLoginModalOpen} onClose={closeLoginModal} />

      {/* Overlay to close profile dropdown */}
      {profileOpen && <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />}
    </>
  )
}
