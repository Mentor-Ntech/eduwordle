'use client'

import { SettingsSection } from '@/components/settings/settings-section'
import { NotificationToggle } from '@/components/settings/notification-toggle'
import { LanguagePicker } from '@/components/settings/language-picker'
import { MiniPayStatusCard } from '@/components/settings/minipay-status-card'
import { useWallet } from '@/lib/wallet-context'
import { useSettings } from '@/lib/settings-context'

export default function SettingsPage() {
  const { walletAddress, disconnectWallet } = useWallet()
  const { settings } = useSettings()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and account</p>
      </div>

      <MiniPayStatusCard />

      <SettingsSection title="Language & Localization">
        <LanguagePicker />
      </SettingsSection>

      <SettingsSection title="Notifications">
        <NotificationToggle />
      </SettingsSection>

      <SettingsSection title="Account">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-foreground">Wallet Connection</p>
              <p className="text-sm text-muted-foreground">Current status and address</p>
            </div>
            <span className="text-success font-medium">Connected</span>
          </div>

          {walletAddress && (
            <div className="bg-surface/50 rounded-lg p-4 border border-primary/10">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Wallet Address
              </p>
              <p className="font-mono text-sm text-foreground break-all">{walletAddress}</p>
            </div>
          )}

          <button
            onClick={disconnectWallet}
            className="w-full h-11 px-4 py-2 rounded-lg bg-error/10 text-error font-semibold hover:bg-error/20 transition-colors mt-4"
          >
            Disconnect Wallet
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="About">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>EduWordle v1.0.0</p>
          <p>Built on Celo blockchain for transparent, instant rewards</p>
          <div className="flex gap-4 pt-4">
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}
