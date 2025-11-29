'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

export function DashboardNav() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname?.includes(path)

  const navItems = [
    { name: 'Home', href: '/dashboard', isActive: isActive('/dashboard') && !isActive('/dashboard/play') && !isActive('/leaderboard') && !isActive('/settings') },
    { name: 'Play', href: '/play', isActive: isActive('/play') },
    { name: 'Leaderboard', href: '/leaderboard', isActive: isActive('/leaderboard') },
    { name: 'Settings', href: '/settings', isActive: isActive('/settings') },
  ]

  return (
    <div className="border-b border-primary/10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-1 h-16">
        {/* Mobile hamburger menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <div className="flex items-center gap-2 mb-8">
              <span className="font-bold text-lg">
                Menu
              </span>
            </div>
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-base font-medium transition-colors border-b-2 pb-2 ${
                    item.isActive
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop navigation - hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 h-full flex items-center font-medium text-sm transition-colors border-b-2 ${
                item.isActive
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
