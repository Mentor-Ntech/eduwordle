'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useChainId } from 'wagmi'
import { getContractAddresses, getCusdAddress } from '@/lib/contracts/config'
import IERC20ABI from '@/lib/contracts/IERC20.json'
import { type Address, type Hash } from 'viem'
import { parseUnits } from 'viem'

/**
 * Hook to handle cUSD token approval for hint purchases
 * Checks current allowance and handles approval transactions
 */
export function useTokenApproval() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContract, data: txHash, isPending: isWriting, error: writeError } = useWriteContract()
  const [isApproving, setIsApproving] = useState(false)

  const contracts = getContractAddresses(chainId)
  const cusdAddress = getCusdAddress(chainId)
  const eduWordleAddress = (contracts.eduWordle || '0x0000000000000000000000000000000000000000') as Address

  // Check current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: cusdAddress,
    abi: IERC20ABI,
    functionName: 'allowance',
    args: address && eduWordleAddress ? [address as Address, eduWordleAddress] : undefined,
    query: {
      enabled: !!address && isConnected && !!eduWordleAddress,
      refetchInterval: 10000,
    },
  })

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash || undefined,
  })

  const approve = async (amount: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }

    setIsApproving(true)

    try {
      // Parse amount (assuming 18 decimals for cUSD)
      const amountInWei = parseUnits(amount, 18)

      // Submit approval transaction
      writeContract({
        address: cusdAddress,
        abi: IERC20ABI,
        functionName: 'approve',
        args: [eduWordleAddress, amountInWei],
      })
    } catch (err) {
      const error = err as Error
      setIsApproving(false)
      throw error
    }
  }

  // Check if approval is needed for a specific amount
  const needsApproval = (amount: string): boolean => {
    if (!allowance) return true
    
    const amountInWei = parseUnits(amount, 18)
    return (allowance as bigint) < amountInWei
  }

  // Reset state after successful confirmation
  useEffect(() => {
    if (isConfirmed && isApproving) {
      setIsApproving(false)
      refetchAllowance()
    }
  }, [isConfirmed, isApproving, refetchAllowance])

  // Handle write error
  useEffect(() => {
    if (writeError) {
      setIsApproving(false)
    }
  }, [writeError])

  return {
    approve,
    allowance: allowance as bigint | undefined,
    needsApproval,
    isApproving: isApproving || isWriting || isConfirming,
    isConfirmed,
    error: writeError,
    txHash: txHash || null,
    refetch: refetchAllowance,
    reset: () => {
      setIsApproving(false)
    },
  }
}

