'use client'

import { useAccount, useReadContract } from 'wagmi'
import { useChainId } from 'wagmi'
import { getContractAddresses } from '@/lib/contracts/config'
import EduWordleABI from '@/lib/contracts/EduWordle.json'
import { formatUnits } from 'viem'
import { type Address } from 'viem'

/**
 * Hook to fetch user stats from the EduWordle contract
 * Returns user streak, claim status, hints purchased, and reward amount
 */
export function useUserStats() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const contracts = getContractAddresses(chainId)
  const contractAddress = contracts.eduWordle as Address

  // Fetch user streak
  const { data: streak, refetch: refetchStreak } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'getUserStreak',
    args: address ? [address as Address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  })

  // Check if user claimed today
  const { data: hasClaimed, refetch: refetchHasClaimed } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'hasUserClaimed',
    args: address ? [address as Address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 30000,
    },
  })

  // Get hints purchased today
  const { data: hintsPurchased, refetch: refetchHintsPurchased } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'getHintsPurchased',
    args: address ? [address as Address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 30000,
    },
  })

  // Get reward amount for user
  const { data: rewardAmount, refetch: refetchRewardAmount } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'getRewardAmount',
    args: address ? [address as Address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 30000,
    },
  })

  // Format reward amount from wei to cUSD
  const formattedRewardAmount = rewardAmount
    ? parseFloat(formatUnits(rewardAmount as bigint, 18)).toFixed(2)
    : '0.00'

  // Refetch all stats
  const refetchAll = () => {
    refetchStreak()
    refetchHasClaimed()
    refetchHintsPurchased()
    refetchRewardAmount()
  }

  return {
    streak: streak ? Number(streak) : 0,
    hasClaimed: hasClaimed as boolean ?? false,
    hintsPurchased: hintsPurchased ? Number(hintsPurchased) : 0,
    rewardAmount: formattedRewardAmount,
    rawRewardAmount: rewardAmount as bigint | undefined,
    isLoading: !address || !isConnected,
    refetch: refetchAll,
  }
}

