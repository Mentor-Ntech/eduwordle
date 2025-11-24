'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EduWordleLogo } from '@/components/brand/eduwordle-logo'

interface HeaderProps {
  showBackButton?: boolean
}

export function Header({ showBackButton = false }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="border-b border-surface bg-background sticky top-0 z-50 card-elevation">
      <div className="px-4 py-4 sm:px-6 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button 
              onClick={() => router.back()}
              className="h-11 w-11 p-2 hover:bg-surface rounded-lg"
            >
              ← Back
            </button>
          )}
          <Link href="/" className="flex items-center">
            <EduWordleLogo size="md" priority />
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="/" className="text-foreground hover:text-primary font-medium">Home</a>
          <a href="/play" className="text-foreground hover:text-primary font-medium">Play</a>
          <a href="/leaderboard" className="text-foreground hover:text-primary font-medium">Leaderboard</a>
          <a href="/settings" className="text-foreground hover:text-primary font-medium">Settings</a>
        </nav>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold px-3 py-1 bg-secondary/20 text-secondary rounded-full">
            0.42 cUSD
          </span>
          <button className="h-11 w-11 p-2 hover:bg-surface rounded-lg text-lg">
            ⚙️
          </button>
        </div>
      </div>
    </header>
  )
}
