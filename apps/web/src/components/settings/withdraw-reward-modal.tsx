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

  const { data: balanceData } = useBalance({
    address,
    token: chainId ? getCusdAddress(chainId) : undefined,
    watch: true,
  })

  const availableBalance = useMemo(() => {
    if (!balanceData) return '0'
    return parseFloat(balanceData.formatted).toFixed(2)
  }, [balanceData])

  const { withdraw, isWithdrawing, isConfirmed, error, txHash, reset } = useWithdrawReward()

  const handleWithdraw = async () => {
    try {
      if (!recipient) {
        toast.error('Please provide a destination address')
        return
      }

      if (!amount || Number(amount) <= 0) {
        toast.error('Please enter an amount greater than 0')
        return
      }

      await withdraw(recipient as `0x${string}`, amount)
      toast.info('Submitting withdrawal transaction...')
    } catch (err: any) {
      toast.error(err.message || 'Failed to withdraw rewards')
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      toast.success('Rewards withdrawn successfully!')
      reset()
      onClose()
    }
  }, [isConfirmed, reset, onClose])

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Withdrawal failed')
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
          Send your cUSD rewards to any EVM-compatible wallet address.
        </p>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
              Destination Address
            </label>
            <input
              type="text"
              className="w-full h-11 px-3 rounded-lg border border-primary/20 bg-surface text-sm focus:border-primary outline-none"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
            />
          </div>

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
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available: <span className="text-foreground font-semibold">{availableBalance} cUSD</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={isWithdrawing}
          className="w-full h-11 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 disabled:opacity-50"
        >
          {isWithdrawing ? 'Submitting...' : 'Withdraw'}
        </button>

        {txHash && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Tx Hash: <span className="font-mono">{txHash.slice(0, 10)}...</span>
          </p>
        )}
      </div>
    </div>
  )
}


