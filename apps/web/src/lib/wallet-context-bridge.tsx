'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useBalance, useDisconnect, useConnect } from 'wagmi'
import { formatUnits } from 'viem'

// Fallback context for SSR
const defaultContextValue = {
  isConnected: false,
  walletAddress: null,
  balance: null,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
}

interface WalletContextType {
  isConnected: boolean
  walletAddress: string | null
  balance: string | null
  isConnecting: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType>(defaultContextValue)

export function WalletContextBridge({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR or before mount, provide default values
  if (!mounted) {
    return (
      <WalletContext.Provider value={defaultContextValue}>
        {children}
      </WalletContext.Provider>
    )
  }

  // After mount, use real Wagmi hooks
  return <WalletContextBridgeInner>{children}</WalletContextBridgeInner>
}

function WalletContextBridgeInner({ children }: { children: React.ReactNode }) {
  const { address, isConnected: wagmiConnected, chainId } = useAccount()
  
  // cUSD token addresses for different Celo networks
  const cUSD_ADDRESSES: Record<number, `0x${string}`> = {
    42220: '0x765DE816845861e75A25fCA122bb6898B8B1282a', // Celo Mainnet
    44787: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1', // Alfajores Testnet
    11142220: '0x644160A6e05D96fA84dc5525E1E5CC213D9F3a13', // Celo Sepolia (MockERC20)
  }
  
  const cUSDAddress = chainId ? cUSD_ADDRESSES[chainId] : undefined
  
  const { data: balanceData } = useBalance({
    address: address,
    token: cUSDAddress,
  })
  const { disconnect } = useDisconnect()
  const { connect, connectors, isPending } = useConnect()
  const [isConnecting, setIsConnecting] = useState(false)

  // Format balance - use native CELO if cUSD not available
  const balance = balanceData 
    ? parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(2)
    : null

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      // Try to find MiniPay connector first, then fallback to others
      const minipayConnector = connectors.find(c => 
        c.id === 'minipay' || c.name.toLowerCase().includes('minipay')
      )
      const connector = minipayConnector || connectors[0]
      
      if (connector) {
        connect({ connector })
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    disconnect()
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected: wagmiConnected,
        walletAddress: address || null,
        balance,
        isConnecting: isConnecting || isPending,
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}

