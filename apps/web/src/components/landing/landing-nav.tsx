'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { EduWordleLogo } from '@/components/brand/eduwordle-logo'
import { WalletConnectButton } from '@/components/connect-button'

function LandingNavInner() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <EduWordleLogo size="md" priority />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground hover:text-primary transition-colors text-sm">
              Features
            </a>
            <a href="#stats" className="text-foreground hover:text-primary transition-colors text-sm">
              Why Us
            </a>
            <a href="#faq" className="text-foreground hover:text-primary transition-colors text-sm">
              FAQ
            </a>
          </div>

          {/* Connect Wallet Button - RainbowKit */}
          <div className="flex items-center gap-4">
            <WalletConnectButton />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <a href="#features" className="block text-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#stats" className="block text-foreground hover:text-primary transition-colors">
              Why Us
            </a>
            <a href="#faq" className="block text-foreground hover:text-primary transition-colors">
              FAQ
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}

export function LandingNav() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Only use useAccount after mount (when WagmiProvider is available)
  if (mounted) {
    return <LandingNavWithWallet />
  }

  // During SSR, render without wallet hooks
  return <LandingNavInner />
}

function LandingNavWithWallet() {
  const router = useRouter()
  const { isConnected } = useAccount()

  // Redirect to dashboard when wallet is connected
  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard')
    }
  }, [isConnected, router])

  return <LandingNavInner />
}
