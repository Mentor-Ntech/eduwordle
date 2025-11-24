'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DashboardNav() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname?.includes(path)

  return (
    <div className="border-b border-primary/10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-1 h-16">
        <Link
          href="/dashboard"
          className={`px-4 h-full flex items-center font-medium text-sm transition-colors border-b-2 ${
            isActive('/dashboard') && !isActive('/dashboard/play') && !isActive('/leaderboard') && !isActive('/settings')
              ? 'text-primary border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          Home
        </Link>
        <Link
          href="/play"
          className={`px-4 h-full flex items-center font-medium text-sm transition-colors border-b-2 ${
            isActive('/play')
              ? 'text-primary border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          Play
        </Link>
        <Link
          href="/leaderboard"
          className={`px-4 h-full flex items-center font-medium text-sm transition-colors border-b-2 ${
            isActive('/leaderboard')
              ? 'text-primary border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          Leaderboard
        </Link>
        <Link
          href="/settings"
          className={`px-4 h-full flex items-center font-medium text-sm transition-colors border-b-2 ${
            isActive('/settings')
              ? 'text-primary border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          Settings
        </Link>
      </div>
    </div>
  )
}
