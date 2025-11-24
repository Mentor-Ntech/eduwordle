'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { WithdrawRewardModal } from './withdraw-reward-modal'

export function MiniPayStatusCard() {
  const { walletAddress, balance } = useWallet()
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-accent/20 to-secondary/20 border-2 border-accent rounded-lg card-elevation">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg mb-1">MiniPay Wallet</h3>
          <p className="text-muted-foreground text-sm">Connected and verified</p>
        </div>
        <span className="text-2xl">💳</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
          <p className="font-mono text-sm">{walletAddress ? truncateAddress(walletAddress) : 'Not connected'}</p>
        </div>
        <div className="bg-white/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Balance</p>
          <p className="font-bold text-lg text-primary">{balance || '0'} cUSD</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          className="flex-1 h-11 px-3 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 text-sm"
          onClick={() => setShowWithdrawModal(true)}
        >
          Withdraw Rewards
        </button>
        <button className="flex-1 h-11 px-3 py-2 bg-white text-accent font-semibold rounded-lg hover:bg-surface text-sm border-2 border-accent">
          Add Funds
        </button>
      </div>

      {showWithdrawModal && (
        <WithdrawRewardModal onClose={() => setShowWithdrawModal(false)} />
      )}
    </div>
  )
}
