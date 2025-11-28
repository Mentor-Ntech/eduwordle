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
    try {
      const response = await fetch(`/daily-word.json?ts=${Date.now()}`, {
        cache: 'no-store',
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch daily word (status ${response.status})`)
      }
      const payload: DailyWordPayload = await response.json()
      const nextWord = payload.word?.toUpperCase().trim() ?? ''
      if (!nextWord) {
        throw new Error('Daily word payload is missing the word field')
      }
      setWord(nextWord)
      setDate(payload.date)
      setHash(payload.hash)
      setUpdatedAt(payload.updatedAt)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load daily word'
      setError(message)
      setWord('')
      setDate(undefined)
      setHash(undefined)
      setUpdatedAt(undefined)
    } finally {
      setIsLoading(false)
    }
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

