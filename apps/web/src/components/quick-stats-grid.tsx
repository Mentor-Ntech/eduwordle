'use client'

import { useUserStats } from '@/lib/user-context'
import { useAccount } from 'wagmi'

export function QuickStatsGrid() {
  const { stats, lastSyncedAt, isLoading } = useUserStats()
  const { status } = useAccount()
  const isConnected = status === 'connected'

  const displayStats = [
    { label: 'Current Streak', value: stats.streak.toString(), icon: '🔥' },
    { label: 'Longest Streak', value: stats.longestStreak.toString(), icon: '🏅' },
    { label: 'Total Earnings', value: `${stats.totalEarnings} cUSD`, icon: '💰' },
  ]

  const formattedLastSync = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString()
    : null

  return (
    <div className="space-y-2">
    <div className="grid grid-cols-3 gap-3">
      {displayStats.map((stat, idx) => (
        <div key={idx} className="bg-surface rounded-lg p-4 card-elevation text-center">
          <p className="text-2xl mb-2">{stat.icon}</p>
          <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
          <p className="font-bold text-lg text-primary">{stat.value}</p>
        </div>
      ))}
      </div>
      {!isConnected && formattedLastSync && !isLoading && (
        <p className="text-xs text-muted-foreground text-right">
          Showing cached stats (last synced {formattedLastSync}). Connect your wallet for live data.
        </p>
      )}
    </div>
  )
}
