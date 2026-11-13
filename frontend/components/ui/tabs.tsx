'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type TabsContextValue = {
  value: string
  setValue: (value: string) => void
  baseId: string
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabs() {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('Tabs components must be used within <Tabs>')
  return context
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? '')
  const baseId = React.useId()
  const value = controlledValue ?? uncontrolled
  const setValue = React.useCallback(
    (next: string) => {
      if (controlledValue === undefined) setUncontrolled(next)
      onValueChange?.(next)
    },
    [controlledValue, onValueChange],
  )

  return (
    <TabsContext.Provider value={{ value, setValue, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  children,
  className,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode
  className?: string
  'aria-label'?: string
}) {
  const listRef = React.useRef<HTMLDivElement>(null)

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') ?? [],
    )
    if (!tabs.length) return
    event.preventDefault()
    const activeIndex = tabs.findIndex((tab) => tab === document.activeElement)
    let nextIndex = activeIndex
    if (event.key === 'ArrowRight') nextIndex = (activeIndex + 1) % tabs.length
    if (event.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1
    tabs[nextIndex]?.focus()
    tabs[nextIndex]?.click()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-border/60 bg-secondary/60 p-1',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  children,
  className,
  disabled,
}: {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) {
  const { value: active, setValue, baseId } = useTabs()
  const selected = active === value
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => setValue(value)}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:text-foreground disabled:opacity-40',
        selected && 'bg-card text-foreground shadow-sm ring-1 ring-border/70',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { value: active, baseId } = useTabs()
  if (active !== value) return null
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      className={className}
    >
      {children}
    </div>
  )
}
