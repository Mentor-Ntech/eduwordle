'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useChainId } from 'wagmi'
import { getContractAddresses } from '@/lib/contracts/config'

interface RewardClaimModalProps {
  reward: number
  onClose: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
  txHash?: string
}

export function RewardClaimModal({ reward, onClose, isSubmitting = false, isConfirmed = false, txHash }: RewardClaimModalProps) {
  const chainId = useChainId()
  const contracts = getContractAddresses(chainId)
  
  // Close modal after successful confirmation
  useEffect(() => {
    if (isConfirmed) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isConfirmed, onClose])

  // Get explorer URL for transaction
  const getExplorerUrl = () => {
    const baseUrls: Record<number, string> = {
      42220: 'https://celoscan.io/tx/',
      44787: 'https://alfajores.celoscan.io/tx/',
      11142220: 'https://celo-sepolia.blockscout.com/tx/',
    }
    return baseUrls[chainId] || 'https://celo-sepolia.blockscout.com/tx/'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background rounded-2xl w-full max-w-md card-elevation-hover p-8 text-center fade-in-up" onClick={(e) => e.stopPropagation()}>
        {isConfirmed ? (
          <>
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h2 className="text-2xl font-bold mb-2">Reward Transferred!</h2>
            <p className="text-muted-foreground mb-4">
              <span className="font-semibold text-success">{reward.toFixed(2)} cUSD</span> has been automatically sent to your wallet.
            </p>
            <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-foreground">
                💰 <strong>Check your wallet</strong> - the cUSD tokens are now in your account!
              </p>
            </div>
            {txHash && (
              <Link
                href={`${getExplorerUrl()}${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm mb-4 block font-medium"
              >
                🔗 View Transaction on Explorer
              </Link>
            )}
            <button
              onClick={onClose}
              className="w-full h-11 px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark"
            >
              Close
            </button>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            
            <h2 className="text-2xl font-bold mb-2">You Won!</h2>
            <p className="text-muted-foreground mb-6">
              {isSubmitting 
                ? 'Submitting your answer to the blockchain...' 
                : 'Your reward will be automatically transferred to your wallet when you submit the correct answer.'}
            </p>
            
            <div className="bg-gradient-to-r from-secondary/20 to-primary/20 rounded-lg p-6 mb-6 border-2 border-secondary">
              <p className="text-sm text-muted-foreground mb-2">Total Reward</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-primary">{reward.toFixed(2)}</span>
                <span className="text-2xl font-semibold text-secondary">cUSD</span>
              </div>
            </div>
            
            {isSubmitting ? (
              <div className="space-y-2">
                <div className="w-full h-11 px-4 py-3 bg-primary/50 text-white font-semibold rounded-lg flex items-center justify-center">
                  <span className="mr-2">⏳</span>
                  Submitting Transaction...
                </div>
                <p className="text-xs text-muted-foreground">
                  Please confirm the transaction in your wallet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-foreground">
                    <strong>💡 How it works:</strong> When you submit the correct answer, the reward is <strong>automatically transferred</strong> to your wallet. No separate claim step needed!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full h-11 px-4 py-3 bg-surface text-foreground font-semibold rounded-lg hover:bg-surface/80"
                >
                  Close
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
