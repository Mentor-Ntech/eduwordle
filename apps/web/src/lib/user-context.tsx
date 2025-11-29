'use client'

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react'
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

  // Extract primitive values from currentUserStats to prevent infinite loops
  // This ensures we only depend on actual values, not object references
  const userStatsValues = useMemo(() => {
    if (!currentUserStats) {
      return {
        totalWins: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalRewardsEarned: '0',
      }
    }
    return {
      totalWins: currentUserStats.totalWins ?? 0,
      currentStreak: currentUserStats.currentStreak ?? 0,
      longestStreak: currentUserStats.longestStreak ?? 0,
      totalRewardsEarned: currentUserStats.totalRewardsEarned ?? '0',
    }
  }, [
    currentUserStats?.totalWins,
    currentUserStats?.currentStreak,
    currentUserStats?.longestStreak,
    currentUserStats?.totalRewardsEarned,
  ])

  // Extract streak value to prevent object reference changes
  const contractStreak = contractStats.streak || 0

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

  // Use ref to track previous values and prevent unnecessary updates
  const prevStatsRef = useRef<string>('')

  useEffect(() => {
    if (!cacheKey || typeof window === 'undefined') return
    if (!isConnected || !address) return

    const streak = contractStreak
    const totalWins = userStatsValues.totalWins
    const currentStreak = userStatsValues.currentStreak || streak
    const longestStreak = userStatsValues.longestStreak || currentStreak
    const totalRewardsValue = Number(userStatsValues.totalRewardsEarned ?? 0)
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

    // Create a string key to compare if stats actually changed
    const statsKey = `${streak}-${totalWins}-${currentStreak}-${longestStreak}-${formattedRewards}`
    
    // Only update if values actually changed
    if (prevStatsRef.current === statsKey) {
      return
    }
    prevStatsRef.current = statsKey

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
  }, [
    cacheKey,
    contractStreak,
    userStatsValues.totalWins,
    userStatsValues.currentStreak,
    userStatsValues.longestStreak,
    userStatsValues.totalRewardsEarned,
    isConnected,
    address,
  ])

  const stats: UserStats = useMemo(() => {
    if (!isConnected || !address) {
      return cachedStats
    }

    const streak = contractStreak || cachedStats.streak || 0
    const totalWins = userStatsValues.totalWins ?? cachedStats.totalWins ?? 0
    const currentStreak = userStatsValues.currentStreak ?? cachedStats.currentStreak ?? streak
    const longestStreak =
      userStatsValues.longestStreak ?? cachedStats.longestStreak ?? currentStreak
    const totalRewardsValue = Number(userStatsValues.totalRewardsEarned ?? cachedStats.totalEarnings ?? 0)
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
  }, [
    isConnected,
    address,
    contractStreak,
    userStatsValues.totalWins,
    userStatsValues.currentStreak,
    userStatsValues.longestStreak,
    userStatsValues.totalRewardsEarned,
    cachedStats,
  ])

  // Refetch functions from wagmi/react-query are stable, so we don't need them in deps
  const refetch = useCallback(() => {
    contractStats.refetch()
    refetchLeaderboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
