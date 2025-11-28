'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useUserStats as useContractUserStats } from '@/hooks/use-user-stats'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { useAccount } from 'wagmi'

interface UserStats {
  streak: number
  currentStreak: number
  longestStreak: number
  totalWins: number
  totalEarnings: string
}

interface UserContextType {
  stats: UserStats
  isLoading: boolean
  refetch: () => void
  lastSyncedAt: string | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Default stats when wallet not connected
const DEFAULT_STATS: UserStats = {
  streak: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalWins: 0,
  totalEarnings: '0.00',
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, address } = useAccount()
  
  // Fetch real contract data
  const contractStats = useContractUserStats()
  const { currentUserStats, isLoading: isLeaderboardLoading, refetch: refetchLeaderboard } = useLeaderboard(1) // Only need current user's stats
  const [cachedStats, setCachedStats] = useState<UserStats>(DEFAULT_STATS)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)

  const cacheKey = address ? `eduwordle:stats:${address.toLowerCase()}` : null
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  useEffect(() => {
    if (!cacheKey || typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(cacheKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        setCachedStats(parsed.stats)
        setLastSyncedAt(parsed.lastSyncedAt)
      }
    } catch (error) {
      console.warn('Failed to load cached stats', error)
    }
  }, [cacheKey])

  useEffect(() => {
    if (!cacheKey || typeof window === 'undefined') return
    if (!address || isConnected) return
    if (!supabaseUrl || !supabaseAnonKey) return

    let aborted = false

    const fetchSupabaseStats = async () => {
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/player_stats_view?select=address,total_wins,longest_streak,current_streak,total_rewards,last_win_day,updated_at&address=eq.${address.toLowerCase()}`,
          {
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
            },
          }
        )

        if (!response.ok) return
        const data = await response.json()
        if (!Array.isArray(data) || data.length === 0 || aborted) return

        const row = data[0]
        const nextStats: UserStats = {
          streak: row.current_streak ?? 0,
          currentStreak: row.current_streak ?? 0,
          longestStreak: row.longest_streak ?? 0,
          totalWins: row.total_wins ?? 0,
          totalEarnings: Number(row.total_rewards ?? 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        }

        const syncedAt = row.updated_at || new Date().toISOString()
        setCachedStats(nextStats)
        setLastSyncedAt(syncedAt)

        window.localStorage.setItem(
          cacheKey,
          JSON.stringify({
            stats: nextStats,
            lastSyncedAt: syncedAt,
          })
        )
      } catch (error) {
        console.warn('Failed to fetch Supabase stats', error)
      }
    }

    fetchSupabaseStats()
    return () => {
      aborted = true
    }
  }, [cacheKey, address, supabaseUrl, supabaseAnonKey, isConnected])

  useEffect(() => {
    if (!cacheKey || typeof window === 'undefined') return
    if (!isConnected || !address) return

    const streak = contractStats.streak || 0
    const totalWins = currentUserStats?.totalWins ?? 0
    const currentStreak = currentUserStats?.currentStreak ?? streak
    const longestStreak = currentUserStats?.longestStreak ?? currentStreak
    const totalRewardsValue = Number(currentUserStats?.totalRewardsEarned ?? 0)
    const formattedRewards = Number.isNaN(totalRewardsValue)
      ? '0.00'
      : totalRewardsValue.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })

    const nextStats: UserStats = {
      streak,
      currentStreak,
      longestStreak,
      totalWins,
      totalEarnings: formattedRewards,
    }

    try {
      window.localStorage.setItem(
        cacheKey,
        JSON.stringify({
          stats: nextStats,
          lastSyncedAt: new Date().toISOString(),
        })
      )
      setCachedStats(nextStats)
      setLastSyncedAt(new Date().toISOString())
    } catch (error) {
      console.warn('Failed to cache stats', error)
    }
  }, [cacheKey, contractStats.streak, currentUserStats, isConnected, address])

  const stats: UserStats = useMemo(() => {
    if (!isConnected || !address) {
      return cachedStats
    }

    const streak = contractStats.streak || cachedStats.streak || 0
    const totalWins = currentUserStats?.totalWins ?? cachedStats.totalWins ?? 0
    const currentStreak = currentUserStats?.currentStreak ?? cachedStats.currentStreak ?? streak
    const longestStreak =
      currentUserStats?.longestStreak ?? cachedStats.longestStreak ?? currentStreak
    const totalRewardsValue = Number(currentUserStats?.totalRewardsEarned ?? cachedStats.totalEarnings ?? 0)
    const formattedRewards = Number.isNaN(totalRewardsValue)
      ? cachedStats.totalEarnings
      : totalRewardsValue.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })

    return {
      streak,
      currentStreak,
      longestStreak,
      totalWins,
      totalEarnings: formattedRewards,
    }
  }, [isConnected, address, contractStats.streak, currentUserStats, cachedStats])

  const refetch = () => {
    contractStats.refetch()
    refetchLeaderboard()
  }

  const isLoading = (isConnected && contractStats.isLoading) || isLeaderboardLoading

  return (
    <UserContext.Provider value={{ stats, isLoading, refetch, lastSyncedAt }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserStats() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUserStats must be used within a UserProvider')
  }
  return context
}
