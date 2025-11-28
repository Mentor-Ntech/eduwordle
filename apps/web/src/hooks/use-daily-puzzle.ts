'use client'

import { useEffect, useMemo, useState } from 'react'
import { useReadContract, useChainId } from 'wagmi'
import { getContractAddresses, getActiveChainId, isSupportedChainId } from '@/lib/contracts/config'
import EduWordleABI from '@/lib/contracts/EduWordle.json'
import { type Address } from 'viem'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'
const ONE_DAY_SECONDS = 86400

function getUtcDayTimestamp() {
  return Math.floor(Date.now() / (ONE_DAY_SECONDS * 1000)) * ONE_DAY_SECONDS
}
/**
 * Hook to fetch daily puzzle information from the contract
 * Returns puzzle status, current day, and solution hash
 */
export function useDailyPuzzle() {
  const chainId = useChainId()
  const activeChainId = getActiveChainId(chainId)
  const contracts = getContractAddresses(activeChainId)
  const resolvedAddress = (contracts.eduWordle || ZERO_ADDRESS) as Address
  const contractAddress = resolvedAddress === ZERO_ADDRESS ? undefined : resolvedAddress
  const targetAddress = (contractAddress ?? ZERO_ADDRESS) as Address
  const isSupportedChain = isSupportedChainId(chainId) && !!contractAddress
  const [todayTimestamp, setTodayTimestamp] = useState(() => getUtcDayTimestamp())

  // Keep today's timestamp in sync so we can detect stale puzzles without reloads
  useEffect(() => {
    const interval = setInterval(() => {
      setTodayTimestamp((prev) => {
        const next = getUtcDayTimestamp()
        return prev === next ? prev : next
      })
    }, 60_000) // check every minute

    return () => clearInterval(interval)
  }, [])

  // Get current day from contract
  const {
    data: currentDay,
    isLoading: isLoadingCurrentDay,
    refetch: refetchCurrentDay,
  } = useReadContract({
    address: targetAddress,
    abi: EduWordleABI,
    functionName: 'currentDay',
    chainId: activeChainId,
    query: {
      enabled: isSupportedChain,
      refetchInterval: 60000, // Refetch every minute
      refetchOnWindowFocus: false, // Don't refetch on focus to maintain connection
    },
  })

  // Get current solution hash
  const {
    data: currentSolutionHash,
    isLoading: isLoadingSolution,
    refetch: refetchSolution,
  } = useReadContract({
    address: targetAddress,
    abi: EduWordleABI,
    functionName: 'currentSolutionHash',
    chainId: activeChainId,
    query: {
      enabled: isSupportedChain,
      refetchInterval: 60000,
      refetchOnWindowFocus: false,
    },
  })

  // Get total solvers today
  const {
    data: totalSolversToday,
    isLoading: isLoadingSolvers,
    refetch: refetchSolvers,
  } = useReadContract({
    address: targetAddress,
    abi: EduWordleABI,
    functionName: 'getTotalSolversToday',
    chainId: activeChainId,
    query: {
      enabled: isSupportedChain,
      refetchInterval: 30000,
      refetchOnWindowFocus: false,
    },
  })

  // Calculate if puzzle is initialized
  const lastInitializedDay = currentDay ? Number(currentDay) : 0
  const hasSolution = Boolean(
    currentSolutionHash && currentSolutionHash !== ZERO_HASH
  )
  const isForToday =
    typeof currentDay === 'bigint' && currentDay === BigInt(todayTimestamp)
  const isInitialized = Boolean(hasSolution && isForToday)
  const isStalePuzzle = Boolean(hasSolution && !isForToday && lastInitializedDay > 0)
  const lastInitializedDate = useMemo(() => {
    if (!lastInitializedDay) return null
    return new Date(lastInitializedDay * 1000)
  }, [lastInitializedDay])

  return {
    currentDay: lastInitializedDay,
    currentSolutionHash: currentSolutionHash as string | undefined,
    totalSolversToday: totalSolversToday ? Number(totalSolversToday) : 0,
    isInitialized: isInitialized ?? false,
    isStalePuzzle,
    lastInitializedDay,
    lastInitializedDate,
    todayTimestamp,
    nextResetTimestamp: todayTimestamp + ONE_DAY_SECONDS,
    isLoading: isSupportedChain && (isLoadingCurrentDay || isLoadingSolution || isLoadingSolvers),
    isSupportedChain,
    activeChainId,
    contractAddress,
    refetch: () => {
      refetchCurrentDay?.()
      refetchSolution?.()
      refetchSolvers?.()
    },
  }
}

