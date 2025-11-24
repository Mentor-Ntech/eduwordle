'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useChainId } from 'wagmi'
import { getContractAddresses } from '@/lib/contracts/config'
import EduWordleABI from '@/lib/contracts/EduWordle.json'
import { type Address, type Hash } from 'viem'
import { formatUnits } from 'viem'
import { useTokenApproval } from './use-token-approval'

/**
 * Hook to purchase hints from the EduWordle contract
 * Handles approval flow and hint purchase transaction
 */
export function useBuyHint() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const contracts = getContractAddresses(chainId)
  const contractAddress = (contracts.eduWordle || '0x0000000000000000000000000000000000000000') as Address
  
  const { writeContract, data: txHash, isPending: isWriting, error: writeError } = useWriteContract()
  const [isPurchasing, setIsPurchasing] = useState(false)

  // Get hint price
  const { data: hintPrice, refetch: refetchHintPrice } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'hintPrice',
    query: {
      refetchInterval: 60000,
    },
  })

  // Get max hints per day
  const { data: maxHintsPerDay } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'maxHintsPerDay',
  })

  // Get hints purchased today
  const { data: hintsPurchased, refetch: refetchHintsPurchased } = useReadContract({
    address: contractAddress,
    abi: EduWordleABI,
    functionName: 'getHintsPurchased',
    args: address ? [address as Address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Token approval hook
  const { approve, needsApproval, isApproving, isConfirmed: isApprovalConfirmed, refetch: refetchApproval } = useTokenApproval()

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash || undefined,
  })

  // Format hint price
  const formattedHintPrice = hintPrice ? formatUnits(hintPrice as bigint, 18) : '0.1'

  // Check if user can buy more hints
  const canBuyHint = hintsPurchased !== undefined && maxHintsPerDay !== undefined
    ? Number(hintsPurchased) < Number(maxHintsPerDay)
    : true

  const buyHint = async () => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }

    if (!canBuyHint) {
      throw new Error('Maximum hints reached for today')
    }

    if (!hintPrice) {
      throw new Error('Hint price not available')
    }

    setIsPurchasing(true)

    try {
      // Check if approval is needed
      const hintPriceStr = formatUnits(hintPrice as bigint, 18)
      if (needsApproval(hintPriceStr)) {
        // First approve, then purchase
        await approve(hintPriceStr)
        // Wait for approval confirmation before proceeding
        // Note: In production, you might want to add a more sophisticated flow
        // For now, user will need to approve first, then buy hint
        throw new Error('Approval needed. Please approve cUSD spending first.')
      }

      // Purchase hint
      writeContract({
        address: contractAddress,
        abi: EduWordleABI,
        functionName: 'buyHint',
        args: [],
      })
    } catch (err) {
      const error = err as Error
      setIsPurchasing(false)
      throw error
    }
  }

  // Reset state after successful confirmation
  useEffect(() => {
    if (isConfirmed && isPurchasing) {
      setIsPurchasing(false)
      refetchHintsPurchased()
    }
  }, [isConfirmed, isPurchasing, refetchHintsPurchased])

  // Handle write error
  useEffect(() => {
    if (writeError) {
      setIsPurchasing(false)
    }
  }, [writeError])

  return {
    buyHint,
    approveHint: () => {
      if (hintPrice) {
        const hintPriceStr = formatUnits(hintPrice as bigint, 18)
        return approve(hintPriceStr)
      }
    },
    isPurchasing: isPurchasing || isWriting || isConfirming || isApproving,
    isConfirmed,
    isApprovalNeeded: hintPrice ? needsApproval(formatUnits(hintPrice as bigint, 18)) : false,
    isApprovalConfirmed,
    hintPrice: formattedHintPrice,
    hintsPurchased: hintsPurchased ? Number(hintsPurchased) : 0,
    maxHintsPerDay: maxHintsPerDay ? Number(maxHintsPerDay) : 3,
    canBuyHint,
    error: writeError,
    txHash: txHash || null,
    refetch: () => {
      refetchHintPrice()
      refetchHintsPurchased()
      refetchApproval()
    },
    reset: () => {
      setIsPurchasing(false)
    },
  }
}

