'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { User } from '@/types'

export function useAuth() {
  const {
    user, isLoading, isLoginModalOpen,
    setUser, setLoading, openLoginModal, closeLoginModal, logout, hydrate, hydrated,
  } = useAuthStore()

  // Hydrate from localStorage once on first mount across the app
  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  const login = async (email: string, userData?: Record<string, unknown>) => {
    setLoading(true)
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
      closeLoginModal()
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    isLoading,
    login,
    logout,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
  }
}
