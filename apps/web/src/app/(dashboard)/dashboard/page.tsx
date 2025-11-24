'use client'

import { Header } from '@/components/header'
import { MiniPayConnectionBanner } from '@/components/minipay-connection-banner'
import { DailyChallengeCard } from '@/components/daily-challenge-card'
import { QuickStatsGrid } from '@/components/quick-stats-grid'
import { StreakBadge } from '@/components/streak-badge'
import { useUserStats } from '@/hooks/use-user-stats'
import { useAccount } from 'wagmi'
import Link from 'next/link'

export default function DashboardPage() {
  const { isConnected } = useAccount()
  const { rewardAmount, hasClaimed } = useUserStats()

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StreakBadge />
        <QuickStatsGrid />
      </div>

      <MiniPayConnectionBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <DailyChallengeCard />
        </div>
        
        <div className="space-y-4">
          <div className="card-elevation p-6 rounded-lg bg-surface">
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/play" className="block">
                <button className="w-full h-11 bg-primary text-white font-semibold rounded-lg hover:card-elevation-hover transition-all">
                  Play Today
                </button>
              </Link>
              <Link href="/leaderboard" className="block">
                <button className="w-full h-11 bg-surface text-foreground font-semibold rounded-lg border border-primary/20 hover:card-elevation-hover transition-all">
                  Leaderboard
                </button>
              </Link>
              <Link href="/settings" className="block">
                <button className="w-full h-11 bg-surface text-foreground font-semibold rounded-lg border border-primary/20 hover:card-elevation-hover transition-all">
                  Settings
                </button>
              </Link>
            </div>
          </div>

          <div className="card-elevation p-6 rounded-lg bg-surface">
            <h3 className="text-lg font-bold text-foreground mb-2">Rewards</h3>
            <p className="text-sm text-muted-foreground mb-4">Earn cUSD for correct answers</p>
            {isConnected ? (
              <>
                <div className="text-2xl font-bold text-success">
                  {hasClaimed ? '0.00' : rewardAmount} cUSD
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {hasClaimed ? 'Already claimed today' : 'Available to claim'}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground">—</div>
                <p className="text-xs text-muted-foreground mt-2">Connect wallet to see rewards</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
