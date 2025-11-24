'use client'

import { useAccount, useReadContract } from 'wagmi'
import { useChainId } from 'wagmi'
import { getContractAddresses } from '@/lib/contracts/config'
import LeaderboardABI from '@/lib/contracts/Leaderboard.json'
import { formatUnits } from 'viem'
import { type Address } from 'viem'
import { useMemo } from 'react'

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
  const chainId = useChainId()
  const contracts = getContractAddresses(chainId)
  const leaderboardAddress = contracts.leaderboard as Address

  const isContractDeployed = !!leaderboardAddress && leaderboardAddress !== '0x0000000000000000000000000000000000000000'

  // Get top players by wins
  const { data: topByWins, refetch: refetchWins, isLoading: isLoadingWins, isFetching: isFetchingWins } = useReadContract({
    address: leaderboardAddress,
    abi: LeaderboardABI,
    functionName: 'getTopPlayersByWins',
    args: [BigInt(limit)],
    query: {
      enabled: isContractDeployed,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  })

  // Get top players by streak
  const { data: topByStreak, refetch: refetchStreak, isLoading: isLoadingStreak, isFetching: isFetchingStreak } = useReadContract({
    address: leaderboardAddress,
    abi: LeaderboardABI,
    functionName: 'getTopPlayersByStreak',
    args: [BigInt(limit)],
    query: {
      enabled: isContractDeployed,
      refetchInterval: 30000,
    },
  })

  // Get player stats for current user
  const { data: currentUserStats, isLoading: isLoadingUserStats } = useReadContract({
    address: leaderboardAddress,
    abi: LeaderboardABI,
    functionName: 'getPlayerStats',
    args: address ? [address as Address] : undefined,
    query: {
      enabled: !!address && isConnected && isContractDeployed,
    },
  })

  // Transform top players by wins data
  const winnersEntries: LeaderboardEntry[] = useMemo(() => {
    if (!topByWins || !Array.isArray(topByWins) || topByWins.length !== 2) {
      return []
    }

    const [players, wins] = topByWins as [Address[], bigint[]]

    return players.map((player, index) => ({
      rank: index + 1,
      address: player,
      wins: Number(wins[index]),
      streak: 0, // Will be filled if needed from player stats
      totalRewards: '0.00', // Will be filled if needed from player stats
      isCurrentUser: address?.toLowerCase() === player.toLowerCase(),
    }))
  }, [topByWins, address])

  // Transform top players by streak data
  const streakEntries: LeaderboardEntry[] = useMemo(() => {
    if (!topByStreak || !Array.isArray(topByStreak) || topByStreak.length !== 2) {
      return []
    }

    const [players, streaks] = topByStreak as [Address[], bigint[]]

    return players.map((player, index) => ({
      rank: index + 1,
      address: player,
      wins: 0, // Will be filled if needed from player stats
      streak: Number(streaks[index]),
      totalRewards: '0.00', // Will be filled if needed from player stats
      isCurrentUser: address?.toLowerCase() === player.toLowerCase(),
    }))
  }, [topByStreak, address])

  // Refetch all leaderboard data
  const refetchAll = () => {
    refetchWins()
    refetchStreak()
  }

  // Determine loading state: loading if contract not deployed OR queries are loading
  const isLoading = !isContractDeployed || isLoadingWins || isLoadingStreak || isLoadingUserStats || isFetchingWins || isFetchingStreak

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
    refetch: refetchAll,
  }
}

