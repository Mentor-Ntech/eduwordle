'use client'

import { useMemo } from 'react'
import { useSettings } from './settings-context'
import enMessages from './messages/en.json'
import esMessages from './messages/es.json'
import frMessages from './messages/fr.json'
import deMessages from './messages/de.json'
import ptMessages from './messages/pt.json'

type Messages = typeof enMessages

const messages: Record<string, Messages> = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  de: deMessages,
  pt: ptMessages,
}

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

type TranslationKey = NestedKeyOf<Messages>

export function useTranslations() {
  const { settings } = useSettings()
  const locale = settings.language || 'en'

  const t = useMemo(() => {
    const currentMessages = messages[locale] || messages.en

    return (key: TranslationKey): string => {
      const keys = key.split('.') as (keyof Messages)[]
      let value: any = currentMessages

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k as keyof typeof value]
        } else {
          // Fallback to English if key not found
          let fallbackValue: any = messages.en
          for (const fallbackKey of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && fallbackKey in fallbackValue) {
              fallbackValue = fallbackValue[fallbackKey as keyof typeof fallbackValue]
            } else {
              return key // Return key if not found even in fallback
            }
          }
          return typeof fallbackValue === 'string' ? fallbackValue : key
        }
      }

      return typeof value === 'string' ? value : key
    }
  }, [locale])

  return { t, locale }
}


