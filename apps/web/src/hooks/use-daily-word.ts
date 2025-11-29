'use client'

import { useCallback, useEffect, useState } from 'react'

interface DailyWordPayload {
  date?: string
  word?: string
  hash?: string
  updatedAt?: string
}

export function useDailyWord() {
  const [word, setWord] = useState('')
  const [date, setDate] = useState<string | undefined>(undefined)
  const [hash, setHash] = useState<string | undefined>(undefined)
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWord = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    // First, try to fetch from JSON file
    try {
      const response = await fetch(`/daily-word.json?ts=${Date.now()}`, {
        cache: 'no-store',
      })
      if (response.ok) {
        const payload: DailyWordPayload = await response.json()
        const nextWord = payload.word?.toUpperCase().trim() ?? ''
        if (nextWord) {
          setWord(nextWord)
          setDate(payload.date)
          setHash(payload.hash)
          setUpdatedAt(payload.updatedAt)
          setIsLoading(false)
          return
        }
      }
    } catch (err) {
      // Silently fail and try fallback
      console.debug('Daily word JSON not available, using fallback')
    }
    
    // Fallback to environment variable
    const envWord = process.env.NEXT_PUBLIC_DAILY_WORD?.toUpperCase().trim()
    if (envWord && envWord.length === 5) {
      setWord(envWord)
      setDate(new Date().toISOString().split('T')[0])
      setHash(undefined) // Hash not available from env
      setUpdatedAt(new Date().toISOString())
      setIsLoading(false)
      return
    }
    
    // If neither is available, it's not an error - just no word available
    // The contract is the source of truth anyway
    setWord('')
    setDate(undefined)
    setHash(undefined)
    setUpdatedAt(undefined)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchWord()
  }, [fetchWord])

  return {
    word,
    date,
    hash,
    updatedAt,
    isLoading,
    error,
    refetch: fetchWord,
  }
}

