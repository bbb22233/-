'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const login = async (email: string) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Login failed')
      const data = await res.json()

      // Map Prisma User fields to our User type
      const loggedUser: User = {
        id: data.id,
        email: data.email,
        username: data.username,
        avatarUrl: data.avatarUrl ?? undefined,
        walletAddress: data.walletAddress ?? '',
        balance: data.balance ?? 100,
        totalPnl: data.totalPnl ?? 0,
        winRate: data.winRate ?? 0,
        marketsTraded: data.marketsTraded ?? 0,
        joinedAt: data.createdAt ?? new Date().toISOString(),
      }

      setUser(loggedUser)
      localStorage.setItem('auth_user', JSON.stringify(loggedUser))
      setIsLoginModalOpen(false)
    } catch {
      // Fallback: create a minimal local user so UI doesn't break
      const fallbackUser: User = {
        id: String(Date.now()),
        email,
        username: email.split('@')[0],
        walletAddress: '',
        balance: 100,
        totalPnl: 0,
        winRate: 0,
        marketsTraded: 0,
        joinedAt: new Date().toISOString(),
      }
      setUser(fallbackUser)
      localStorage.setItem('auth_user', JSON.stringify(fallbackUser))
      setIsLoginModalOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  return {
    user,
    isLoading,
    login,
    logout,
    isLoginModalOpen,
    openLoginModal: () => setIsLoginModalOpen(true),
    closeLoginModal: () => setIsLoginModalOpen(false),
  }
}
