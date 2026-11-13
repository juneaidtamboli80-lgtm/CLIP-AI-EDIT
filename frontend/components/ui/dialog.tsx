'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Dialog({
  open,
  onOpenChange,
  children,
  className,
  labelledBy,
  showClose = true,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
  labelledBy?: string
  showClose?: boolean
}) {
  const [mounted, setMounted] = React.useState(false)
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', onKeyDown)
    const timer = window.setTimeout(() => {
      const focusable = panelRef.current?.querySelector<HTMLElement>(
        'input, button:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])',
      )
      focusable?.focus()
    }, 40)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(timer)
    }
  }, [open, onOpenChange])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={cn(
              'relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-border/80 bg-card p-6 shadow-2xl sm:max-w-lg sm:rounded-3xl',
              className,
            )}
          >
            {showClose ? (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close dialog"
                className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
