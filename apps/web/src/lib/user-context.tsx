'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useUserStats as useContractUserStats } from '@/hooks/use-user-stats'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { useAccount } from 'wagmi'

interface UserStats {
  streak: number
  winsThisMonth: number
  totalEarnings: string
  gamesPlayed: number
  totalWins: number
}

interface UserContextType {
  stats: UserStats
  isLoading: boolean
  updateStats: (stats: Partial<UserStats>) => void
  addWin: (earnings: number) => void
  refetch: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Default stats when wallet not connected
const DEFAULT_STATS: UserStats = {
  streak: 0,
  winsThisMonth: 0,
  totalEarnings: '0.00',
  gamesPlayed: 0,
  totalWins: 0
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, address } = useAccount()
  
  // Fetch real contract data
  const contractStats = useContractUserStats()
  const { currentUserStats } = useLeaderboard(1) // Only need current user's stats
  
  const [cachedStats, setCachedStats] = useState<UserStats>(DEFAULT_STATS)

  // Load cached stats from localStorage on mount
  useEffect(() => {
    if (address) {
      const savedStats = localStorage.getItem(`eduwordle_stats_${address.toLowerCase()}`)
      if (savedStats) {
        try {
          setCachedStats(JSON.parse(savedStats))
        } catch (e) {
          console.error('Failed to parse cached stats:', e)
        }
      }
    }
  }, [address])

  // Merge contract data with cached data
  const stats: UserStats = useMemo(() => {
    if (!isConnected || !address) {
      return DEFAULT_STATS
    }

    // Use contract data as primary source
    const contractStreak = contractStats.streak || 0
    const contractReward = contractStats.rewardAmount || '0.00'
    
    // Get total wins from leaderboard if available
    const totalWins = currentUserStats?.totalWins || cachedStats.totalWins || 0
    const totalEarnings = currentUserStats?.totalRewardsEarned || cachedStats.totalEarnings || contractReward

    // Calculate monthly wins (approximate - based on cached data for now)
    // In production, this could be calculated from on-chain events
    const winsThisMonth = cachedStats.winsThisMonth || 0

    return {
      streak: contractStreak,
      winsThisMonth,
      totalEarnings: parseFloat(totalEarnings).toLocaleString('en-US', { maximumFractionDigits: 2 }),
      gamesPlayed: cachedStats.gamesPlayed || totalWins, // Approximate
      totalWins,
    }
  }, [isConnected, address, contractStats.streak, contractStats.rewardAmount, currentUserStats, cachedStats])

  // Save stats to localStorage when they change
  useEffect(() => {
    if (address && isConnected) {
      localStorage.setItem(`eduwordle_stats_${address.toLowerCase()}`, JSON.stringify(stats))
    }
  }, [address, isConnected, stats])

  const updateStats = (newStats: Partial<UserStats>) => {
    setCachedStats(prev => {
      const updated = { ...prev, ...newStats }
      if (address) {
        localStorage.setItem(`eduwordle_stats_${address.toLowerCase()}`, JSON.stringify(updated))
      }
      return updated
    })
  }

  const addWin = (earnings: number) => {
    setCachedStats(prev => {
      const currentEarnings = parseFloat(prev.totalEarnings.replace(/,/g, ''))
      const newTotal = (currentEarnings + earnings).toFixed(2)
      const updated = {
        ...prev,
        totalWins: prev.totalWins + 1,
        streak: prev.streak + 1,
        winsThisMonth: prev.winsThisMonth + 1,
        totalEarnings: parseFloat(newTotal).toLocaleString('en-US', { maximumFractionDigits: 2 })
      }
      if (address) {
        localStorage.setItem(`eduwordle_stats_${address.toLowerCase()}`, JSON.stringify(updated))
      }
      return updated
    })
  }

  const refetch = () => {
    contractStats.refetch()
  }

  const isLoading = isConnected && contractStats.isLoading

  return (
    <UserContext.Provider value={{ stats, isLoading, updateStats, addWin, refetch }}>
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
