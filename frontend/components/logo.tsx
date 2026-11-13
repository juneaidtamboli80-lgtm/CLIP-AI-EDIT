import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-gradient shadow-glow-sm',
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.45),transparent_55%)]" />
      <svg viewBox="0 0 24 24" className="relative h-5 w-5 text-white" fill="none">
        <path
          d="M8.4 5.6 16.2 12l-7.8 6.4V5.6Z"
          fill="currentColor"
          fillOpacity=".95"
        />
        <path d="M17.6 5.4v13.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      {!compact ? (
        <div className="leading-none">
          <span className="text-[17px] font-bold tracking-tight">
            Clip<span className="gradient-text">Forge</span>
          </span>
          <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            AI Video Studio
          </span>
        </div>
      ) : null}
    </div>
  )
}
