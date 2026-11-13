'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  CircleDot,
  Download,
  Loader2,
  Plus,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { recentActivity } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const pipelineSteps = [
  { label: 'Download', done: true },
  { label: 'Transcribe', done: true },
  { label: 'Highlights', done: false },
  { label: 'Render', done: false },
]

const activityIcons = {
  render: Download,
  transcribe: Wand2,
  brand: Sparkles,
  download: Download,
}

export function PipelineCard() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-3"
    >
      <div className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-soft backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Live pipeline</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-warning/10 px-2 py-0.5 text-[9px] font-semibold text-warning">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warning" />
            </span>
            1 active
          </span>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">Behind The Scenes — Studio Tour</p>

        <div className="mt-3.5">
          <div className="mb-1.5 flex items-center justify-between text-[10px]">
            <span className="font-medium text-foreground">Transcribing audio</span>
            <span className="tabular-nums text-muted-foreground">62%</span>
          </div>
          <Progress value={62} label="Pipeline progress" />
        </div>

        <div className="mt-4 space-y-2">
          {pipelineSteps.map((step, index) => {
            const isActive = index === 2
            return (
              <div key={step.label} className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'grid h-5 w-5 place-items-center rounded-full border text-[9px]',
                    step.done && 'border-success/30 bg-success/15 text-success',
                    isActive && 'border-warning/40 bg-warning/15 text-warning',
                    !step.done && !isActive && 'border-border bg-secondary/60 text-muted-foreground',
                  )}
                >
                  {step.done ? <Check className="h-2.5 w-2.5" /> : isActive ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <CircleDot className="h-2.5 w-2.5" />}
                </span>
                <span className={cn('text-[11px]', isActive ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                  {step.label}
                </span>
                {isActive ? <span className="ml-auto text-[9px] text-warning">~2 min left</span> : null}
              </div>
            )
          })}
        </div>

        <Link href="/projects/demo-processing">
          <Button variant="outline" size="sm" className="mt-4 w-full">
            View live job <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-soft backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent activity</h2>
          <button type="button" className="text-[10px] text-muted-foreground hover:text-foreground">
            View all
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {recentActivity.map((item) => {
            const Icon = activityIcons[item.type as keyof typeof activityIcons] ?? Sparkles
            return (
              <div key={item.id} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                  <Icon className="h-3 w-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium">{item.label}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{item.project}</p>
                </div>
                <span className="shrink-0 text-[9px] text-muted-foreground">{item.time}</span>
              </div>
            )
          })}
        </div>
        <Link href="/new">
          <Button size="sm" className="mt-4 w-full">
            <Plus className="h-3.5 w-3.5" /> New project
          </Button>
        </Link>
      </div>
    </motion.aside>
  )
}
