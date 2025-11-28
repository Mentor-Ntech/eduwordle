'use client'

import { useEffect } from 'react'
import { useSettings } from '@/lib/settings-context'

export function LangAttribute() {
  const { settings } = useSettings()

  useEffect(() => {
    // Update HTML lang attribute based on language setting
    document.documentElement.lang = settings.language || 'en'
  }, [settings.language])

  return null
}


