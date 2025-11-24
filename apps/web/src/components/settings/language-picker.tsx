'use client'

import { useSettings } from '@/lib/settings-context'

export function LanguagePicker() {
  const { settings, updateSetting } = useSettings()

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ]

  return (
    <div>
      <label className="block text-sm font-semibold mb-4 text-foreground">Language Preference</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => updateSetting('language', lang.code)}
            className={`h-11 px-4 py-2 rounded-lg font-medium transition-all ${
              settings.language === lang.code
                ? 'bg-primary text-white'
                : 'bg-surface text-foreground hover:bg-surface/80 border border-primary/10'
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  )
}
