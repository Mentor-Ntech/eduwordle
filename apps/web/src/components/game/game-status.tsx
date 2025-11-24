'use client'

interface GameStatusProps {
  status: 'won' | 'lost'
  word: string
  guessCount: number
  onPlayAgain: () => void
}

export function GameStatus({ status, word, guessCount, onPlayAgain }: GameStatusProps) {
  const isWon = status === 'won'

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
            : `The word was: `}
          {!isWon && <span className="font-bold text-foreground">{word}</span>}
        </p>
      </div>

      {isWon && (
        <div className="bg-primary/10 rounded-lg p-4">
          <p className="text-2xl font-bold text-primary">+50 cUSD</p>
          <p className="text-sm text-muted-foreground">Added to your wallet</p>
        </div>
      )}

      <button
        onClick={onPlayAgain}
        className="w-full h-11 px-6 bg-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all"
      >
        {isWon ? 'Play Tomorrow' : 'Try Again'}
      </button>
    </div>
  )
}
