export function GuessHistory() {
  const guesses = ['PLANT', 'TRAIN', 'BRAIN']

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-muted-foreground">Guess History</p>
      {guesses.map((guess, i) => (
        <div key={i} className="text-sm text-foreground opacity-75">
          {i + 1}. {guess}
        </div>
      ))}
    </div>
  )
}
