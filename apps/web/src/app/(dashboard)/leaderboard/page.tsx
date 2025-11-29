'use client'

import { useState, useEffect, useMemo } from 'react'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import { LeaderboardFilter } from '@/components/leaderboard/leaderboard-filter'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { transformLeaderboardData } from '@/lib/leaderboard-data'
import { useAccount } from 'wagmi'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LeaderboardPage() {
  const { address, isConnected } = useAccount()
  const [filter, setFilter] = useState<'wins' | 'streak'>('wins')
  const {
    topByWins,
    topByStreak,
    isLoading,
    isContractDeployed,
    isLeaderboardConnected,
    hasAddressMismatch,
    expectedLeaderboardAddress,
    onChainLeaderboardAddress,
    refetch,
  } = useLeaderboard(20)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Debug logging (remove in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Leaderboard Debug:', {
        isContractDeployed,
        isLoading,
        topByWinsLength: topByWins?.length || 0,
        topByStreakLength: topByStreak?.length || 0,
        isConnected,
        address,
      })
    }
  }, [isContractDeployed, isLoading, topByWins, topByStreak, isConnected, address])

  // Auto-refresh when page becomes visible (user switches back to tab)
  useEffect(() => {
    if (!isContractDeployed) return
    
    const handleVisibilityChange = () => {
      if (!document.hidden && isContractDeployed) {
        refetch()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refetch, isContractDeployed])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Transform contract data to UI format
  // Use empty array if data is not available yet
  const leaderboardData = useMemo(() => {
    const dataToTransform = filter === 'wins' ? topByWins : topByStreak
    
    if (!dataToTransform || dataToTransform.length === 0) {
      return []
    }
    
    return transformLeaderboardData(
      dataToTransform.map((entry, idx) => ({
        rank: idx + 1,
        address: entry.address,
        wins: entry.wins,
        streak: entry.streak,
        totalRewards: entry.totalRewards,
      })),
      address || undefined
    )
  }, [filter, topByWins, topByStreak, address])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Compete with players worldwide</p>
        </div>
        {isContractDeployed && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {!isLeaderboardConnected && (
        <div className="p-4 border border-warning/30 bg-warning/10 rounded-lg text-sm text-warning-foreground">
          <p className="font-semibold mb-1">Leaderboard contract not connected</p>
          <p>
            Run the daily automation (or call <code>setLeaderboardContract</code>) so EduWordle knows where to record wins.
          </p>
        </div>
      )}

      {hasAddressMismatch && (
        <div className="p-4 border border-destructive/30 bg-destructive/10 rounded-lg text-sm text-destructive">
          <p className="font-semibold mb-1">Leaderboard address mismatch</p>
          <p>
            Expected <code>{expectedLeaderboardAddress}</code> but found{' '}
            <code>{onChainLeaderboardAddress}</code> on-chain.
          </p>
        </div>
      )}

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
      ) : isLoading && (!topByWins || topByWins.length === 0) && (!topByStreak || topByStreak.length === 0) ? (
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
