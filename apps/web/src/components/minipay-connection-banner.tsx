'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { CloseIcon } from '@/components/icons/close'

export function MiniPayConnectionBanner() {
  const [dismissed, setDismissed] = useState(false)
  const { isConnected, walletAddress } = useWallet()

  if (dismissed || !isConnected || !walletAddress) return null

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="mb-6 p-4 bg-accent/10 border-l-4 border-accent rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">💳</span>
        <div>
          <p className="font-semibold text-foreground">MiniPay Connected</p>
          <p className="text-sm text-muted-foreground">Wallet: {truncateAddress(walletAddress)}</p>
        </div>
      </div>
      
      <button 
        onClick={() => setDismissed(true)}
        className="h-11 w-11 p-2 hover:bg-accent/20 rounded-lg"
      >
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  )
}
