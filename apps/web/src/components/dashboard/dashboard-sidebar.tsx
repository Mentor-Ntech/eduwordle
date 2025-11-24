'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/lib/wallet-context'
import { EduWordleLogo } from '@/components/brand/eduwordle-logo'

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { walletAddress, disconnectWallet } = useWallet()
  const router = useRouter()

  const handleDisconnect = () => {
    disconnectWallet()
    router.push('/')
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 hover:bg-surface rounded-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-surface border-r border-primary/10 transform transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6">
          <Link href="/" className="flex items-center mb-8">
            <EduWordleLogo size="md" priority />
          </Link>

          {walletAddress && (
            <div className="mb-6 p-4 rounded-lg bg-background border border-primary/20">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Connected Wallet
              </p>
              <p className="text-sm font-mono text-foreground">{truncateAddress(walletAddress)}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">
              Menu
            </p>
            <Link
              href="/dashboard"
              className="block px-4 py-3 rounded-lg hover:bg-background transition-colors text-foreground"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/play"
              className="block px-4 py-3 rounded-lg hover:bg-background transition-colors text-foreground"
              onClick={() => setIsOpen(false)}
            >
              Play Game
            </Link>
            <Link
              href="/leaderboard"
              className="block px-4 py-3 rounded-lg hover:bg-background transition-colors text-foreground"
              onClick={() => setIsOpen(false)}
            >
              Leaderboard
            </Link>
            <Link
              href="/settings"
              className="block px-4 py-3 rounded-lg hover:bg-background transition-colors text-foreground"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-primary/10">
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-3 rounded-lg bg-error/10 text-error font-medium hover:bg-error/20 transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
