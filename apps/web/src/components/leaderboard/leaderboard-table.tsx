'use client'

import { LeaderboardEntry } from '@/lib/leaderboard-data'

interface LeaderboardTableProps {
  data?: LeaderboardEntry[]
}

export function LeaderboardTable({ data }: LeaderboardTableProps) {
  const tableData = data || []

  return (
    <div className="rounded-lg overflow-hidden card-elevation">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface bg-surface/50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Player</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-muted-foreground">Streak</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-muted-foreground">Wins</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Points</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((entry: LeaderboardEntry) => (
              <tr 
                key={entry.rank}
                className={`border-b border-surface/50 hover:bg-surface/50 transition-colors ${entry.isCurrentUser ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
              >
                <td className="px-4 py-4">
                  <span className="font-bold text-lg">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{entry.avatar}</span>
                    <div>
                      <span className="font-semibold text-foreground">{entry.username}</span>
                      {entry.isCurrentUser && <p className="text-xs text-primary font-medium">Your ranking</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full text-sm font-semibold text-primary">
                    🔥 {entry.streak}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-semibold text-foreground">{entry.wins}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-bold text-lg text-primary">{entry.points.toLocaleString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
