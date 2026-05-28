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

  // Can be called with pre-fetched data (from verify endpoint) or just email (legacy)
  const login = async (email: string, userData?: Record<string, unknown>) => {
    setIsLoading(true)
    try {
      const data = userData ?? await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).then(r => r.json())

      const loggedUser: User = {
        id: String(data.id),
        email: String(data.email),
        username: String(data.username),
        avatarUrl: data.avatarUrl ? String(data.avatarUrl) : undefined,
        walletAddress: data.walletAddress ? String(data.walletAddress) : '',
        balance: Number(data.balance ?? 100),
        totalPnl: Number(data.totalPnl ?? 0),
        winRate: Number(data.winRate ?? 0),
        marketsTraded: Number(data.marketsTraded ?? 0),
        joinedAt: String(data.createdAt ?? new Date().toISOString()),
      }

      setUser(loggedUser)
      localStorage.setItem('auth_user', JSON.stringify(loggedUser))
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
