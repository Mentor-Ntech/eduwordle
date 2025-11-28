'use client'

import { useState, useEffect, useMemo } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { useTranslations } from '@/lib/use-translations'
import { WithdrawRewardModal } from './withdraw-reward-modal'
import { AddFundsModal } from './add-funds-modal'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { getCusdAddress } from '@/lib/contracts/config'

export function MiniPayStatusCard() {
  const { walletAddress, balance: walletBalance } = useWallet()
  const { t } = useTranslations()
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showAddFundsModal, setShowAddFundsModal] = useState(false)
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  
  // Fetch balance directly to ensure it's always up to date
  const { data: balanceData, isLoading: isLoadingBalance, refetch: refetchBalance } = useBalance({
    address,
    token: chainId ? getCusdAddress(chainId) : undefined,
    query: {
      enabled: !!address && isConnected && !!chainId,
      refetchInterval: 5000, // Refetch every 5 seconds for faster updates
      staleTime: 0, // Always consider data stale to force fresh fetches
    },
  })

  // Use direct balance data if available, fallback to wallet context
  const balance = useMemo(() => {
    if (balanceData) {
      const bal = parseFloat(balanceData.formatted).toFixed(2)
      console.log('💰 MiniPay card balance from blockchain:', bal, 'cUSD', {
        raw: balanceData.value.toString(),
        decimals: balanceData.decimals,
        formatted: balanceData.formatted,
        symbol: balanceData.symbol,
        tokenAddress: chainId ? getCusdAddress(chainId) : 'N/A',
      })
      return bal
    }
    return walletBalance || '0.00'
  }, [balanceData, walletBalance, chainId])
  
  // Refetch balance when modals close (in case withdrawal or add funds happened)
  useEffect(() => {
    if ((!showWithdrawModal || !showAddFundsModal) && address && isConnected && chainId) {
      // Refetch balance when any modal closes
      console.log('🔄 Modal closed, scheduling balance refetch...', { showWithdrawModal, showAddFundsModal })
      const timer = setTimeout(() => {
        console.log('🔄 Refetching balance after modal close (1s)...')
        refetchBalance()
      }, 1000)
      
      // Refetch again after a few seconds to ensure we have the latest
      const timer2 = setTimeout(() => {
        console.log('🔄 Refetching balance after modal close (3s)...')
        refetchBalance()
      }, 3000)
      
      const timer3 = setTimeout(() => {
        console.log('🔄 Refetching balance after modal close (5s)...')
        refetchBalance()
      }, 5000)
      
      return () => {
        clearTimeout(timer)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [showWithdrawModal, showAddFundsModal, address, isConnected, chainId, refetchBalance])

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-accent/20 to-secondary/20 border-2 border-accent rounded-lg card-elevation">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg mb-1">{t('minipay.title')}</h3>
          <p className="text-muted-foreground text-sm">{t('minipay.connected')}</p>
        </div>
        <span className="text-2xl">💳</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">{t('minipay.walletAddress')}</p>
          <p className="font-mono text-sm">{walletAddress ? truncateAddress(walletAddress) : 'Not connected'}</p>
        </div>
        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">{t('minipay.balance')}</p>
            {!isLoadingBalance && balanceData && (
              <button
                onClick={() => {
                  console.log('🔄 Manual balance refresh triggered')
                  refetchBalance()
                }}
                className="text-xs text-primary hover:text-primary/80 underline"
                title="Refresh balance from blockchain"
              >
                Refresh
              </button>
            )}
          </div>
          {isLoadingBalance ? (
            <p className="font-bold text-lg text-primary animate-pulse">Loading...</p>
          ) : (
            <p className="font-bold text-lg text-primary">{balance} cUSD</p>
          )}
          {balanceData && !isLoadingBalance && (
            <p className="text-xs text-muted-foreground/70 mt-1 italic">
              Live from blockchain
            </p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          className="flex-1 h-11 px-3 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 text-sm"
          onClick={() => setShowWithdrawModal(true)}
        >
          {t('minipay.withdrawRewards')}
        </button>
        <button 
          className="flex-1 h-11 px-3 py-2 bg-white text-accent font-semibold rounded-lg hover:bg-surface text-sm border-2 border-accent transition-colors"
          onClick={() => setShowAddFundsModal(true)}
        >
          {t('minipay.addFunds')}
        </button>
      </div>

      {showWithdrawModal && (
        <WithdrawRewardModal onClose={() => setShowWithdrawModal(false)} />
      )}

      {showAddFundsModal && (
        <AddFundsModal 
          onClose={() => {
            setShowAddFundsModal(false)
            // Force refetch balance when modal closes
            setTimeout(() => {
              console.log('🔄 Add funds modal closed, forcing balance refetch...')
              refetchBalance()
            }, 500)
            setTimeout(() => {
              refetchBalance()
            }, 2000)
          }} 
        />
      )}
    </div>
  )
}
