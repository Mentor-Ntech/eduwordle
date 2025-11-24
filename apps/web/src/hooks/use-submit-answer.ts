'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useChainId } from 'wagmi'
import { getContractAddresses } from '@/lib/contracts/config'
import EduWordleABI from '@/lib/contracts/EduWordle.json'
import { type Address, type Hash } from 'viem'

/**
 * Hook to submit answer to the EduWordle contract
 * Handles transaction submission, loading states, and success/error callbacks
 */
export function useSubmitAnswer() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const contracts = getContractAddresses(chainId)
  const contractAddress = (contracts.eduWordle || '0x0000000000000000000000000000000000000000') as Address
  
  const { writeContract, data: txHash, isPending: isWriting, error: writeError } = useWriteContract()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({
    hash: txHash || undefined,
  })

  const submitAnswer = async (guess: string) => {
    console.log('🚀 submitAnswer called with:', { guess, isConnected, address, contractAddress })
    
    if (!isConnected || !address) {
      const error = new Error('Wallet not connected')
      console.error('❌', error.message)
      throw error
    }

    if (!guess || guess.length !== 5) {
      const error = new Error('Guess must be 5 letters')
      console.error('❌', error.message)
      throw error
    }

    if (contractAddress === '0x0000000000000000000000000000000000000000') {
      const error = new Error('Contract address not configured')
      console.error('❌', error.message)
      throw error
    }

    setIsSubmitting(true)

    try {
      // Convert guess to uppercase (contract expects uppercase)
      const uppercaseGuess = guess.toUpperCase()
      console.log('📤 Calling writeContract with:', { address: contractAddress, functionName: 'submitAnswer', args: [uppercaseGuess] })

      // Submit transaction - writeContract doesn't return a promise
      // It triggers the wallet prompt and errors come through writeError state
      writeContract({
        address: contractAddress,
        abi: EduWordleABI,
        functionName: 'submitAnswer',
        args: [uppercaseGuess],
      })
      
      console.log('✅ writeContract called - wallet prompt should appear')
      
      // Note: writeContract is fire-and-forget
      // Success/error will be handled via writeError and txHash state
    } catch (err) {
      const error = err as Error
      console.error('❌ Error in submitAnswer:', error)
      setIsSubmitting(false)
      throw error
    }
  }

  // Reset state after successful confirmation
  useEffect(() => {
    if (isConfirmed) {
      setIsSubmitting(false)
    }
  }, [isConfirmed])

  // Handle write error (user rejection, network error, etc.)
  useEffect(() => {
    if (writeError) {
      setIsSubmitting(false)
      console.error('❌ Transaction write error:', writeError)
      console.error('Error details:', {
        name: writeError.name,
        message: writeError.message,
        cause: writeError.cause,
        shortMessage: (writeError as any).shortMessage,
      })
    }
  }, [writeError])

  // Log when transaction hash appears (transaction was submitted)
  useEffect(() => {
    if (txHash) {
      console.log('✅ Transaction hash received:', txHash)
      console.log('   Transaction submitted successfully! Waiting for confirmation...')
    }
  }, [txHash])

  // Log when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      console.log('🎉 Transaction confirmed!')
    }
  }, [isConfirmed])

  // Handle receipt errors (transaction reverted)
  useEffect(() => {
    if (receiptError) {
      console.error('❌ Transaction receipt error (transaction likely reverted):', receiptError)
      setIsSubmitting(false)
    }
  }, [receiptError])

  return {
    submitAnswer,
    isSubmitting: isSubmitting || isWriting || isConfirming,
    isConfirmed,
    error: writeError || receiptError,
    txHash: txHash || null,
    reset: () => {
      setIsSubmitting(false)
    },
  }
}

