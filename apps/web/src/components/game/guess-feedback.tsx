interface GuessFeedbackProps {
  guess: string
  feedback: string[]
}

export function GuessFeedback({ guess, feedback }: GuessFeedbackProps) {
  const getLetterStatus = (index: number) => {
    const status = feedback[index]
    switch (status) {
      case 'correct':
        return { bg: 'bg-primary', label: 'Correct position' }
      case 'present':
        return { bg: 'bg-secondary', label: 'Wrong position' }
      default:
        return { bg: 'bg-surface', label: 'Not in word' }
    }
  }

  return (
    <div className="p-4 bg-surface rounded-lg card-elevation">
      <p className="text-sm font-semibold text-muted-foreground mb-3">Last Guess Feedback</p>
      <div className="flex gap-2 justify-center">
        {guess.split('').map((letter, idx) => {
          const status = getLetterStatus(idx)
          return (
            <div key={idx} className="text-center">
              <div className={`${status.bg} w-12 h-12 flex items-center justify-center rounded-lg font-bold text-white mb-2`}>
                {letter.toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground">{status.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
