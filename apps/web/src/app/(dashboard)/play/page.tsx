'use client'

import { useState, useEffect, useCallback } from 'react'
import { GameBoard } from '@/components/game/game-board'
import { OnScreenKeyboard } from '@/components/game/on-screen-keyboard'
import { GameStatus } from '@/components/game/game-status'
import { RewardClaimModal } from '@/components/modals/reward-claim-modal'
import { 
  WORD_LENGTH, 
  MAX_GUESSES, 
  TileState, 
  getDailyWord,
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
import { toast } from 'sonner'

export default function PlayPage() {
  const { address, isConnected } = useAccount()
  const { addWin, refetch: refetchUserStats } = useUserStats()
  const { hasClaimed, rewardAmount, refetch: refetchContractStats } = useContractUserStats()
  const { submitAnswer, isSubmitting, isConfirmed, error, txHash, reset } = useSubmitAnswer()
  const { isInitialized } = useDailyPuzzle()
  
  const [tiles, setTiles] = useState<TileState[][]>([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'claimed'>('playing')
  const [usedLetters, setUsedLetters] = useState<Set<string>>(new Set())
  const [letterStatuses, setLetterStatuses] = useState<Map<string, 'correct' | 'present' | 'absent'>>(new Map())
  const [message, setMessage] = useState('')
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [dailyWord] = useState(getDailyWord())
  
  // Check if user already claimed today
  useEffect(() => {
    if (hasClaimed && isConnected) {
      setGameStatus('claimed')
    }
  }, [hasClaimed, isConnected])

  // Handle successful contract submission
  useEffect(() => {
    if (isConfirmed && txHash) {
      toast.success('Reward claimed successfully!')
      
      // Update local stats after successful transaction
      const reward = parseFloat(rewardAmount || '0')
      if (reward > 0) {
        addWin(reward)
      }
      
      // Refetch contract stats to get updated data
      refetchUserStats()
      refetchContractStats()
      
      // Close modal after a short delay
      setTimeout(() => {
        setShowRewardModal(false)
        reset()
      }, 2000)
    }
  }, [isConfirmed, txHash, rewardAmount, addWin, refetchUserStats, refetchContractStats, reset])

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

    if (hasClaimed) {
      setMessage('You already claimed today\'s reward')
      setTimeout(() => setMessage(''), 2000)
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

    // Check guess locally for UI feedback
    const guessResult = checkGuess(currentGuess, dailyWord)
    const newTiles = [...tiles, guessResult]
    setTiles(newTiles)

    const newUsedLetters = getUsedLetters(newTiles)
    const newLetterStatuses = getLetterStatuses(newTiles)
    setUsedLetters(newUsedLetters)
    setLetterStatuses(newLetterStatuses)

    // If game is won, submit to contract
    if (isGameWon(newTiles)) {
      setGameStatus('won')
      
      // Ensure wallet is connected before submitting
      if (!isConnected || !address) {
        setMessage('Please connect your wallet to claim your reward')
        setTimeout(() => setMessage(''), 3000)
        return
      }
      
      // Show reward modal first
      setShowRewardModal(true)
      
      // Submit answer to contract (non-blocking - wallet will prompt user)
      // Note: writeContract triggers wallet prompt, errors come through error state
      submitAnswer(currentGuess).catch((err) => {
        console.error('Failed to initiate transaction:', err)
        // Error will be handled by the error useEffect
        // Keep modal open so user can see what happened
      })
      
      return
    }

    if (isGameLost(newTiles.length)) {
      setGameStatus('lost')
      return
    }

    setCurrentGuess('')
  }, [isConnected, address, hasClaimed, isInitialized, currentGuess, dailyWord, tiles, submitAnswer, rewardAmount, addWin])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return

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
  }, [currentGuess, gameStatus, handleSubmitGuess])

  const handleLetterClick = (letter: string) => {
    if (gameStatus !== 'playing' || currentGuess.length >= WORD_LENGTH) return
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

  if (!isInitialized) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Today's Challenge</h1>
          <p className="text-muted-foreground">Puzzle not initialized yet. Please check back later.</p>
        </div>
      </div>
    )
  }

  if (gameStatus === 'claimed') {
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

        {(gameStatus === 'won' || gameStatus === 'lost') && (
          <GameStatus
            status={gameStatus}
            word={dailyWord}
            guessCount={tiles.length}
            onPlayAgain={handlePlayAgain}
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
