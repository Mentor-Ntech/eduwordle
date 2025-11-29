'use client'

interface GameStatusProps {
  status: 'won' | 'lost'
  word: string
  guessCount: number
  onPlayAgain?: () => void
  canReplay?: boolean
}

export function GameStatus({ status, word, guessCount, onPlayAgain, canReplay = true }: GameStatusProps) {
  const isWon = status === 'won'
  const showReplayButton = canReplay && typeof onPlayAgain === 'function'

  return (
    <div className="card-elevation p-8 rounded-lg bg-surface text-center space-y-6">
      <div>
        <p className="text-5xl mb-4">{isWon ? '🎉' : '😢'}</p>
        <h2 className="text-3xl font-bold mb-2 text-foreground">
          {isWon ? 'You Won!' : 'Game Over'}
        </h2>
        <p className="text-lg text-muted-foreground">
          {isWon 
            ? `Great job! You guessed it in ${guessCount} ${guessCount === 1 ? 'try' : 'tries'}.`
            : word 
              ? `The word was: `
              : `Better luck next time!`}
          {!isWon && word && <span className="font-bold text-foreground">{word}</span>}
        </p>
      </div>

      {/* Reward info is shown in the RewardClaimModal, not here */}

      {showReplayButton ? (
        <button
          onClick={onPlayAgain}
          className="w-full h-11 px-6 bg-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all"
        >
          {isWon ? 'Play Tomorrow' : 'Try Again'}
        </button>
      ) : (
        <div className="text-sm text-muted-foreground">
          Come back tomorrow for a new puzzle.
        </div>
      )}
    </div>
  )
}
