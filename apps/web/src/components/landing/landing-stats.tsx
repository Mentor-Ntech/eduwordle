export function LandingStats() {
  const stats = [
    { number: '50K+', label: 'Active Players' },
    { number: '500K+', label: 'Words Guessed' },
    { number: '$100K+', label: 'Rewards Distributed' },
    { number: '95%', label: 'Player Satisfaction' }
  ]

  return (
    <section id="stats" className="py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</div>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
