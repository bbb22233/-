'use client'

import useSWR from 'swr'
import { Market, MarketCategory } from '@/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface UseMarketsOptions {
  category?: MarketCategory | 'All'
  sort?: 'volume' | 'newest' | 'ending'
  search?: string
  showResolved?: boolean
}

interface UseMarketsResult {
  markets: Market[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useMarkets({
  category,
  sort,
  search,
  showResolved,
}: UseMarketsOptions = {}): UseMarketsResult {
  const params = new URLSearchParams()
  if (category && category !== 'All') params.set('category', category)
  if (sort) params.set('sort', sort)
  if (search) params.set('search', search)
  if (showResolved) params.set('status', 'resolved')

  const query = params.toString()
  const url = `/api/markets${query ? `?${query}` : ''}`

  const { data, error, isLoading, mutate } = useSWR<Market[]>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })

  return {
    markets: data ?? [],
    isLoading,
    error: error ?? null,
    refetch: mutate,
  }
}
