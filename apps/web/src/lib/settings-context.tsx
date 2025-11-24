'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface UserSettings {
  language: string
  notificationsEnabled: boolean
  emailNotifications: boolean
  soundEnabled: boolean
  theme: 'light' | 'dark'
}

interface SettingsContextType {
  settings: UserSettings
  updateSetting: (key: keyof UserSettings, value: any) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const DEFAULT_SETTINGS: UserSettings = {
  language: 'en',
  notificationsEnabled: true,
  emailNotifications: true,
  soundEnabled: true,
  theme: 'light'
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('eduwordle_settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem('eduwordle_settings', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
