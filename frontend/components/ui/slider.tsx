'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  label,
  className,
}: {
  value: number
  min?: number
  max?: number
  step?: number
  onValueChange: (value: number) => void
  label?: string
  className?: string
}) {
  const percent = ((value - min) / (max - min)) * 100
  return (
    <input
      type="range"
      aria-label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onValueChange(Number(event.target.value))}
      className={cn(
        'h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none transition-[background] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        '[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-primary',
        className,
      )}
      style={{
        background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--accent)) ${percent}%, hsl(var(--secondary)) ${percent}%, hsl(var(--secondary)) 100%)`,
      }}
    />
  )
}
