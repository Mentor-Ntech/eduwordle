'use client'

import { Header } from '@/components/header'
import { MiniPayConnectionBanner } from '@/components/minipay-connection-banner'
import { DailyChallengeCard } from '@/components/daily-challenge-card'
import { QuickStatsGrid } from '@/components/quick-stats-grid'
import { StreakBadge } from '@/components/streak-badge'
import { useUserStats } from '@/hooks/use-user-stats'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { useDailyWord } from '@/hooks/use-daily-word'
import { useLeaderboard } from '@/hooks/use-leaderboard'

export default function DashboardPage() {
  const { isConnected } = useAccount()
  const { rewardAmount, hasClaimed } = useUserStats()
  const {
    word: dailyWord,
    date: dailyWordDate,
    updatedAt: dailyWordUpdatedAt,
    isLoading: isDailyWordLoading,
    error: dailyWordError,
  } = useDailyWord()
  const {
    isLeaderboardConnected,
    hasAddressMismatch,
    expectedLeaderboardAddress,
    onChainLeaderboardAddress,
  } = useLeaderboard(1)

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StreakBadge />
        <QuickStatsGrid />
        <div className="rounded-lg card-elevation bg-surface border border-primary/20 p-4 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-foreground">Daily Automation</h3>
            <span className="text-xs text-muted-foreground">
              {dailyWordDate ? dailyWordDate : '—'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              Status:{' '}
              {isDailyWordLoading ? (
                <span className="text-muted-foreground">Loading…</span>
              ) : dailyWordError ? (
                <span className="text-warning-foreground">Failed to load daily word</span>
              ) : (
                <span className="text-success">Ready</span>
              )}
            </p>
            <p>
              Word:{' '}
              {dailyWord ? (
                <span className="font-semibold tracking-wide">{dailyWord}</span>
              ) : (
                '—'
              )}
            </p>
            <p>
              Updated:{' '}
              {dailyWordUpdatedAt
                ? new Date(dailyWordUpdatedAt).toLocaleString()
                : '—'}
            </p>
            {!isLeaderboardConnected && (
              <p className="text-warning-foreground">
                Leaderboard not connected on-chain. Run automation or call{' '}
                <code>setLeaderboardContract</code>.
              </p>
            )}
            {hasAddressMismatch && (
              <p className="text-warning-foreground">
                Leaderboard mismatch: expected{' '}
                <code>{expectedLeaderboardAddress}</code> but on-chain is{' '}
                <code>{onChainLeaderboardAddress}</code>.
              </p>
            )}
          </div>
        </div>
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
