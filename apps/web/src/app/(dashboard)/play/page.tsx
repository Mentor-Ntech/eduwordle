'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { GameBoard } from '@/components/game/game-board'
import { OnScreenKeyboard } from '@/components/game/on-screen-keyboard'
import { GameStatus } from '@/components/game/game-status'
import { RewardClaimModal } from '@/components/modals/reward-claim-modal'
import { 
  WORD_LENGTH, 
  MAX_GUESSES, 
  TileState, 
  checkGuess,
  validateGuess,
  isGameWon,
  isGameLost,
  getUsedLetters,
  getLetterStatuses
} from '@/lib/game-logic'
import { useUserStats } from '@/lib/user-context'
import { useAccount } from 'wagmi'
import { useSubmitAnswer } from '@/hooks/use-submit-answer'
import { useUserStats as useContractUserStats } from '@/hooks/use-user-stats'
import { useDailyPuzzle } from '@/hooks/use-daily-puzzle'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { toast } from 'sonner'
import { usePuzzleAdmin } from '@/hooks/use-puzzle-admin'
import { useDailyWord } from '@/hooks/use-daily-word'

export default function PlayPage() {
  const { address, isConnected } = useAccount()
  const { refetch: refetchUserStats } = useUserStats()
  const { hasClaimed, rewardAmount, refetch: refetchContractStats } = useContractUserStats()
  const { submitAnswer, isSubmitting, isConfirmed, error, txHash, reset } = useSubmitAnswer()
  const {
    isInitialized,
    isLoading: isPuzzleLoading,
    isSupportedChain,
    contractAddress,
    refetch: refetchPuzzle,
    isStalePuzzle,
    lastInitializedDay,
    lastInitializedDate,
    todayTimestamp,
    nextResetTimestamp,
  } = useDailyPuzzle()
  const {
    isOwner,
    initializePuzzle,
    isInitializing: isInitializingPuzzle,
    initError,
    initSuccess,
    txHash: initTxHash,
  } = usePuzzleAdmin(contractAddress as `0x${string}` | undefined)
  const { refetch: refetchLeaderboard } = useLeaderboard(10)
  
  const [tiles, setTiles] = useState<TileState[][]>([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'claimed'>('playing')
  const [usedLetters, setUsedLetters] = useState<Set<string>>(new Set())
  const [letterStatuses, setLetterStatuses] = useState<Map<string, 'correct' | 'present' | 'absent'>>(new Map())
  const [message, setMessage] = useState('')
  const [showRewardModal, setShowRewardModal] = useState(false)
  const {
    word: dailyWord,
    isLoading: isDailyWordLoading,
    error: dailyWordError,
    refetch: refetchDailyWord,
  } = useDailyWord()
  const [hasPlayedToday, setHasPlayedToday] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], [])
  const playStorageKey = useMemo(() => {
    if (!address) return null
    return `eduwordle:played:${address.toLowerCase()}:${todayKey}`
  }, [address, todayKey])

  const lastInitializedDisplay = useMemo(() => {
    if (!lastInitializedDate) return null
    return lastInitializedDate.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    })
  }, [lastInitializedDate])

  const nextResetDisplay = useMemo(() => {
    if (!nextResetTimestamp) return null
    return new Date(nextResetTimestamp * 1000).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    })
  }, [nextResetTimestamp])

  const markHasPlayed = useCallback(() => {
    if (!playStorageKey || typeof window === 'undefined') return
    window.localStorage.setItem(playStorageKey, 'true')
    setHasPlayedToday(true)
  }, [playStorageKey])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Clean up localStorage entries from previous days on mount
  useEffect(() => {
    if (!address || typeof window === 'undefined') return
    
    const today = new Date().toISOString().split('T')[0]
    const prefix = `eduwordle:played:${address.toLowerCase()}:`
    
    // Clear all localStorage entries for this address that aren't from today
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key && key.startsWith(prefix) && !key.endsWith(`:${today}`)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => window.localStorage.removeItem(key))
    } catch (e) {
      console.warn('Failed to clean up localStorage:', e)
    }
  }, [address])

  // Sync localStorage with contract state (contract is source of truth)
  useEffect(() => {
    if (!address || !isConnected || typeof window === 'undefined') {
      setHasPlayedToday(false)
      if (gameStatus === 'claimed') {
        setGameStatus('playing')
      }
      return
    }

    // Contract state is the source of truth - be strict about it
    const claimed = Boolean(hasClaimed)
    
    if (claimed) {
      // User has claimed on-chain, mark as played and block further play
      if (playStorageKey) {
        window.localStorage.setItem(playStorageKey, 'true')
      }
      setHasPlayedToday(true)
      setGameStatus('claimed')
      // Clear any game state
      setTiles([])
      setCurrentGuess('')
    } else {
      // User hasn't claimed on-chain, clear localStorage and allow play
      if (playStorageKey) {
        window.localStorage.removeItem(playStorageKey)
      }
      setHasPlayedToday(false)
      // Only reset to playing if we're in claimed state
      if (gameStatus === 'claimed') {
        setGameStatus('playing')
      }
    }
  }, [hasClaimed, isConnected, address, playStorageKey, gameStatus])

  // Handle successful contract submission
  useEffect(() => {
    if (isConfirmed && txHash) {
      toast.success('Reward claimed successfully!')
      
      // Mark as played now that transaction is confirmed
      markHasPlayed()
      
      // Update local stats after successful transaction
      // IMMEDIATELY block further play
      setGameStatus('claimed')
      setTiles([])
      setCurrentGuess('')
      
      // Refetch contract stats to get updated data (this will update hasClaimed)
      // Use setTimeout to ensure refetch happens after state update
      setTimeout(() => {
        refetchContractStats()
        refetchUserStats()
        // Force leaderboard refetch multiple times to ensure it updates
        refetchLeaderboard()
        setTimeout(() => refetchLeaderboard(), 1000)
        setTimeout(() => refetchLeaderboard(), 3000)
      }, 500)
      
      // Close modal after a short delay
      setTimeout(() => {
        setShowRewardModal(false)
        reset()
      }, 2000)
    }
  }, [isConfirmed, txHash, rewardAmount, refetchUserStats, refetchContractStats, refetchLeaderboard, reset, markHasPlayed])

  // Handle submission errors
  useEffect(() => {
    if (error) {
      console.error('❌ Transaction error in play page:', error)
      
      let errorMessage = 'Transaction failed'
      
      // Handle different error types
      if (error.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error.cause) {
        errorMessage = String(error.cause)
      } else if ((error as any).shortMessage) {
        errorMessage = (error as any).shortMessage
      }
      
      console.error('Error message:', errorMessage)
      
      // User-friendly error messages
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected') || errorMessage.includes('rejected')) {
        errorMessage = 'Transaction was cancelled. Please try again.'
      } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
        errorMessage = 'Insufficient funds for gas fees'
      } else if (errorMessage.includes('Already claimed') || errorMessage.includes('already claimed')) {
        errorMessage = 'You have already claimed today\'s reward'
      } else if (errorMessage.includes('Incorrect answer') || errorMessage.includes('incorrect')) {
        errorMessage = 'Incorrect answer. Please try again.'
      } else if (errorMessage.includes('Insufficient treasury') || errorMessage.includes('treasury')) {
        errorMessage = '❌ Game treasury is empty. The contract cannot pay rewards. The treasury needs to be funded with cUSD.'
      } else if (errorMessage.includes('Puzzle not initialized')) {
        errorMessage = 'Puzzle not initialized yet. Please check back later.'
      } else if (errorMessage.includes('revert') || errorMessage.includes('execution reverted')) {
        // Check if it's the treasury error specifically
        if (errorMessage.includes('Insufficient treasury funds')) {
          errorMessage = '❌ Transaction failed: Game treasury is empty. The contract needs cUSD to pay rewards.'
        } else {
          errorMessage = 'Transaction failed: Contract error occurred. Please try again or contact support.'
        }
      }
      
      toast.error(errorMessage)
      setMessage(errorMessage)
      setTimeout(() => setMessage(''), 5000)
      reset()
      
      // Reset game state on error
      setShowRewardModal(false)
      // Don't reset gameStatus to 'playing' - keep it as 'won' so user can try again
    }
  }, [error, reset])

  const handleSubmitGuess = useCallback(async () => {
    if (!isConnected || !address) {
      setMessage('Please connect your wallet')
      setTimeout(() => setMessage(''), 2000)
      return
    }

    if (!dailyWord) {
      setMessage('Daily word not available yet. Please try again in a moment.')
      setTimeout(() => setMessage(''), 2000)
      return
    }

    // STRICT CHECK: Contract state is source of truth - block if claimed
    const claimed = Boolean(hasClaimed)
    if (claimed) {
      setGameStatus('claimed')
      setMessage('You already claimed today\'s reward. Come back tomorrow!')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    // Also check if already played today (localStorage check)
    if (hasPlayedToday) {
      setMessage('You have already played today. Come back tomorrow!')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    if (!isInitialized) {
      setMessage('Puzzle not initialized yet')
      setTimeout(() => setMessage(''), 2000)
      return
    }

    if (currentGuess.length !== WORD_LENGTH) {
      setMessage('Word must be 5 letters')
      setTimeout(() => setMessage(''), 2000)
      return
    }

    if (!validateGuess(currentGuess)) {
      setMessage('Invalid word')
      setTimeout(() => setMessage(''), 2000)
      return
    }

    if (!dailyWord || dailyWord.length !== WORD_LENGTH) {
      setMessage('Daily word not configured')
      setTimeout(() => setMessage(''), 2000)
      return
    }

    // CRITICAL: Only allow play if puzzle is initialized on contract
    if (!isInitialized) {
      setMessage('Puzzle not initialized on contract. Please wait for initialization.')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    // Check guess locally for UI feedback
    const guessResult = checkGuess(currentGuess, dailyWord)
    const newTiles = [...tiles, guessResult]
    setTiles(newTiles)

    const newUsedLetters = getUsedLetters(newTiles)
    const newLetterStatuses = getLetterStatuses(newTiles)
    setUsedLetters(newUsedLetters)
    // Filter out 'empty' status to match state type
    const filteredStatuses = new Map<string, 'correct' | 'present' | 'absent'>()
    newLetterStatuses.forEach((status, letter) => {
      if (status !== 'empty') {
        filteredStatuses.set(letter, status)
      }
    })
    setLetterStatuses(filteredStatuses)

    // If game is won, submit to contract IMMEDIATELY
    if (isGameWon(newTiles)) {
      setGameStatus('won')
      // Don't mark as played yet - wait for successful on-chain claim
      
      // Ensure wallet is connected before submitting
      if (!isConnected || !address) {
        setMessage('Please connect your wallet to claim your reward')
        setTimeout(() => setMessage(''), 3000)
        // Reset game state so user can try again after connecting
        setGameStatus('playing')
        return
      }
      
      // Show reward modal
      setShowRewardModal(true)
      
      // Submit answer to contract IMMEDIATELY (this is the real transaction)
      // Note: This will prompt user to sign transaction in wallet
      submitAnswer(currentGuess).catch((err) => {
        console.error('Failed to initiate transaction:', err)
        // Error will be handled by the error useEffect
        // Reset game status so user can try again
        setGameStatus('playing')
        setShowRewardModal(false)
      })
      
      return
    }

    if (isGameLost(newTiles.length)) {
      setGameStatus('lost')
      // Mark as played locally for UI purposes (but contract state is still source of truth)
      markHasPlayed()
      return
    }

    setCurrentGuess('')
  }, [isConnected, address, hasClaimed, isInitialized, currentGuess, dailyWord, tiles, submitAnswer, rewardAmount, hasPlayedToday, markHasPlayed])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // STRICT: Block all input if claimed or not playing
      const claimed = Boolean(hasClaimed)
      if (gameStatus !== 'playing' || claimed) return

      const key = e.key.toUpperCase()
      
      if (/^[A-Z]$/.test(key)) {
        if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess(prev => prev + key)
        }
      } else if (key === 'BACKSPACE') {
        setCurrentGuess(prev => prev.slice(0, -1))
      } else if (key === 'ENTER') {
        handleSubmitGuess()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentGuess, gameStatus, handleSubmitGuess, hasClaimed])

  const handleLetterClick = (letter: string) => {
    // Block if claimed or not playing
    if (gameStatus !== 'playing' || Boolean(hasClaimed) || currentGuess.length >= WORD_LENGTH) return
    setCurrentGuess(prev => prev + letter)
  }

  const handleBackspace = () => {
    setCurrentGuess(prev => prev.slice(0, -1))
  }

  const handlePlayAgain = () => {
    setTiles([])
    setCurrentGuess('')
    setGameStatus('playing')
    setUsedLetters(new Set())
    setLetterStatuses(new Map())
    setMessage('')
  }

  // Show message if user already claimed
  if (!isClient) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Today's Challenge</h1>
          <p className="text-muted-foreground">Loading wallet status…</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Today's Challenge</h1>
          <p className="text-muted-foreground">Please connect your wallet to play</p>
        </div>
      </div>
    )
  }

  if (!isSupportedChain) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Today's Challenge</h1>
          <p className="text-muted-foreground">
            Unsupported network. Please switch to Celo Sepolia (or the network containing the EduWordle contract) in your wallet.
          </p>
        </div>
      </div>
    )
  }

  if (isPuzzleLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Today's Challenge</h1>
          <p className="text-muted-foreground">Checking puzzle status...</p>
        </div>
      </div>
    )
  }

  if (isDailyWordLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Today's Challenge</h1>
          <p className="text-muted-foreground">Loading daily word…</p>
        </div>
      </div>
    )
  }

  if (!dailyWord) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Today's Challenge</h1>
          <p className="text-muted-foreground mb-4">
            {dailyWordError
              ? dailyWordError
              : 'Unable to load today’s word file. Please refresh or contact the administrator.'}
          </p>
          <button
            onClick={refetchDailyWord}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Today's Challenge</h1>
          <p className="text-muted-foreground mb-4">
            {isStalePuzzle ? (
              <>
                Today's puzzle hasn't been published on-chain yet. The last puzzle was initialized{' '}
                <span className="font-semibold text-foreground">
                  {lastInitializedDisplay ?? 'recently'}
                </span>{' '}
                (UTC). The contract owner needs to push the new word before anyone can earn rewards.
              </>
            ) : (
              <>
                The contract has not been initialized yet. Once the owner sets the very first puzzle,
                this page will unlock automatically.
              </>
            )}
          </p>
          <div className="max-w-lg mx-auto border border-muted/40 bg-muted/10 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Puzzle status snapshot</p>
            <div className="flex flex-col gap-1 text-left">
              <span>
                Last initialized:{' '}
                <span className="text-foreground">
                  {lastInitializedDisplay ?? '—'}
                </span>
              </span>
              <span>
                Next reset window:{' '}
                <span className="text-foreground">
                  {nextResetDisplay ?? '00:00 UTC'}
                </span>
              </span>
            </div>
          </div>
        </div>
        <PuzzleAdminPanel
          isOwner={isOwner}
          initializePuzzle={initializePuzzle}
          isInitializing={isInitializingPuzzle}
          initError={initError}
          initSuccess={initSuccess}
          txHash={initTxHash}
          refetchPuzzle={refetchPuzzle}
          lastInitializedDate={lastInitializedDate}
          isStalePuzzle={isStalePuzzle}
          nextResetDisplay={nextResetDisplay}
        />
      </div>
    )
  }

  // STRICT CHECK: Block play if claimed OR if game status is claimed
  const claimed = Boolean(hasClaimed)
  if (gameStatus === 'claimed' || claimed) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Today's Challenge</h1>
          <p className="text-muted-foreground">You've already completed today's puzzle! Come back tomorrow.</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <GameBoard 
            tiles={tiles} 
            currentGuess=""
            wordLength={WORD_LENGTH}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Today's Challenge</h1>
        <p className="text-muted-foreground">Guess the word in 6 tries to earn cUSD</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {message && (
          <div className="text-center text-sm font-semibold text-accent animate-in fade-in">
            {message}
          </div>
        )}

        {isSubmitting && (
          <div className="text-center text-sm font-semibold text-primary animate-in fade-in">
            Submitting answer to blockchain...
          </div>
        )}

        <GameBoard 
          tiles={tiles} 
          currentGuess={currentGuess}
          wordLength={WORD_LENGTH}
        />

        {gameStatus === 'playing' && (
          <>
            <div className="text-center text-sm text-muted-foreground">
              Guesses remaining: {MAX_GUESSES - tiles.length}
            </div>
            <OnScreenKeyboard
              onLetterClick={handleLetterClick}
              onBackspace={handleBackspace}
              onSubmit={handleSubmitGuess}
              usedLetters={usedLetters}
              letterStatuses={letterStatuses}
              currentGuessLength={currentGuess.length}
              disabled={isSubmitting}
            />
          </>
        )}

        {/* Only show game status for lost games or after successful transaction */}
        {(gameStatus === 'lost' || (gameStatus === 'won' && isConfirmed)) && (
          <GameStatus
            status={gameStatus}
            word={dailyWord}
            guessCount={tiles.length}
            onPlayAgain={handlePlayAgain}
            canReplay={!hasPlayedToday && !isConfirmed}
          />
        )}
      </div>

      {showRewardModal && (
        <RewardClaimModal
          reward={parseFloat(rewardAmount || '0')}
          onClose={() => setShowRewardModal(false)}
          isSubmitting={isSubmitting}
          isConfirmed={isConfirmed}
          txHash={txHash || undefined}
        />
      )}
    </div>
  )
}

