import Image from 'next/image'
import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg'

const SIZE_MAP: Record<LogoSize, { width: number; height: number; text: string }> = {
  sm: { width: 68, height: 68, text: 'text-lg' },
  md: { width: 74, height: 74, text: 'text-xl' },
  lg: { width: 96, height: 96, text: 'text-3xl' },
}

interface EduWordleLogoProps {
  showWordmark?: boolean
  size?: LogoSize
  className?: string
  wordmarkClassName?: string
  priority?: boolean
}

export function EduWordleLogo({
  showWordmark = false,
  size = 'md',
  className,
  wordmarkClassName,
  priority = false,
}: EduWordleLogoProps) {
  const dimensions = SIZE_MAP[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="/logo.svg"
        alt="EduWordle logo"
        width={dimensions.width}
        height={dimensions.height}
        priority={priority}
        className="drop-shadow-sm"
        style={{ width: 'auto', height: 'auto' }}
      />
      {showWordmark && (
        <span
          className={cn(
            'font-black tracking-tight text-foreground',
            dimensions.text,
            wordmarkClassName
          )}
        >
          Edu<span className="text-primary">Wordle</span>
        </span>
      )}
    </div>
  )
}

