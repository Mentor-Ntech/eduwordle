'use client'

import { useUserStats } from '@/lib/user-context'

export function StreakBadge() {
  const { stats } = useUserStats()

  return (
    <div className="relative overflow-hidden rounded-lg card-elevation bg-gradient-to-r from-secondary/20 to-primary/20 border-2 border-secondary p-6">
      {/* Animated background accent */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 right-2 w-20 h-20 bg-secondary rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10 text-center">
        <p className="text-5xl mb-2">🔥</p>
        <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
        <p className="text-4xl font-bold text-primary mb-1">{stats.streak}</p>
        <p className="text-xs text-muted-foreground">Days in a row</p>
        
        <div className="mt-4 pt-4 border-t border-secondary/30">
          <p className="text-xs font-semibold text-primary">Keep it up!</p>
        </div>
      </div>
    </div>
  )
}
