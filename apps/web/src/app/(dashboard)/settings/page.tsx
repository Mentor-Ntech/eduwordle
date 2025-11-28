'use client'

import { SettingsSection } from '@/components/settings/settings-section'
import { NotificationToggle } from '@/components/settings/notification-toggle'
import { LanguagePicker } from '@/components/settings/language-picker'
import { MiniPayStatusCard } from '@/components/settings/minipay-status-card'
import { useWallet } from '@/lib/wallet-context'
import { useSettings } from '@/lib/settings-context'
import { useTranslations } from '@/lib/use-translations'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { useUserStats as useContractUserStats } from '@/hooks/use-user-stats'
import { useAccount } from 'wagmi'

export default function SettingsPage() {
  const { walletAddress, disconnectWallet, balance } = useWallet()
  const { settings } = useSettings()
  const { t } = useTranslations()
  const { address } = useAccount()
  const { currentUserStats } = useLeaderboard(1) // Just need current user stats
  const contractStats = useContractUserStats()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <MiniPayStatusCard />

      {/* User Stats Section - Real On-Chain Data */}
      {address && (
        <SettingsSection title={t('settings.stats.title')}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface/50 rounded-lg p-4 border border-primary/10 hover:border-primary/30 transition-colors">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {t('settings.stats.totalWins')}
              </p>
              {contractStats.isLoading ? (
                <p className="text-2xl font-bold text-primary animate-pulse">...</p>
              ) : (
                <p className="text-2xl font-bold text-primary">
                  {currentUserStats?.totalWins ?? 0}
                </p>
              )}
            </div>
            
            <div className="bg-surface/50 rounded-lg p-4 border border-primary/10 hover:border-primary/30 transition-colors">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {t('settings.stats.currentStreak')}
              </p>
              {contractStats.isLoading ? (
                <p className="text-2xl font-bold text-primary animate-pulse">...</p>
              ) : (
                <p className="text-2xl font-bold text-primary">
                  {currentUserStats?.currentStreak ?? contractStats.streak ?? 0}
                </p>
              )}
            </div>
            
            <div className="bg-surface/50 rounded-lg p-4 border border-primary/10 hover:border-primary/30 transition-colors">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {t('settings.stats.longestStreak')}
              </p>
              {contractStats.isLoading ? (
                <p className="text-2xl font-bold text-primary animate-pulse">...</p>
              ) : (
                <p className="text-2xl font-bold text-primary">
                  {currentUserStats?.longestStreak ?? contractStats.streak ?? 0}
                </p>
              )}
            </div>
            
            <div className="bg-surface/50 rounded-lg p-4 border border-primary/10 hover:border-primary/30 transition-colors">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {t('settings.stats.totalEarnings')}
              </p>
              {contractStats.isLoading ? (
                <p className="text-2xl font-bold text-primary animate-pulse">...</p>
              ) : (
                <p className="text-2xl font-bold text-primary">
                  {currentUserStats?.totalRewardsEarned 
                    ? `${parseFloat(currentUserStats.totalRewardsEarned).toFixed(2)} cUSD`
                    : contractStats.rewardAmount 
                      ? `${contractStats.rewardAmount} cUSD`
                      : '0.00 cUSD'}
                </p>
              )}
            </div>
          </div>
        </SettingsSection>
      )}

      <SettingsSection title={t('settings.language.title')}>
        <LanguagePicker />
      </SettingsSection>

      <SettingsSection title={t('settings.notifications.title')}>
        <NotificationToggle />
      </SettingsSection>

      <SettingsSection title={t('settings.account.title')}>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-foreground">{t('settings.account.walletConnection')}</p>
              <p className="text-sm text-muted-foreground">{t('settings.account.walletConnectionDesc')}</p>
            </div>
            <span className="text-success font-medium">{t('settings.account.connected')}</span>
          </div>

          {walletAddress && (
            <div className="bg-surface/50 rounded-lg p-4 border border-primary/10">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                {t('settings.account.walletAddress')}
              </p>
              <p className="font-mono text-sm text-foreground break-all">{walletAddress}</p>
            </div>
          )}

          <button
            onClick={disconnectWallet}
            className="w-full h-11 px-4 py-2 rounded-lg bg-error/10 text-error font-semibold hover:bg-error/20 transition-colors mt-4"
          >
            {t('settings.account.disconnectWallet')}
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title={t('settings.about.title')}>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>{t('settings.about.version')}</p>
          <p>{t('settings.about.description')}</p>
          <div className="flex gap-4 pt-4">
            <a href="#" className="text-primary hover:underline">{t('settings.about.privacyPolicy')}</a>
            <a href="#" className="text-primary hover:underline">{t('settings.about.termsOfService')}</a>
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}
