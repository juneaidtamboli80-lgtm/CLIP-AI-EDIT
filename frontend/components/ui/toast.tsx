'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info'
type Toast = { id: string; title: string; description?: string; variant: ToastVariant }

type ToastContextValue = {
  toast: (input: { title: string; description?: string; variant?: ToastVariant }) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const tones: Record<ToastVariant, string> = {
  success: 'text-success',
  error: 'text-destructive',
  info: 'text-accent',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = React.useCallback<ToastContextValue['toast']>(
    ({ title, description, variant = 'info' }) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((current) => [...current.slice(-2), { id, title, description, variant }])
      window.setTimeout(() => dismiss(id), 4500)
    },
    [dismiss],
  )

  const value = React.useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-[min(92vw,380px)] flex-col gap-2"
      >
        <AnimatePresence>
          {toasts.map((item) => {
            const Icon = icons[item.variant]
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-border/80 bg-card/95 p-3.5 shadow-soft backdrop-blur-xl"
              >
                <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', tones[item.variant])} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{item.title}</p>
                  {item.description ? (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  aria-label="Dismiss notification"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
