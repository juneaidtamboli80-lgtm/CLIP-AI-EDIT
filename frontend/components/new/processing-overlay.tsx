'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Download, Loader2, Sparkles, Subtitles, Scissors, ArrowRight, X } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { processingSteps } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const stepMeta = {
  download: { icon: Download, duration: 1800 },
  transcribe: { icon: Subtitles, duration: 3200 },
  highlights: { icon: Sparkles, duration: 2600 },
  render: { icon: Scissors, duration: 2400 },
} as const

const totalDuration = Object.values(stepMeta).reduce((sum, step) => sum + step.duration, 0)

export function ProcessingOverlay({
  open,
  onOpenChange,
  projectTitle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectTitle: string
}) {
  const router = useRouter()
  const [elapsed, setElapsed] = React.useState(0)
  const [running, setRunning] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setElapsed(0)
      setRunning(false)
      return
    }
    setElapsed(0)
    setRunning(true)
    const started = Date.now()
    const timer = window.setInterval(() => {
      const next = Date.now() - started
      setElapsed(next)
      if (next >= totalDuration) {
        window.clearInterval(timer)
        setRunning(false)
      }
    }, 100)
    return () => window.clearInterval(timer)
  }, [open])

  const percent = Math.min(100, Math.round((elapsed / totalDuration) * 100))

  let cumulative = 0
  const steps = processingSteps.map((step) => {
    const meta = stepMeta[step.id]
    const start = cumulative
    cumulative += meta.duration
    const done = elapsed >= cumulative
    const active = elapsed >= start && !done
    return { ...step, ...meta, start, done, active }
  })

  const activeStep = steps.find((step) => step.active) ?? steps[steps.length - 1]
  const complete = !running && percent >= 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange} showClose={false} className="sm:max-w-md" labelledBy="processing-title">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
          <Sparkles className="h-2.5 w-2.5" /> Demo pipeline
        </span>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <h2 id="processing-title" className="mt-3 text-lg font-semibold tracking-tight">
        {complete ? 'Your clips are ready' : 'Forging your clips'}
      </h2>
      <p className="mt-1 truncate text-xs text-muted-foreground">{projectTitle}</p>

      <div className="mt-4 flex items-center justify-between text-[10px]">
        <span className="font-medium">{complete ? 'Complete' : activeStep.label}</span>
        <span className="tabular-nums text-muted-foreground">{percent}%</span>
      </div>
      <Progress value={percent} className="mt-1.5" label="Processing progress" />

      <div className="mt-5 space-y-1">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                step.active && 'border-primary/25 bg-primary/[0.06]',
                step.done && 'border-transparent',
                !step.active && !step.done && 'border-transparent opacity-50',
              )}
            >
              <span
                className={cn(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-lg border',
                  step.done && 'border-success/25 bg-success/10 text-success',
                  step.active && 'border-primary/30 bg-primary/15 text-primary',
                  !step.done && !step.active && 'border-border bg-secondary/50 text-muted-foreground',
                )}
              >
                {step.done ? <Check className="h-3.5 w-3.5" /> : step.active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">{step.label}</p>
                <p className="text-[10px] text-muted-foreground">{step.description}</p>
              </div>
              {step.done ? <span className="text-[9px] text-success">Done</span> : null}
              {step.active ? (
                <span className="text-[9px] text-primary">
                  {Math.max(0, Math.round(((step.start + step.duration - elapsed) / 1000) * 10) / 10)}s
                </span>
              ) : null}
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {complete ? (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <div className="rounded-xl border border-success/25 bg-success/[0.07] p-3 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">7 clips</span> found in the demo project. Scores range from 76 to 94.
            </div>
            <Button
              className="mt-3 w-full"
              onClick={() => {
                onOpenChange(false)
                router.push('/projects/demo-podcast')
              }}
            >
              Open project <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.p key="note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
            This is a UI preview running on sample data. The real yt-dlp → Whisper → LLM → FFmpeg pipeline is wired up in the next phases.
          </motion.p>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
