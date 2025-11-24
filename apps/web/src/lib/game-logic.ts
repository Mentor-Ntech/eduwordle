// Constants for the game
export const WORD_LENGTH = 5
export const MAX_GUESSES = 6

export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty'

export interface TileState {
  letter: string
  status: LetterStatus
}

// Get daily word from environment variable
// Note: This is for UI feedback only. The contract stores the solution as a hash.
export function getDailyWord(): string {
  // Next.js automatically exposes NEXT_PUBLIC_* env vars to the browser
  const envWord = process.env.NEXT_PUBLIC_DAILY_WORD
  
  if (envWord && typeof envWord === 'string' && envWord.trim().length === 5) {
    return envWord.toUpperCase().trim()
  }
  
  // Return empty string if not set - components should handle this
  return ''
}

export function validateGuess(guess: string): boolean {
  return guess.length === WORD_LENGTH && /^[A-Z]+$/.test(guess)
}

export function checkGuess(guess: string, word: string): TileState[] {
  if (!word || word.length !== WORD_LENGTH) {
    // Return empty tiles if word is not set
    return Array(WORD_LENGTH).fill(null).map((_, idx) => ({
      letter: guess[idx] || '',
      status: 'empty' as LetterStatus
    }))
  }

  const wordLetters = word.split('')
  const guessLetters = guess.split('')
  const result: TileState[] = Array(WORD_LENGTH).fill(null).map((_, idx) => ({
    letter: guessLetters[idx],
    status: 'empty' as LetterStatus
  }))

  // Track which letters in the word have been "used" (matched to correct positions)
  const wordLetterCounts = new Map<string, number>()
  wordLetters.forEach(letter => {
    wordLetterCounts.set(letter, (wordLetterCounts.get(letter) || 0) + 1)
  })

  // First pass: mark correct letters and decrement counts
  guessLetters.forEach((letter, idx) => {
    if (letter === wordLetters[idx]) {
      result[idx] = { letter, status: 'correct' }
      wordLetterCounts.set(letter, (wordLetterCounts.get(letter) || 0) - 1)
    }
  })

  // Second pass: mark present and absent letters
  guessLetters.forEach((letter, idx) => {
    if (result[idx].status !== 'correct') {
      const remainingCount = wordLetterCounts.get(letter) || 0
      if (remainingCount > 0) {
        result[idx] = { letter, status: 'present' }
        wordLetterCounts.set(letter, remainingCount - 1)
      } else {
        result[idx] = { letter, status: 'absent' }
      }
    }
  })

  return result
}

export function isGameWon(tiles: TileState[][]): boolean {
  return tiles.some(row =>
    row.length === WORD_LENGTH && row.every(tile => tile.status === 'correct')
  )
}

export function isGameLost(guessCount: number): boolean {
  return guessCount >= MAX_GUESSES
}

export function getUsedLetters(tiles: TileState[][]): Set<string> {
  const used = new Set<string>()
  tiles.forEach(row => {
    row.forEach(tile => {
      if (tile.status !== 'empty') {
        used.add(tile.letter)
      }
    })
  })
  return used
}

// Get letter statuses for keyboard display
export function getLetterStatuses(tiles: TileState[][]): Map<string, LetterStatus> {
  const statuses = new Map<string, LetterStatus>()
  
  tiles.forEach(row => {
    row.forEach(tile => {
      if (tile.status !== 'empty') {
        const currentStatus = statuses.get(tile.letter)
        // Priority: correct > present > absent
        if (!currentStatus || 
            (currentStatus === 'absent' && tile.status !== 'absent') ||
            (currentStatus === 'present' && tile.status === 'correct')) {
          statuses.set(tile.letter, tile.status)
        }
      }
    })
  })
  
  return statuses
}
