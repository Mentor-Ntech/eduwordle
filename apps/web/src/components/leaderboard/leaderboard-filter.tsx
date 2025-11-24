'use client'

interface LeaderboardFilterProps {
  filter?: 'wins' | 'streak'
  onFilterChange?: (filter: 'wins' | 'streak') => void
}

export function LeaderboardFilter({ filter = 'wins', onFilterChange }: LeaderboardFilterProps) {
  const options = [
    { value: 'wins' as const, label: 'By Wins' },
    { value: 'streak' as const, label: 'By Streak' }
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onFilterChange?.(option.value)}
          className={`h-11 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
            filter === option.value
              ? 'bg-primary text-white'
              : 'bg-surface text-foreground hover:bg-surface/80 border border-primary/10'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
