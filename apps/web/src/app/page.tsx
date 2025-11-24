'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingHero } from '@/components/landing/landing-hero'
import { LandingFeatures } from '@/components/landing/landing-features'
import { LandingStats } from '@/components/landing/landing-stats'
import { LandingFAQ } from '@/components/landing/landing-faq'
import { LandingFooter } from '@/components/landing/landing-footer'

function LandingPageContent() {
  const router = useRouter()
  const { isConnected } = useAccount()

  // Redirect to dashboard when wallet is connected
  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard')
    }
  }, [isConnected, router])

  // Don't render if connected (will redirect)
  if (isConnected) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingStats />
      <LandingFAQ />
      <LandingFooter />
    </main>
  )
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR, render without wallet hooks
  if (!mounted) {
    return (
      <main className="min-h-screen bg-background">
        <LandingNav />
        <LandingHero />
        <LandingFeatures />
        <LandingStats />
        <LandingFAQ />
        <LandingFooter />
      </main>
    )
  }

  // After mount, render with wallet hooks
  return <LandingPageContent />
}
