'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { User } from '@/types'
import { mockUser } from '@/lib/mock-data'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string) => Promise<void>
  logout: () => void
  isLoginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
}

// Simple state-based auth (no context provider needed for mock)
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
    await new Promise(r => setTimeout(r, 1500))
    const loggedUser = { ...mockUser, email }
    setUser(loggedUser)
    localStorage.setItem('auth_user', JSON.stringify(loggedUser))
    setIsLoading(false)
    setIsLoginModalOpen(false)
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
