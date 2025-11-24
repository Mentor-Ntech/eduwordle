'use client'

import { useUserStats } from '@/lib/user-context'

export function QuickStatsGrid() {
  const { stats } = useUserStats()

  const displayStats = [
    { label: 'Current Streak', value: stats.streak.toString(), icon: '🔥' },
    { label: 'Wins This Month', value: stats.winsThisMonth.toString(), icon: '🏆' },
    { label: 'Total Earnings', value: `${stats.totalEarnings} cUSD`, icon: '💰' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {displayStats.map((stat, idx) => (
        <div key={idx} className="bg-surface rounded-lg p-4 card-elevation text-center">
          <p className="text-2xl mb-2">{stat.icon}</p>
          <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
          <p className="font-bold text-lg text-primary">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
