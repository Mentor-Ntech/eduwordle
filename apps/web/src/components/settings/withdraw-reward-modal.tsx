'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { useWithdrawReward } from '@/hooks/use-withdraw-reward'
import { toast } from 'sonner'
import { getCusdAddress } from '@/lib/contracts/config'
import { isValidAddress } from '@/lib/app-utils'
import { isAddress } from 'viem'

interface WithdrawRewardModalProps {
  onClose: () => void
}

export function WithdrawRewardModal({ onClose }: WithdrawRewardModalProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const [recipient, setRecipient] = useState(address || '')
  const [amount, setAmount] = useState('')

  const { data: balanceData, isLoading: isLoadingBalance, refetch: refetchBalance } = useBalance({
    address,
    token: chainId ? getCusdAddress(chainId) : undefined,
    query: {
      enabled: !!address && !!chainId,
      refetchInterval: 3000, // Refetch every 3 seconds during withdrawal for faster updates
      staleTime: 0, // Always consider data stale to force fresh fetches
    },
  })

  const availableBalance = useMemo(() => {
    if (!balanceData) {
      console.log('💰 Balance data not available yet')
      return '0'
    }
    const balance = parseFloat(balanceData.formatted).toFixed(2)
    console.log('💰 Current balance from blockchain:', balance, 'cUSD', {
      raw: balanceData.value.toString(),
      decimals: balanceData.decimals,
      formatted: balanceData.formatted,
      symbol: balanceData.symbol,
    })
    return balance
  }, [balanceData])

  const { withdraw, isWithdrawing, isConfirmed, error, txHash, reset } = useWithdrawReward()

  const handleWithdraw = async () => {
    try {
      if (!recipient) {
        toast.error('Please provide a destination address')
        return
      }

      // Validate address format
      if (!isAddress(recipient)) {
        toast.error('Invalid wallet address format')
        return
      }

      if (!amount || Number(amount) <= 0) {
        toast.error('Please enter an amount greater than 0')
        return
      }

      // Check if amount exceeds balance
      const amountNum = Number(amount)
      const balanceNum = Number(availableBalance)
      if (amountNum > balanceNum) {
        toast.error(`Insufficient balance. Available: ${availableBalance} cUSD`)
        return
      }

      // Validate amount precision (max 2 decimal places)
      if (amount.split('.')[1]?.length > 2) {
        toast.error('Amount can have maximum 2 decimal places')
        return
      }

      // Call withdraw - this will trigger the wallet prompt
      await withdraw(recipient as `0x${string}`, amount)
      
      // Note: toast.info is shown after withdraw is called
      // The actual transaction submission happens via writeContract
      // User will see wallet prompt to confirm
    } catch (err: any) {
      toast.error(err.message || 'Failed to withdraw rewards')
    }
  }

  useEffect(() => {
    if (isConfirmed && txHash) {
      console.log('✅ Withdrawal confirmed! Refetching balance...', { txHash, recipient, amount })
      toast.success(`Successfully sent ${amount} cUSD to ${recipient.slice(0, 6)}...${recipient.slice(-4)}!`)
      
      // Force refetch balance multiple times to ensure we get the updated balance
      const refetchTimers = [
        setTimeout(() => {
          console.log('🔄 Refetching balance (1s after confirmation)...')
          refetchBalance()
        }, 1000),
        setTimeout(() => {
          console.log('🔄 Refetching balance (3s after confirmation)...')
          refetchBalance()
        }, 3000),
        setTimeout(() => {
          console.log('🔄 Refetching balance (5s after confirmation)...')
          refetchBalance()
        }, 5000),
      ]
      
      reset()
      
      // Don't close immediately - let user see the updated balance
      setTimeout(() => {
        onClose()
        // Refetch one more time after modal closes
        setTimeout(() => {
          refetchBalance()
        }, 1000)
      }, 3000)
      
      return () => {
        refetchTimers.forEach(timer => clearTimeout(timer))
      }
    }
  }, [isConfirmed, txHash, reset, onClose, refetchBalance, recipient, amount])

  useEffect(() => {
    if (error) {
      console.error('🟥 Withdrawal error:', error)
      let errorMessage = error.message || 'Withdrawal failed'
      
      // Provide user-friendly error messages
      if (errorMessage.includes('User rejected') || errorMessage.includes('User denied')) {
        errorMessage = 'Transaction was cancelled. Please try again.'
      } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
        errorMessage = 'Insufficient balance for this transaction'
      } else if (errorMessage.includes('execution reverted')) {
        errorMessage = 'Transaction failed. Please check your balance and try again.'
      }
      
      toast.error(errorMessage)
      reset()
    }
  }, [error, reset])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-background rounded-2xl w-full max-w-md card-elevation-hover p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground">Withdraw Rewards</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Send your cUSD tokens to any EVM-compatible wallet address. The tokens will be transferred from your wallet to the destination address.
        </p>
        
        {recipient && isAddress(recipient) && (
          <div className="bg-info/10 border border-info/20 rounded-lg p-3 mb-4">
            <p className="text-xs text-info font-semibold mb-1">Destination:</p>
            <p className="text-xs font-mono break-all">{recipient}</p>
            <p className="text-xs text-info/80 mt-1">
              Tokens will be sent to this address after transaction confirmation.
            </p>
          </div>
        )}

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
              Destination Address
            </label>
            <input
              type="text"
              className="w-full h-11 px-3 rounded-lg border border-primary/20 bg-surface text-sm focus:border-primary outline-none font-mono"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value.trim())}
              placeholder="0x..."
              disabled={isWithdrawing}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase block">
                Amount (cUSD)
              </label>
              <button
                type="button"
                onClick={() => setAmount(availableBalance)}
                disabled={isWithdrawing || isLoadingBalance || !availableBalance || availableBalance === '0'}
                className="text-xs text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Use Max
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              max={availableBalance}
              className="w-full h-11 px-3 rounded-lg border border-primary/20 bg-surface text-sm focus:border-primary outline-none"
              value={amount}
              onChange={(e) => {
                const val = e.target.value
                if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
                  setAmount(val)
                }
              }}
              placeholder="Enter amount"
              disabled={isWithdrawing || isLoadingBalance}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Available: {isLoadingBalance ? (
                  <span className="text-foreground font-semibold animate-pulse">Loading...</span>
                ) : (
                  <span className="text-foreground font-semibold">{availableBalance} cUSD</span>
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

        <button
          onClick={handleWithdraw}
          disabled={
            isWithdrawing || 
            isLoadingBalance || 
            !address || 
            !chainId || 
            !recipient || 
            !amount || 
            Number(amount) <= 0 ||
            Number(amount) > Number(availableBalance)
          }
          className="w-full h-11 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isWithdrawing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {txHash ? 'Confirming...' : 'Submitting...'}
            </span>
          ) : isLoadingBalance ? (
            'Loading balance...'
          ) : !recipient || !amount || Number(amount) <= 0 ? (
            'Enter amount and address'
          ) : Number(amount) > Number(availableBalance) ? (
            'Insufficient balance'
          ) : (
            'Withdraw'
          )}
        </button>

        {txHash && (
          <div className="mt-3 space-y-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-xs text-muted-foreground text-center font-semibold">
              Transaction Submitted!
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Sending <span className="font-bold text-foreground">{amount} cUSD</span> to:
            </p>
            <p className="text-xs font-mono text-center break-all">
              {recipient}
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Tx Hash: <span className="font-mono">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
            </p>
            {isWithdrawing && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-xs text-muted-foreground">Waiting for confirmation...</span>
              </div>
            )}
            {isConfirmed && (
              <div className="mt-2 p-2 bg-success/10 border border-success/20 rounded">
                <p className="text-xs text-success text-center font-semibold">
                  ✅ Transaction Confirmed! Balance updating...
                </p>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-xs text-error text-center">
              {error.message || 'Transaction failed'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


