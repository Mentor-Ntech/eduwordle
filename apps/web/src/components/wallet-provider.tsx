"use client"
import { useEffect, useRef } from 'react'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider, cookieStorage, createStorage, http, useAccount, useReconnect, useConnect } from 'wagmi'
import { celo, celoAlfajores } from 'wagmi/chains'
import { defineChain } from 'viem'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { WalletContextBridge } from '@/lib/wallet-context-bridge'

// WalletConnect depends on indexedDB, which doesn't exist during SSR.
// Polyfill it so server-side imports don't crash.
if (typeof window === 'undefined' && typeof globalThis.indexedDB === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const {
    indexedDB,
    IDBKeyRange,
    IDBDatabase,
    IDBFactory,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBRequest,
    IDBTransaction,
  } = require('fake-indexeddb')

  Object.assign(globalThis, {
    indexedDB,
    IDBKeyRange,
    IDBDatabase,
    IDBFactory,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBRequest,
    IDBTransaction,
  })
}

// Define Celo Sepolia chain
const celoSepolia = defineChain({
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://forno.celo-sepolia.celo-testnet.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Celo Sepolia Blockscout',
      url: 'https://celo-sepolia.blockscout.com',
    },
  },
  testnet: true,
})

const globalWithWagmi = globalThis as typeof globalThis & {
  __wagmiConfig?: ReturnType<typeof getDefaultConfig>
}

function getWagmiConfig() {
  if (!globalWithWagmi.__wagmiConfig) {
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim()
    
    if (!projectId) {
      throw new Error(
        'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Generate one at https://cloud.walletconnect.com/ and add it to apps/web/.env.local'
      )
    }
    
    globalWithWagmi.__wagmiConfig = getDefaultConfig({
      appName: 'eduwordle-celo',
      projectId,
      chains: [celoSepolia, celoAlfajores, celo], // Put Celo Sepolia first as default
      transports: {
        [celo.id]: http(),
        [celoAlfajores.id]: http(),
        [celoSepolia.id]: http(),
      },
      ssr: true,
      storage: createStorage({
        storage: cookieStorage,
      }),
    })
  }

  return globalWithWagmi.__wagmiConfig
}

// Create a stable query client instance that persists across navigation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus to prevent disconnections
      refetchOnMount: false, // Don't refetch on mount by default (individual queries can override with refetchOnMount: true)
      refetchOnReconnect: true, // Only refetch on reconnect
      retry: 1, // Retry once on failure
    },
  },
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={getWagmiConfig()}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <WalletAutoConnect />
          <WalletContextBridge>
            {children}
          </WalletContextBridge>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

function WalletAutoConnect() {
  const { reconnect } = useReconnect()
  const { connectAsync, connectors } = useConnect()
  const { status, connector } = useAccount()
  const hasAttempted = useRef(false)
  const reconnecting = useRef(false)
  const PREFERRED_CONNECTOR_KEY = 'eduwordle:preferred-connector'

  // Persist the last connected connector so we can prefer it next time.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (status === 'connected' && connector?.id) {
      window.localStorage.setItem(PREFERRED_CONNECTOR_KEY, connector.id)
    }
  }, [status, connector])

  // Attempt to reconnect on mount (client-side only)
  useEffect(() => {
    if (hasAttempted.current) return
    hasAttempted.current = true

    const attemptReconnect = async () => {
      if (typeof window === 'undefined') {
    reconnect()
        return
      }

      const preferredId = window.localStorage.getItem(PREFERRED_CONNECTOR_KEY)
      if (preferredId) {
        const preferredConnector = connectors.find((c) => c.id === preferredId)
        if (preferredConnector) {
          try {
            await connectAsync({ connector: preferredConnector })
            return
          } catch (error) {
            console.warn('Preferred connector reconnection failed', error)
          }
        }
      }

      reconnect()
    }

    attemptReconnect()
  }, [connectAsync, connectors, reconnect])

  // If Wagmi reports disconnected after initial attempt, try preferred connector once more
  useEffect(() => {
    if (status !== 'disconnected') return
    if (!hasAttempted.current || reconnecting.current) return
    if (typeof window === 'undefined') return

    const preferredId = window.localStorage.getItem(PREFERRED_CONNECTOR_KEY)
    if (!preferredId) return

    const preferredConnector = connectors.find((c) => c.id === preferredId)
    if (!preferredConnector) return

    reconnecting.current = true
    connectAsync({ connector: preferredConnector })
      .catch(() => {
        reconnect()
      })
      .finally(() => {
        reconnecting.current = false
      })
  }, [status, connectors, connectAsync, reconnect])

  return null
}
