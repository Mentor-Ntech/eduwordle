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
      console.log('🟩 Calling token transfer', { tokenAddress, to, amountInWei: amountInWei.toString() })
      const amountInWei = parseUnits(amount, 18)
      writeContract({
        address: tokenAddress,
        abi: IERC20ABI,
        functionName: 'transfer',
        args: [to, amountInWei],
      })
    } catch (error) {
      console.error('🟥 withdraw error', error)
      setIsWithdrawing(false)
      throw error
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      setIsWithdrawing(false)
    }
  }, [isConfirmed])

  useEffect(() => {
    if (writeError) {
      setIsWithdrawing(false)
    }
  }, [writeError])

  return {
    withdraw,
    isWithdrawing: isWithdrawing || isWriting || isConfirming,
    isConfirmed,
    error: writeError,
    txHash: txHash || null,
    reset: () => setIsWithdrawing(false),
  }
}


