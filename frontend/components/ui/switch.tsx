'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  label,
  id,
  className,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  id?: string
  className?: string
}) {
  const generatedId = React.useId()
  const switchId = id ?? generatedId
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40',
          checked ? 'bg-brand-gradient' : 'bg-secondary ring-1 ring-border',
        )}
      >
        <span
          className={cn(
            'pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked ? 'translate-x-[18px]' : 'translate-x-[3px]',
          )}
        />
      </button>
      {label ? (
        <label htmlFor={switchId} className="cursor-pointer text-xs text-muted-foreground">
          {label}
        </label>
      ) : null}
    </span>
  )
}
