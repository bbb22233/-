'use client'

import { create } from 'zustand'
import { User } from '@/types'

interface AuthStore {
  user: User | null
  isLoading: boolean
  isLoginModalOpen: boolean
  hydrated: boolean
  setUser: (user: User | null) => void
  setLoading: (v: boolean) => void
  openLoginModal: () => void
  closeLoginModal: () => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  isLoginModalOpen: false,
  hydrated: false,

  hydrate: () => {
    const stored = localStorage.getItem('auth_user')
    set({ user: stored ? JSON.parse(stored) : null, hydrated: true })
  },

  setUser: (user) => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user))
    else localStorage.removeItem('auth_user')
    set({ user })
  },

  setLoading: (v) => set({ isLoading: v }),
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  logout: () => {
    localStorage.removeItem('auth_user')
    set({ user: null })
  },
}))
