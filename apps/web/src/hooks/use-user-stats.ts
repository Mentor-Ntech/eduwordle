'use client'

import { useAccount, useReadContract } from 'wagmi'
import { useChainId } from 'wagmi'
import { getContractAddresses, getActiveChainId } from '@/lib/contracts/config'
import EduWordleABI from '@/lib/contracts/EduWordle.json'
import { formatUnits } from 'viem'
import { type Address } from 'viem'
import { useCallback } from 'react'

/**
 * Hook to fetch user stats from the EduWordle contract
 * Returns user streak, claim status, hints purchased, and reward amount
 */
export function useUserStats() {
  const { address, isConnected } = useAccount()
  const walletChainId = useChainId()
  const activeChainId = getActiveChainId(walletChainId)
  const contracts = getContractAddresses(activeChainId)
  const contractAddress = contracts.eduWordle as Address
  const isContractConfigured = contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000'
  const shouldQuery = !!address && isConnected && isContractConfigured

  // Fetch user streak
  const { data: streak, refetch: refetchStreak } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'getUserStreak',
    args: address ? [address as Address] : undefined,
    chainId: activeChainId,
    query: {
      enabled: shouldQuery,
      refetchInterval: 30000, // Refetch every 30 seconds
      refetchOnWindowFocus: false, // Don't refetch on focus to maintain connection
    },
  })

  // Check if user claimed today
  const { data: hasClaimed, refetch: refetchHasClaimed } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'hasUserClaimed',
    args: address ? [address as Address] : undefined,
    chainId: activeChainId,
    query: {
      enabled: shouldQuery,
      refetchInterval: 30000,
      refetchOnWindowFocus: false,
    },
  })

  // Get hints purchased today
  const { data: hintsPurchased, refetch: refetchHintsPurchased } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'getHintsPurchased',
    args: address ? [address as Address] : undefined,
    chainId: activeChainId,
    query: {
      enabled: shouldQuery,
      refetchInterval: 30000,
      refetchOnWindowFocus: false,
    },
  })

  // Get reward amount for user
  const { data: rewardAmount, refetch: refetchRewardAmount } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'getRewardAmount',
    args: address ? [address as Address] : undefined,
    chainId: activeChainId,
    query: {
      enabled: shouldQuery,
      refetchInterval: 30000,
      refetchOnWindowFocus: false,
    },
  })

  // Format reward amount from wei to cUSD
  const formattedRewardAmount = rewardAmount
    ? parseFloat(formatUnits(rewardAmount as bigint, 18)).toFixed(2)
    : '0.00'

  // Refetch all stats - memoized to prevent infinite loops
  const refetchAll = useCallback(() => {
    refetchStreak()
    refetchHasClaimed()
    refetchHintsPurchased()
    refetchRewardAmount()
  }, [refetchStreak, refetchHasClaimed, refetchHintsPurchased, refetchRewardAmount])

  return {
    streak: streak ? Number(streak) : 0,
    hasClaimed: hasClaimed as boolean ?? false,
    hintsPurchased: hintsPurchased ? Number(hintsPurchased) : 0,
    rewardAmount: formattedRewardAmount,
    rawRewardAmount: rewardAmount as bigint | undefined,
    isLoading: !shouldQuery,
    refetch: refetchAll,
  }
}

