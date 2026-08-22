import { cn } from '@/lib/utils'

export function ScribeLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
          <path d="M6 11a6 6 0 0 0 12 0" />
          <path d="M12 17v4" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight">Scribe</span>
    </div>
  )
}
