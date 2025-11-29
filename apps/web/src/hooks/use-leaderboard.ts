'use client'

import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { useChainId } from 'wagmi'
import { getContractAddresses, getActiveChainId } from '@/lib/contracts/config'
import LeaderboardABI from '@/lib/contracts/Leaderboard.json'
import EduWordleABI from '@/lib/contracts/EduWordle.json'
import { formatUnits } from 'viem'
import { type Address, type Abi } from 'viem'
import { useEffect, useMemo, useState, useCallback } from 'react'

export interface LeaderboardEntry {
  rank: number
  address: string
  wins: number
  streak: number
  totalRewards: string
  isCurrentUser?: boolean
}

/**
 * Hook to fetch leaderboard data from the contract
 * Returns top players by wins and by streak
 */
export function useLeaderboard(limit: number = 10) {
  const { address, isConnected } = useAccount()
  const walletChainId = useChainId()
  const activeChainId = getActiveChainId(walletChainId)
  const contracts = getContractAddresses(activeChainId)
  const leaderboardAddress = contracts.leaderboard as Address
  const eduWordleAddress = contracts.eduWordle as Address
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const [supabaseWins, setSupabaseWins] = useState<LeaderboardEntry[]>([])
  const [supabaseStreak, setSupabaseStreak] = useState<LeaderboardEntry[]>([])

  const isContractDeployed = !!leaderboardAddress && leaderboardAddress !== '0x0000000000000000000000000000000000000000'

  const {
    data: onChainLeaderboard,
    isLoading: isLoadingOnChainLeaderboard,
  } = useReadContract({
    address: eduWordleAddress,
    abi: EduWordleABI,
    functionName: 'leaderboardContract',
    chainId: activeChainId,
    query: {
      enabled: !!eduWordleAddress && !!activeChainId,
      refetchInterval: 60000,
    },
  })

  const normalizedOnChain = (onChainLeaderboard as Address | undefined) || undefined
  const isLeaderboardConnected = !!normalizedOnChain && normalizedOnChain !== ZERO_ADDRESS
  const hasAddressMismatch =
    isLeaderboardConnected &&
    isContractDeployed &&
    !!leaderboardAddress &&
    normalizedOnChain!.toLowerCase() !== leaderboardAddress.toLowerCase()

  // Get top players by wins
  const { data: topByWins, refetch: refetchWins, isLoading: isLoadingWins, isFetching: isFetchingWins, error: errorWins } = useReadContract({
    address: leaderboardAddress,
    abi: LeaderboardABI,
    functionName: 'getTopPlayersByWins',
    args: [BigInt(limit)],
    chainId: activeChainId,
    query: {
      enabled: isContractDeployed,
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 15000, // Consider data stale after 15 seconds
      refetchOnWindowFocus: false, // Don't refetch on focus to maintain connection
      refetchOnMount: true, // Always refetch on mount to get latest data
    },
  })

  // Get top players by streak
  const { data: topByStreak, refetch: refetchStreak, isLoading: isLoadingStreak, isFetching: isFetchingStreak, error: errorStreak } = useReadContract({
    address: leaderboardAddress,
    abi: LeaderboardABI,
    functionName: 'getTopPlayersByStreak',
    args: [BigInt(limit)],
    chainId: activeChainId,
    query: {
      enabled: isContractDeployed,
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 15000, // Consider data stale after 15 seconds
      refetchOnWindowFocus: false, // Don't refetch on focus to maintain connection
      refetchOnMount: true, // Always refetch on mount to get latest data
    },
  })

  // Get player stats for current user
  const { data: currentUserStats, isLoading: isLoadingUserStats } = useReadContract({
    address: leaderboardAddress,
    abi: LeaderboardABI,
    functionName: 'getPlayerStats',
    args: address ? [address as Address] : undefined,
    chainId: activeChainId,
    query: {
      enabled: !!address && isConnected && isContractDeployed,
      refetchOnWindowFocus: false, // Don't refetch on focus to maintain connection
      refetchOnMount: true, // Always refetch on mount
    },
  })

  // Collect unique addresses from both leaderboards for additional stats
  const leaderboardAddresses = useMemo(() => {
    const seen = new Set<string>()
    const addresses: Address[] = []

    const addAddresses = (data: [Address[], bigint[]] | undefined) => {
      if (!data) return
      const [players] = data
      players.forEach((player) => {
        const key = player.toLowerCase()
        if (!seen.has(key) && player !== '0x0000000000000000000000000000000000000000') {
          seen.add(key)
          addresses.push(player)
        }
      })
    }

    if (topByWins && Array.isArray(topByWins) && topByWins.length === 2) {
      addAddresses(topByWins as [Address[], bigint[]])
    }

    if (topByStreak && Array.isArray(topByStreak) && topByStreak.length === 2) {
      addAddresses(topByStreak as [Address[], bigint[]])
    }

    return addresses
  }, [topByWins, topByStreak])

  // Fetch detailed stats for all leaderboard addresses
  const {
    data: playerStatsResults,
    refetch: refetchPlayerStats,
    isLoading: isLoadingPlayerStats,
    isFetching: isFetchingPlayerStats,
  } = useReadContracts({
    contracts: leaderboardAddresses.map((playerAddress) => ({
      address: leaderboardAddress,
      abi: LeaderboardABI as Abi,
      functionName: 'getPlayerStats',
      args: [playerAddress],
      chainId: activeChainId,
    })),
    query: {
      enabled: isContractDeployed && leaderboardAddresses.length > 0,
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 15000, // Consider data stale after 15 seconds
      refetchOnWindowFocus: false, // Don't refetch on focus to maintain connection
      refetchOnMount: true, // Always refetch on mount
    },
  })

  const playerStatsMap = useMemo(() => {
    const map = new Map<string, { longestStreak: number; totalRewards: string; totalWins: number }>()

    if (!playerStatsResults) {
      return map
    }

    playerStatsResults.forEach((result, index) => {
      const stats = result?.result as {
        totalWins: bigint
        longestStreak: bigint
        totalRewardsEarned: bigint
      } | undefined

      if (!stats) return

      const addressKey = leaderboardAddresses[index]?.toLowerCase()
      if (!addressKey) return

      map.set(addressKey, {
        longestStreak: Number(stats.longestStreak),
        totalRewards: formatUnits(stats.totalRewardsEarned, 18),
        totalWins: Number(stats.totalWins),
      })
    })

    return map
  }, [playerStatsResults, leaderboardAddresses])

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) return
    let cancelled = false
    const headers = {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    }

    const fetchSupabaseLeaderboard = async () => {
      try {
        const winsResponse = await fetch(
          `${supabaseUrl}/rest/v1/player_stats_view?select=address,total_wins,longest_streak,total_rewards&order=total_wins.desc.nullslast&limit=${limit}`,
          { headers }
        )
        if (winsResponse.ok) {
          const winsData = await winsResponse.json()
          if (!cancelled && Array.isArray(winsData)) {
            const mappedWins = winsData.map((row: any, index: number) => ({
              rank: index + 1,
              address: row.address,
              wins: row.total_wins ?? 0,
              streak: row.longest_streak ?? 0,
              totalRewards: Number(row.total_rewards ?? 0).toFixed(2),
              isCurrentUser: address?.toLowerCase() === row.address?.toLowerCase(),
            }))
            setSupabaseWins(mappedWins)
          }
        }

        const streakResponse = await fetch(
          `${supabaseUrl}/rest/v1/player_stats_view?select=address,total_wins,longest_streak,total_rewards&order=longest_streak.desc.nullslast&limit=${limit}`,
          { headers }
        )
        if (streakResponse.ok) {
          const streakData = await streakResponse.json()
          if (!cancelled && Array.isArray(streakData)) {
            const mappedStreak = streakData.map((row: any, index: number) => ({
              rank: index + 1,
              address: row.address,
              wins: row.total_wins ?? 0,
              streak: row.longest_streak ?? 0,
              totalRewards: Number(row.total_rewards ?? 0).toFixed(2),
              isCurrentUser: address?.toLowerCase() === row.address?.toLowerCase(),
            }))
            setSupabaseStreak(mappedStreak)
          }
        }
      } catch (error) {
        console.warn('Failed to fetch Supabase leaderboard', error)
      }
    }

    fetchSupabaseLeaderboard()
    return () => {
      cancelled = true
    }
  }, [supabaseUrl, supabaseAnonKey, limit, address])

  // Transform top players by wins data
  const contractWinsEntries: LeaderboardEntry[] = useMemo(() => {
    if (!topByWins || !Array.isArray(topByWins) || topByWins.length !== 2) {
      return []
    }

    const [players, wins] = topByWins as [Address[], bigint[]]

    return players.map((player, index) => ({
      rank: index + 1,
      address: player,
      wins: Number(wins[index]),
      streak: playerStatsMap.get(player.toLowerCase())?.longestStreak ?? 0,
      totalRewards: playerStatsMap.get(player.toLowerCase())?.totalRewards ?? '0.00',
      isCurrentUser: address?.toLowerCase() === player.toLowerCase(),
    }))
  }, [topByWins, address, playerStatsMap])

  const winnersEntries =
    contractWinsEntries.length > 0 ? contractWinsEntries : supabaseWins

  // Transform top players by streak data
  const contractStreakEntries: LeaderboardEntry[] = useMemo(() => {
    if (!topByStreak || !Array.isArray(topByStreak) || topByStreak.length !== 2) {
      return []
    }

    const [players, streaks] = topByStreak as [Address[], bigint[]]

    return players.map((player, index) => ({
      rank: index + 1,
      address: player,
      wins: playerStatsMap.get(player.toLowerCase())?.totalWins ?? 0,
      streak: Number(streaks[index]),
      totalRewards: playerStatsMap.get(player.toLowerCase())?.totalRewards ?? '0.00',
      isCurrentUser: address?.toLowerCase() === player.toLowerCase(),
    }))
  }, [topByStreak, address, playerStatsMap])

  const streakEntries =
    contractStreakEntries.length > 0 ? contractStreakEntries : supabaseStreak

  // Refetch all leaderboard data - memoized to prevent infinite loops
  const refetchAll = useCallback(() => {
    refetchWins()
    refetchStreak()
    refetchPlayerStats()
  }, [refetchWins, refetchStreak, refetchPlayerStats])

  // Determine loading state:
  // - Loading if contract not deployed
  // - Loading if main queries (wins/streak) are loading/fetching
  // - Don't wait for playerStats if no players yet (empty leaderboard)
  const isLoading = useMemo(() => {
    if (!isContractDeployed) return true

    if (
      isLoadingWins ||
      isLoadingStreak ||
      isFetchingWins ||
      isFetchingStreak ||
      isLoadingOnChainLeaderboard
    ) {
      return true
    }

    if (leaderboardAddresses.length > 0 && (isLoadingPlayerStats || isFetchingPlayerStats)) {
      return true
    }

    if (address && isConnected && isLoadingUserStats) {
      return true
    }

    return false
  }, [
    isContractDeployed,
    isLoadingWins,
    isLoadingStreak,
    isLoadingUserStats,
    isLoadingPlayerStats,
    isFetchingWins,
    isFetchingStreak,
    isFetchingPlayerStats,
    leaderboardAddresses.length,
    address,
    isConnected,
    isLoadingOnChainLeaderboard,
  ])

  return {
    topByWins: winnersEntries,
    topByStreak: streakEntries,
    currentUserStats: currentUserStats
      ? {
          totalWins: Number((currentUserStats as any).totalWins),
          longestStreak: Number((currentUserStats as any).longestStreak),
          currentStreak: Number((currentUserStats as any).currentStreak),
          totalRewardsEarned: formatUnits((currentUserStats as any).totalRewardsEarned as bigint, 18),
          exists: (currentUserStats as any).exists,
        }
      : null,
    isLoading,
    isContractDeployed,
    isLeaderboardConnected,
    hasAddressMismatch,
    expectedLeaderboardAddress: leaderboardAddress,
    onChainLeaderboardAddress: normalizedOnChain,
    refetch: refetchAll,
  }
}

