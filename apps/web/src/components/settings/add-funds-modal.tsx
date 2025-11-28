'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAccount, useBalance, useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { toast } from 'sonner'
import { getCusdAddress } from '@/lib/contracts/config'
import { parseUnits } from 'viem'
import IERC20ABI from '@/lib/contracts/IERC20.json'

interface AddFundsModalProps {
  onClose: () => void
}

// MockERC20 ABI with mint function
const MOCK_ERC20_ABI = [
  ...IERC20ABI,
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export function AddFundsModal({ onClose }: AddFundsModalProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const [amount, setAmount] = useState('100') // Default to 100 cUSD
  const tokenAddress = chainId ? getCusdAddress(chainId) : undefined

  const { data: balanceData, isLoading: isLoadingBalance, refetch: refetchBalance } = useBalance({
    address,
    token: tokenAddress,
    query: {
      enabled: !!address && !!chainId,
      refetchInterval: 3000,
      staleTime: 0,
    },
  })

  const { writeContract, data: txHash, isPending: isWriting, error: writeError } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash || undefined,
  })

  const isMinting = isWriting || isConfirming

  const currentBalance = useMemo(() => {
    if (!balanceData) return '0'
    return parseFloat(balanceData.formatted).toFixed(2)
  }, [balanceData])

  const handleAddFunds = async () => {
    try {
      if (!address) {
        toast.error('Please connect your wallet')
        return
      }

      if (!tokenAddress) {
        toast.error('Unsupported network')
        return
      }

      if (!amount || Number(amount) <= 0) {
        toast.error('Please enter an amount greater than 0')
        return
      }

      // Validate amount precision (max 2 decimal places)
      if (amount.split('.')[1]?.length > 2) {
        toast.error('Amount can have maximum 2 decimal places')
        return
      }

      const amountInWei = parseUnits(amount, 18)
      console.log('🟩 Minting tokens', { tokenAddress, to: address, amount, amountInWei: amountInWei.toString() })

      writeContract({
        address: tokenAddress,
        abi: MOCK_ERC20_ABI,
        functionName: 'mint',
        args: [address, amountInWei],
      })

      toast.info('Submitting mint transaction...')
    } catch (err: any) {
      console.error('🟥 Mint error', err)
      toast.error(err.message || 'Failed to add funds')
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      console.log('✅ Mint confirmed! Refetching balance...')
      toast.success(`Successfully added ${amount} cUSD to your wallet!`)
      
      // Force refetch balance immediately after confirmation
      setTimeout(() => {
        refetchBalance()
      }, 1000)
      
      setTimeout(() => {
        refetchBalance()
      }, 3000)
      
      // Close modal after showing success
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }, [isConfirmed, amount, refetchBalance, onClose])

  useEffect(() => {
    if (writeError) {
      console.error('🟥 Mint error:', writeError)
      let errorMessage = writeError.message || 'Failed to add funds'
      
      if (errorMessage.includes('User rejected') || errorMessage.includes('User denied')) {
        errorMessage = 'Transaction was cancelled. Please try again.'
      } else if (errorMessage.includes('execution reverted')) {
        errorMessage = 'Transaction failed. The mint function may not be available on this contract.'
      }
      
      toast.error(errorMessage)
    }
  }, [writeError])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-background rounded-2xl w-full max-w-md card-elevation-hover p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground">Add Funds</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Mint testnet cUSD tokens to your wallet. This creates new tokens on the blockchain (testnet only).
        </p>
        
        <div className="bg-info/10 border border-info/20 rounded-lg p-3 mb-4">
          <p className="text-xs text-info font-semibold mb-1">How It Works:</p>
          <ul className="text-xs text-info/90 space-y-1 list-disc list-inside">
            <li>Tokens are <strong>created (minted)</strong> on the blockchain</li>
            <li>They don't come from anywhere - they're generated by the contract</li>
            <li>This is a <strong>testnet feature only</strong> - MockERC20 token</li>
            <li>Total supply increases when you mint tokens</li>
            <li>Anyone can mint tokens on this testnet contract</li>
          </ul>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
              Amount (cUSD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full h-11 px-3 rounded-lg border border-primary/20 bg-surface text-sm focus:border-primary outline-none"
              value={amount}
              onChange={(e) => {
                const val = e.target.value
                if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
                  setAmount(val)
                }
              }}
              placeholder="Enter amount"
              disabled={isMinting || isLoadingBalance}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Current Balance: {isLoadingBalance ? (
                  <span className="text-foreground font-semibold animate-pulse">Loading...</span>
                ) : (
                  <span className="text-foreground font-semibold">{currentBalance} cUSD</span>
                )}
              </p>
              {!isLoadingBalance && balanceData && (
                <button
                  type="button"
                  onClick={() => refetchBalance()}
                  className="text-xs text-primary hover:text-primary/80 underline"
                  title="Refresh balance from blockchain"
                >
                  Refresh
                </button>
              )}
            </div>
            {balanceData && (
              <p className="text-xs text-muted-foreground/70 mt-1 italic">
                Balance fetched from blockchain • Token: {balanceData.symbol || 'cUSD'}
              </p>
            )}
          </div>
        </div>

        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
          <p className="text-xs text-warning">
            ⚠️ This feature is only available on testnet. The mint function may not be available on all contracts.
          </p>
        </div>

        <button
          onClick={handleAddFunds}
          disabled={
            isMinting || 
            isLoadingBalance || 
            !address || 
            !chainId || 
            !amount || 
            Number(amount) <= 0
          }
          className="w-full h-11 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isMinting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {txHash ? 'Confirming...' : 'Submitting...'}
            </span>
          ) : isLoadingBalance ? (
            'Loading balance...'
          ) : !amount || Number(amount) <= 0 ? (
            'Enter amount'
          ) : (
            `Add ${amount} cUSD`
          )}
        </button>

        {txHash && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              Transaction submitted! Waiting for confirmation...
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Tx Hash: <span className="font-mono">{txHash.slice(0, 10)}...</span>
            </p>
            {isMinting && (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-xs text-muted-foreground">Confirming...</span>
              </div>
            )}
          </div>
        )}
        
        {writeError && (
          <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-xs text-error text-center">
              {writeError.message || 'Transaction failed'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

