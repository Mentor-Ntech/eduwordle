'use client'

import { useState } from 'react'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import { LeaderboardFilter } from '@/components/leaderboard/leaderboard-filter'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { transformLeaderboardData } from '@/lib/leaderboard-data'
import { useAccount } from 'wagmi'

export default function LeaderboardPage() {
  const { address } = useAccount()
  const [filter, setFilter] = useState<'wins' | 'streak'>('wins')
  const { topByWins, topByStreak, isLoading, isContractDeployed } = useLeaderboard(20)

  // Transform contract data to UI format
  const leaderboardData = filter === 'wins' 
    ? transformLeaderboardData(
        topByWins.map((entry, idx) => ({
          rank: idx + 1,
          address: entry.address,
          wins: entry.wins,
          streak: 0, // Will be filled from player stats if needed
        })),
        address || undefined
      )
    : transformLeaderboardData(
        topByStreak.map((entry, idx) => ({
          rank: idx + 1,
          address: entry.address,
          wins: 0, // Will be filled from player stats if needed
          streak: entry.streak,
        })),
        address || undefined
      )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">Compete with players worldwide</p>
      </div>

      <LeaderboardFilter filter={filter} onFilterChange={setFilter} />
      
      {!isContractDeployed ? (
        <div className="text-center py-12">
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-foreground mb-2">Contracts Not Deployed</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The leaderboard contracts haven't been deployed yet. Please deploy the contracts first.
            </p>
            <p className="text-xs text-muted-foreground">
              Check <code className="bg-background px-2 py-1 rounded">apps/contracts/DEPLOYMENT_STATUS.md</code> for deployment instructions.
            </p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading leaderboard...</div>
        </div>
      ) : leaderboardData.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">No players yet. Be the first!</div>
        </div>
      ) : (
        <LeaderboardTable data={leaderboardData} />
      )}
    </div>
  )
}
