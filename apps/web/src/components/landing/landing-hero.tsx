'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface LandingHeroProps {
  onConnectWallet?: () => void
  isConnecting?: boolean
}

// Game state constant
const GAME_STATE = [
  { word: 'LEARN', status: ['correct', 'present', 'absent', 'absent', 'absent'] },
  { word: 'WORDS', status: ['correct', 'correct', 'correct', 'correct', 'correct'] },
]

// Animated Wordle game board component
function AnimatedGameBoard() {
  const [flippedRows, setFlippedRows] = useState<number[]>([])
  const [visibleLetters, setVisibleLetters] = useState<{ [key: string]: number }>({})
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    const runAnimationCycle = (startDelay: number = 0) => {
      // Clear any existing timeouts
      timeoutRefs.current.forEach(clearTimeout)
      timeoutRefs.current = []

      // Reset state
      setVisibleLetters({})
      setFlippedRows([])

      const baseDelay = startDelay + 600
      const letterDelay = 150
      const flipDelay = 300

      // Type out first row letters
      GAME_STATE[0].word.split('').forEach((_, letterIdx) => {
        const timeout = setTimeout(() => {
          setVisibleLetters(prev => ({ ...prev, [`0-${letterIdx}`]: letterIdx }))
        }, baseDelay + letterIdx * letterDelay)
        timeoutRefs.current.push(timeout)
      })

      // Flip first row after typing completes
      const firstRowFlipDelay = baseDelay + GAME_STATE[0].word.length * letterDelay + flipDelay
      const timeout1 = setTimeout(() => setFlippedRows([0]), firstRowFlipDelay)
      timeoutRefs.current.push(timeout1)

      // Type out second row letters
      const secondRowStart = baseDelay + 1400 // Start second row 1.4s after first row starts
      GAME_STATE[1].word.split('').forEach((_, letterIdx) => {
        const timeout = setTimeout(() => {
          setVisibleLetters(prev => ({ ...prev, [`1-${letterIdx}`]: letterIdx }))
        }, secondRowStart + letterIdx * letterDelay)
        timeoutRefs.current.push(timeout)
      })

      // Flip second row after typing completes
      const secondRowFlipDelay = secondRowStart + GAME_STATE[1].word.length * letterDelay + flipDelay
      const timeout2 = setTimeout(() => setFlippedRows([0, 1]), secondRowFlipDelay)
      timeoutRefs.current.push(timeout2)

      // Restart animation after cycle completes (total cycle ~4.5 seconds)
      const cycleDuration = secondRowFlipDelay + 1000 // Add 1s pause before restart
      const restartTimeout = setTimeout(() => {
        runAnimationCycle(0)
      }, cycleDuration)
      timeoutRefs.current.push(restartTimeout)
    }

    runAnimationCycle(0)

    // Cleanup on unmount
    return () => {
      timeoutRefs.current.forEach(clearTimeout)
    }
  }, [])

  const getTileColor = (status: string) => {
    switch (status) {
      case 'correct': return 'bg-primary'
      case 'present': return 'bg-secondary'
      case 'absent': return 'bg-surface border-2 border-muted-foreground/30'
      default: return 'bg-surface border-2 border-muted-foreground/30'
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Floating reward coins */}
      <div className="absolute -top-8 -right-8 w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-2xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '2s' }}>
        💰
      </div>
      <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-xl animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '2.5s' }}>
        🏆
      </div>

      {/* Game Board */}
      <div className="bg-background rounded-2xl p-6 card-elevation">
        <div className="space-y-3">
          {GAME_STATE.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-2 justify-center">
              {row.word.split('').map((letter, letterIdx) => {
                const letterKey = `${rowIdx}-${letterIdx}`
                const isLetterVisible = visibleLetters[letterKey] !== undefined
                const shouldShowLetter = isLetterVisible && !flippedRows.includes(rowIdx)
                const isFlipped = flippedRows.includes(rowIdx)
                
                return (
                  <div
                    key={letterIdx}
                    className={`w-14 h-14 rounded-lg flex items-center justify-center text-white text-2xl font-bold transition-all duration-700 ${
                      isFlipped
                        ? `${getTileColor(row.status[letterIdx])} transform rotate-y-180` 
                        : 'bg-surface border-2 border-muted-foreground/30'
                    }`}
                    style={{
                      transitionDelay: isFlipped ? `${letterIdx * 0.1}s` : '0s',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {shouldShowLetter && (
                      <span className="typing-letter text-foreground" style={{ animation: 'typingPulse 0.3s ease-out' }}>
                        {letter}
                      </span>
                    )}
                    {isFlipped && (
                      <span className="text-white">{letter}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
          
          {/* Empty rows for visual effect */}
          {[2, 3].map((rowIdx) => (
            <div key={rowIdx} className="flex gap-2 justify-center">
              {[0, 1, 2, 3, 4].map((letterIdx) => (
                <div
                  key={letterIdx}
                  className="w-14 h-14 rounded-lg bg-surface border-2 border-muted-foreground/20"
                />
              ))}
            </div>
          ))}
        </div>

        {/* Success indicator */}
        {flippedRows.includes(1) && (
          <div className="mt-4 text-center fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-2xl">🎉</span>
              <span className="text-sm font-semibold text-primary">+25 cUSD Earned!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LandingHeroContent() {
  const { isConnected } = useAccount()
  
  // If already connected, don't show connect button
  if (isConnected) {
    return null
  }
  
  return <LandingHeroInner />
}

function HeroConnectButton() {
  const [wagmiReady, setWagmiReady] = useState(false)

  useEffect(() => {
    // Delay to ensure WagmiProvider is fully initialized
    const checkWagmi = () => {
      try {
        if (typeof window !== 'undefined') {
          setWagmiReady(true)
        }
      } catch (e) {
        setTimeout(checkWagmi, 50)
      }
    }
    const timer = setTimeout(checkWagmi, 250)
    return () => clearTimeout(timer)
  }, [])

  if (!wagmiReady) {
    return (
      <button
        disabled
        className="h-14 px-10 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark hover:shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 group"
      >
        <span>Start Playing Free</span>
        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    )
  }

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, mounted }) => {
        if (!mounted) {
          return (
            <button
              disabled
              className="h-14 px-10 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark hover:shadow-lg transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 group"
            >
              <span>Start Playing Free</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )
        }
        
        return (
          <button
            onClick={openConnectModal}
            className="h-14 px-10 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span>Start Playing Free</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )
      }}
    </ConnectButton.Custom>
  )
}

function LandingHeroInner() {
  return (
    <section className="py-12 md:py-24 px-4 bg-gradient-to-b from-background to-surface/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8 fade-in-up">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full w-fit">
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">🎓 Learn & Earn</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Master Words,
                <br />
                <span className="text-primary">Earn Real Rewards</span>
              </h1>
            </div>

            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
              Challenge yourself daily with EduWordle. Solve word puzzles, expand your vocabulary, and earn <span className="font-semibold text-primary">cUSD rewards</span> on the Celo blockchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <HeroConnectButton />
              <button className="h-14 px-10 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary/5 transition-all duration-300">
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-surface">
              <div>
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground mt-1">Active Players</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary">50K+</div>
                <div className="text-sm text-muted-foreground mt-1">cUSD Rewarded</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">4.9★</div>
                <div className="text-sm text-muted-foreground mt-1">User Rating</div>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-foreground">Daily challenges with instant cUSD rewards</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-foreground">Zero gas fees with MiniPay integration</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-foreground">Join a global community of learners</span>
              </div>
            </div>
          </div>

          {/* Right: Animated Game Board Visual */}
          <div className="relative hidden lg:flex items-center justify-center min-h-[500px]">
            <div className="relative w-full">
              {/* Background decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 rounded-3xl blur-3xl"></div>
              
              {/* Animated game board */}
              <div className="relative z-10">
                <AnimatedGameBoard />
              </div>

              {/* Floating particles */}
              <div className="absolute top-20 left-10 w-3 h-3 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
              <div className="absolute bottom-32 right-16 w-2 h-2 bg-secondary/40 rounded-full animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '2.5s' }}></div>
              <div className="absolute top-1/2 right-8 w-2.5 h-2.5 bg-accent/30 rounded-full animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function LandingHero({ onConnectWallet, isConnecting }: LandingHeroProps = {}) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Only use useAccount after mount (when WagmiProvider is available)
  if (mounted) {
    return <LandingHeroContent />
  }

  // During SSR, render without wallet hooks
  return <LandingHeroInner />
}
