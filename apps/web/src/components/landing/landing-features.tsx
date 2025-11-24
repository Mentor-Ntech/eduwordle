export function LandingFeatures() {
  const features = [
    {
      icon: '📚',
      title: 'Learn Vocabulary',
      description: 'Expand your vocabulary with daily word challenges designed by educators.'
    },
    {
      icon: '🎮',
      title: 'Gamified Learning',
      description: 'Compete on leaderboards, build streaks, and unlock achievements while learning.'
    },
    {
      icon: '💰',
      title: 'Earn Rewards',
      description: 'Get real cUSD rewards instantly to your Celo wallet for correct answers.'
    },
    {
      icon: '🌍',
      title: 'Global Community',
      description: 'Connect with learners worldwide and compete in regional leaderboards.'
    },
    {
      icon: '⚡',
      title: 'Web3 Native',
      description: 'Built on Celo blockchain for transparent, instant, and secure transactions.'
    },
    {
      icon: '🎯',
      title: 'Skill Building',
      description: 'Develop critical thinking, improve typing speed, and boost language skills.'
    }
  ]

  return (
    <section id="features" className="py-16 md:py-24 px-4 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to learn, play, and earn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="card-elevation p-6 rounded-xl bg-background hover:shadow-lg transition-all">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
