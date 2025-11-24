'use client'

import { useSettings } from '@/lib/settings-context'

export function NotificationToggle() {
  const { settings, updateSetting } = useSettings()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-3">
        <div>
          <label className="text-foreground font-medium cursor-pointer">In-App Notifications</label>
          <p className="text-xs text-muted-foreground mt-1">Get notified about game results and streaks</p>
        </div>
        <button
          onClick={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
          className={`h-7 w-12 rounded-full transition-all ${
            settings.notificationsEnabled ? 'bg-primary' : 'bg-surface'
          } relative`}
        >
          <span
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
              settings.notificationsEnabled ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-primary/10">
        <div>
          <label className="text-foreground font-medium cursor-pointer">Email Notifications</label>
          <p className="text-xs text-muted-foreground mt-1">Get daily email summaries</p>
        </div>
        <button
          onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
          className={`h-7 w-12 rounded-full transition-all ${
            settings.emailNotifications ? 'bg-primary' : 'bg-surface'
          } relative`}
        >
          <span
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
              settings.emailNotifications ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-primary/10">
        <div>
          <label className="text-foreground font-medium cursor-pointer">Sound Effects</label>
          <p className="text-xs text-muted-foreground mt-1">Enable game sounds</p>
        </div>
        <button
          onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
          className={`h-7 w-12 rounded-full transition-all ${
            settings.soundEnabled ? 'bg-primary' : 'bg-surface'
          } relative`}
        >
          <span
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
              settings.soundEnabled ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>
    </div>
  )
}
