'use client'

interface OnScreenKeyboardProps {
  onLetterClick: (letter: string) => void
  onBackspace: () => void
  onSubmit: () => void
  usedLetters: Set<string>
  letterStatuses?: Map<string, 'correct' | 'present' | 'absent'>
  currentGuessLength: number
  disabled?: boolean
}

export function OnScreenKeyboard({ 
  onLetterClick, 
  onBackspace, 
  onSubmit,
  usedLetters,
  letterStatuses = new Map(),
  currentGuessLength,
  disabled = false
}: OnScreenKeyboardProps) {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ]

  const getButtonStyle = (letter: string) => {
    const status = letterStatuses.get(letter)
    
    if (status === 'correct') {
      return 'bg-success text-white hover:bg-success/90 active:scale-95'
    } else if (status === 'present') {
      return 'bg-warning text-foreground hover:bg-warning/90 active:scale-95'
    } else if (status === 'absent') {
      return 'opacity-40 bg-foreground/10 text-foreground/50'
    }
    
    return 'bg-surface hover:bg-primary/20 active:scale-95'
  }

  return (
    <div className="space-y-2 select-none">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-1 justify-center flex-wrap px-2">
          {row.map(letter => (
            <button
              key={letter}
              onClick={() => onLetterClick(letter)}
              disabled={disabled || (letterStatuses.get(letter) === 'absent')}
              className={`h-11 flex-1 min-w-8 py-2 px-1 text-sm font-bold rounded-md card-elevation transition-all ${getButtonStyle(letter)}`}
            >
              {letter}
            </button>
          ))}
          
          {rowIdx === 2 && (
            <>
              <button
                onClick={onBackspace}
                className="h-11 flex-1 min-w-12 py-2 px-2 text-xs font-bold rounded-md card-elevation bg-surface hover:bg-error/20 transition-all active:scale-95"
              >
                DEL
              </button>
              <button
                onClick={onSubmit}
                disabled={currentGuessLength < 5}
                className="h-11 flex-1 min-w-12 py-2 px-2 text-xs font-bold rounded-md card-elevation bg-primary text-white hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-50"
              >
                ENTER
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
