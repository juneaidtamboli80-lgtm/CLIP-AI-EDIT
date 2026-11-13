import { cn } from '@/lib/utils'

export function Progress({
  value,
  className,
  barClassName,
  label,
}: {
  value: number
  className?: string
  barClassName?: string
  label?: string
}) {
  const safe = Math.max(0, Math.min(100, value))
  return (
    <div
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-secondary', className)}
      role="progressbar"
      aria-valuenow={Math.round(safe)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn('h-full rounded-full bg-brand-gradient transition-[width] duration-500', barClassName)}
        style={{ width: `${safe}%` }}
      />
    </div>
  )
}