function PuzzleAdminPanel({
  isOwner,
  initializePuzzle,
  isInitializing,
  initError,
  initSuccess,
  txHash,
  refetchPuzzle,
  lastInitializedDate,
  isStalePuzzle,
  nextResetDisplay,
}: {
  isOwner: boolean
  initializePuzzle: (word: string) => Promise<void>
  isInitializing: boolean
  initError: Error | null | undefined
  initSuccess: boolean
  txHash?: `0x${string}` | null
  refetchPuzzle?: () => void
  lastInitializedDate?: Date | null
  isStalePuzzle?: boolean
  nextResetDisplay?: string | null
}) {
  const [word, setWord] = useState(process.env.NEXT_PUBLIC_DAILY_WORD || '')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const lastInitializedDisplay = useMemo(() => {
    if (!lastInitializedDate) return 'Never'
    return lastInitializedDate.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    })
  }, [lastInitializedDate])

  useEffect(() => {
    if (initSuccess) {
      setStatusMessage('Puzzle initialized successfully! Refreshing data…')
      refetchPuzzle?.()
    }
  }, [initSuccess, refetchPuzzle])

  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="p-4 border border-warning/30 bg-warning/10 rounded-lg text-sm text-warning-foreground">
          <p className="font-semibold mb-2">Puzzle not initialized</p>
          <p>
            Only the contract owner can initialize today&apos;s puzzle. Please run the deployment script or connect the owner
            wallet to set the daily word.
          </p>
        </div>
        <div className="p-4 border border-muted/40 bg-muted/10 rounded-lg text-xs text-muted-foreground space-y-2">
          <p>
            <span className="font-semibold text-foreground">Last puzzle on-chain:</span>{' '}
            {lastInitializedDisplay}
          </p>
          {isStalePuzzle && (
            <p className="text-warning-foreground">
              Stale data detected. A new word must be published before anyone can claim rewards.
            </p>
          )}
          {nextResetDisplay && (
            <p>
              <span className="font-semibold text-foreground">Next UTC reset:</span> {nextResetDisplay}
            </p>
          )}
        </div>
        <div className="p-4 border border-muted/40 bg-muted/10 rounded-lg text-xs text-muted-foreground space-y-2">
          <p className="font-semibold uppercase tracking-wide">How to initialize via scripts</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open `/apps/contracts/initialize-puzzle.js`</li>
            <li>Ensure `NEXT_PUBLIC_DAILY_WORD` matches the word you want on-chain</li>
            <li>Run <code className="px-1 bg-muted rounded">pnpm contracts:deploy</code> or the initialization script</li>
            <li>Refresh this page after the transaction confirms</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-6 border border-primary/20 rounded-xl bg-surface/60">
      <div>
        <p className="text-sm font-semibold text-primary mb-1">Admin quick fix</p>
        <p className="text-sm text-muted-foreground">
          You are the contract owner. Set today&apos;s puzzle word to reinitialize the game.
        </p>
      </div>

      <div className="grid gap-3 text-sm text-muted-foreground">
        <div className="p-3 border border-muted/40 rounded-lg bg-muted/10">
          <p className="text-xs uppercase tracking-wide mb-1">Last puzzle</p>
          <p className="text-foreground font-semibold">{lastInitializedDisplay}</p>
          {isStalePuzzle ? (
            <p className="text-warning-foreground text-xs mt-1">
              Stale puzzle detected — publish a new word to unblock players.
            </p>
          ) : (
            <p className="text-xs mt-1">Puzzle is synced for today.</p>
          )}
        </div>
        {nextResetDisplay && (
          <div className="p-3 border border-muted/40 rounded-lg bg-muted/10">
            <p className="text-xs uppercase tracking-wide mb-1">Next reset window (UTC)</p>
            <p className="text-foreground font-semibold">{nextResetDisplay}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase">Daily Word (5 letters)</label>
        <input
          type="text"
          value={word}
          maxLength={5}
          className="w-full h-11 px-3 rounded-lg border border-primary/30 bg-background text-lg tracking-widest uppercase"
          onChange={(e) => setWord(e.target.value.toUpperCase())}
          disabled={isInitializing}
        />
        <p className="text-xs text-muted-foreground">
          Must match the word used to generate the on-chain hash. Players will guess this word.
        </p>
      </div>

      <button
        onClick={async () => {
          setStatusMessage(null)
          try {
            await initializePuzzle(word)
            setStatusMessage('Transaction submitted…')
          } catch (error) {
            const err = error as Error
            setStatusMessage(err.message || 'Failed to initialize puzzle')
          }
        }}
        disabled={isInitializing || word.length !== 5}
        className="w-full h-11 rounded-lg bg-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isInitializing ? 'Initializing…' : 'Initialize Today’s Puzzle'}
      </button>

      {statusMessage && (
        <p className="text-xs text-muted-foreground text-center whitespace-pre-line">{statusMessage}</p>
      )}

      {initError && (
        <p className="text-xs text-error text-center">
          {initError.message || 'Transaction failed. Please check the console for details.'}
        </p>
      )}

      {txHash && (
        <p className="text-xs text-muted-foreground text-center">
          Tx: <span className="font-mono">{txHash.slice(0, 10)}…</span>
        </p>
      )}
    </div>
  )
}