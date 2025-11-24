'use client'

import { TileState } from '@/lib/game-logic'

interface GameBoardProps {
  tiles: TileState[][]
  currentGuess: string
  wordLength: number
}

export function GameBoard({ tiles, currentGuess, wordLength }: GameBoardProps) {
  const MAX_GUESSES = 6

  const getTileClass = (tile: TileState | null | undefined, isEmpty: boolean): string => {
    if (!tile || isEmpty) {
      return 'bg-surface border-2 border-foreground/10'
    }

    switch (tile.status) {
      case 'correct':
        return 'bg-success text-white border-2 border-success'
      case 'present':
        return 'bg-warning text-foreground border-2 border-warning'
      case 'absent':
        return 'bg-foreground/20 text-foreground/50 border-2 border-foreground/20'
      default:
        return 'bg-surface border-2 border-foreground/10'
    }
  }

  return (
    <div className="flex flex-col gap-3 justify-center items-center py-8">
      {Array.from({ length: MAX_GUESSES }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-2">
          {Array.from({ length: wordLength }).map((_, colIdx) => {
            const tileRow = tiles[rowIdx]
            const tile = tileRow?.[colIdx] || null
            const isCurrentRow = rowIdx === tiles.length
            const isEmpty = !tile || tile.status === 'empty'
            
            let letter = ''
            if (tile && tile.letter) {
              letter = tile.letter
            } else if (isCurrentRow && currentGuess) {
              letter = currentGuess[colIdx] || ''
            }

            return (
              <div
                key={colIdx}
                className={`
                  w-14 h-14 md:w-16 md:h-16 flex items-center justify-center
                  font-bold text-xl md:text-2xl rounded-lg
                  tile-flip transition-all duration-200
                  ${getTileClass(tile, isEmpty)}
                  ${letter && !isEmpty ? 'scale-100' : 'scale-95'}
                `}
              >
                {letter}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
