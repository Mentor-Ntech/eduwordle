interface SettingsSectionProps {
  title: string
  children: React.ReactNode
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>
      <div className="bg-surface rounded-lg p-6 card-elevation">
        {children}
      </div>
    </div>
  )
}
