'use client'

import { X } from 'lucide-react'
import { useAccount, useBalance } from 'wagmi'
import { useChainId } from 'wagmi'
import { getCusdAddress, getContractAddresses } from '@/lib/contracts/config'
import { formatUnits } from 'viem'
import { useBuyHint } from '@/hooks/use-buy-hint'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

interface HintPurchaseModalProps {
  onClose: () => void
}

export function HintPurchaseModal({ onClose }: HintPurchaseModalProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const cusdAddress = getCusdAddress(chainId)
  
  const { 
    buyHint, 
    approveHint, 
    isPurchasing, 
    isConfirmed, 
    isApprovalNeeded, 
    isApprovalConfirmed,
    hintPrice, 
    hintsPurchased, 
    maxHintsPerDay,
    canBuyHint,
    error,
    txHash,
    refetch,
  } = useBuyHint()
  
  const { data: balance } = useBalance({
    address: address,
    token: cusdAddress,
  })
  
  const [needsApproval, setNeedsApproval] = useState(false)

  // Check approval status
  useEffect(() => {
    if (isApprovalNeeded && !isApprovalConfirmed) {
      setNeedsApproval(true)
    } else {
      setNeedsApproval(false)
    }
  }, [isApprovalNeeded, isApprovalConfirmed])

  // Handle successful purchase
  useEffect(() => {
    if (isConfirmed && txHash) {
      toast.success('Hint purchased successfully!')
      refetch()
      // Note: The contract records the hint purchase, but doesn't reveal the hint
      // You would need additional logic to reveal hints based on the solution hash
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }, [isConfirmed, txHash, refetch, onClose])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to purchase hint')
    }
  }, [error])

  const handlePurchaseHint = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet')
      return
    }

    if (!canBuyHint) {
      toast.error(`Maximum hints (${maxHintsPerDay}) reached for today`)
      return
    }

    try {
      if (needsApproval) {
        await approveHint?.()
      } else {
        await buyHint()
      }
    } catch (err) {
      console.error('Failed to purchase hint:', err)
    }
  }

  const formattedBalance = balance ? parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(2) : '0.00'
  const remainingHints = maxHintsPerDay - hintsPurchased

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background rounded-t-2xl md:rounded-2xl w-full md:max-w-md card-elevation slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-surface">
          <h2 className="text-xl font-bold">Purchase Hints</h2>
          <button 
            onClick={onClose}
            className="h-11 w-11 p-2 hover:bg-surface rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-3">
          <div className="p-4 bg-surface rounded-lg border-2 border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">💡 Purchase Hint</p>
              <span className="font-bold text-lg text-secondary">{hintPrice} cUSD</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {hintsPurchased > 0 
                ? `${hintsPurchased} of ${maxHintsPerDay} hints purchased today`
                : `Remaining: ${remainingHints} of ${maxHintsPerDay} hints`}
            </p>
          </div>
          
          {!canBuyHint && (
            <div className="p-3 bg-yellow/10 border border-yellow/20 rounded-lg">
              <p className="text-sm text-yellow-600">
                ⚠️ Maximum hints reached for today. Come back tomorrow!
              </p>
            </div>
          )}
        </div>
        
        <div className="border-t border-surface p-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Balance:</span>
            <strong>{formattedBalance} cUSD</strong>
          </div>
          
          {isPurchasing ? (
            <button 
              disabled
              className="w-full h-11 px-4 py-3 bg-primary/50 text-white font-semibold rounded-lg flex items-center justify-center"
            >
              <span className="mr-2">⏳</span>
              {needsApproval ? 'Approving...' : 'Purchasing...'}
            </button>
          ) : needsApproval ? (
            <button 
              onClick={handlePurchaseHint}
              className="w-full h-11 px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark"
            >
              Approve {hintPrice} cUSD
            </button>
          ) : (
            <>
              <button 
                onClick={handlePurchaseHint}
                disabled={!canBuyHint || !isConnected}
                className="w-full h-11 px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Purchase Hint ({hintPrice} cUSD)
              </button>
              <button 
                onClick={onClose}
                className="w-full h-11 px-4 py-3 bg-surface text-foreground font-semibold rounded-lg hover:bg-surface/80"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
