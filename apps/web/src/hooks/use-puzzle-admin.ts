"use client"

import { useMemo, useState } from 'react'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { keccak256, encodePacked } from 'viem'
import EduWordleABI from '@/lib/contracts/EduWordle.json'

export function usePuzzleAdmin(contractAddress?: `0x${string}`) {
  const { address } = useAccount()

  const {
    data: ownerData,
    isLoading: isLoadingOwner,
    refetch: refetchOwner,
  } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'owner',
    query: {
      enabled: !!contractAddress,
    },
  })

  const ownerAddress = ownerData as `0x${string}` | undefined

  const isOwner = useMemo(() => {
    if (!ownerAddress || !address) return false
    return ownerAddress.toLowerCase() === address.toLowerCase()
  }, [ownerAddress, address])

  const { writeContractAsync, error: writeError, isPending: isSubmitting } = useWriteContract()
  const [pendingHash, setPendingHash] = useState<`0x${string}` | undefined>(undefined)

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: pendingHash,
  })

  const initializePuzzle = async (word: string) => {
    if (!contractAddress) {
      throw new Error('Contract address not available')
    }

    const trimmedWord = word.trim()
    if (!trimmedWord || trimmedWord.length !== 5) {
      throw new Error('Word must be exactly 5 letters')
    }

    const uppercaseWord = trimmedWord.toUpperCase()
    const hash = keccak256(encodePacked(['string'], [uppercaseWord]))

    const txHash = await writeContractAsync({
      address: contractAddress,
      abi: EduWordleABI,
      functionName: 'initializeDay',
      args: [hash],
    })

    setPendingHash(txHash)
  }

  return {
    isOwner,
    ownerAddress,
    isLoadingOwner,
    refetchOwner,
    initializePuzzle,
    isInitializing: isSubmitting || isConfirming,
    txHash: pendingHash,
    initError: writeError || receiptError,
    initSuccess: isSuccess,
  }
}

