'use client'

import { useState, useEffect } from 'react'
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getCusdAddress } from '@/lib/contracts/config'
import IERC20ABI from '@/lib/contracts/IERC20.json'
import { parseUnits } from 'viem'

/**
 * Hook to withdraw (transfer) cUSD from the connected wallet
 */
export function useWithdrawReward() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const tokenAddress = chainId ? getCusdAddress(chainId) : undefined

  const { writeContract, data: txHash, isPending: isWriting, error: writeError } = useWriteContract()
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash || undefined,
  })

  const withdraw = async (to: `0x${string}`, amount: string) => {
    console.log('🟦 withdraw called', { to, amount, isConnected, address, chainId, tokenAddress })

    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }

    if (!tokenAddress) {
      throw new Error('Unsupported network')
    }

    if (!to) {
      throw new Error('Destination address is required')
    }

    if (!amount || Number(amount) <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    setIsWithdrawing(true)

    try {
      const amountInWei = parseUnits(amount, 18)
      console.log('🟩 Calling token transfer', { tokenAddress, to, amount, amountInWei: amountInWei.toString() })
      
      // writeContract doesn't return a promise, it triggers the write
      // The status is tracked via isPending, txHash, and error
      writeContract({
        address: tokenAddress,
        abi: IERC20ABI,
        functionName: 'transfer',
        args: [to, amountInWei],
      })
      
      // Don't set isWithdrawing to false here - let the useEffect handle it
      // The transaction is now submitted, wait for confirmation
    } catch (error: any) {
      console.error('🟥 withdraw error', error)
      setIsWithdrawing(false)
      throw new Error(error?.message || 'Failed to initiate withdrawal transaction')
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      setIsWithdrawing(false)
    }
  }, [isConfirmed])

  useEffect(() => {
    if (writeError) {
      console.error('🟥 Write error:', writeError)
      setIsWithdrawing(false)
    }
  }, [writeError])

  // Log transaction hash when it appears
  useEffect(() => {
    if (txHash) {
      console.log('✅ Transaction hash received:', txHash)
      console.log('   Transaction submitted successfully! Waiting for confirmation...')
    }
  }, [txHash])

  // Log when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      console.log('🎉 Withdrawal transaction confirmed!')
    }
  }, [isConfirmed])

  return {
    withdraw,
    isWithdrawing: isWithdrawing || isWriting || isConfirming,
    isConfirmed,
    error: writeError,
    txHash: txHash || null,
    reset: () => setIsWithdrawing(false),
  }
}


