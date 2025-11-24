'use client'

import { useReadContract } from 'wagmi'
import { useChainId } from 'wagmi'
import { getContractAddresses } from '@/lib/contracts/config'
import EduWordleABI from '@/lib/contracts/EduWordle.json'
import { type Address } from 'viem'

/**
 * Hook to fetch daily puzzle information from the contract
 * Returns puzzle status, current day, and solution hash
 */
export function useDailyPuzzle() {
  const chainId = useChainId()
  const contracts = getContractAddresses(chainId)
  const contractAddress = (contracts.eduWordle || '0x0000000000000000000000000000000000000000') as Address

  // Get current day from contract
  const { data: currentDay } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'currentDay',
    query: {
      refetchInterval: 60000, // Refetch every minute
    },
  })

  // Get current solution hash
  const { data: currentSolutionHash } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'currentSolutionHash',
    query: {
      refetchInterval: 60000,
    },
  })

  // Get total solvers today
  const { data: totalSolversToday } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'getTotalSolversToday',
    query: {
      refetchInterval: 30000,
    },
  })

  // Calculate if puzzle is initialized
  const isInitialized = currentDay && 
    typeof currentDay === 'bigint' && 
    currentDay > BigInt(0) && 
    currentSolutionHash && 
    currentSolutionHash !== '0x0000000000000000000000000000000000000000000000000000000000000000'

  return {
    currentDay: currentDay ? Number(currentDay) : 0,
    currentSolutionHash: currentSolutionHash as string | undefined,
    totalSolversToday: totalSolversToday ? Number(totalSolversToday) : 0,
    isInitialized: isInitialized ?? false,
  }
}

