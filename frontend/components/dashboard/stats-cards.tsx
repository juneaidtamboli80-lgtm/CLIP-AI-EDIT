'use client'

import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, Clapperboard, Flame, Sparkles, Video, Zap } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { dashboardStats } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const sparkPaths = [
  'M0 28 L12 22 L24 25 L36 15 L48 18 L60 10 L72 12 L84 5',
  'M0 26 L12 24 L24 16 L36 20 L48 12 L60 14 L72 8 L84 3',
  'M0 24 L12 20 L24 22 L36 12 L48 16 L60 9 L72 12 L84 6',
  'M0 28 L12 26 L24 20 L36 22 L48 16 L60 18 L72 10 L84 12',
]

type Stat = {
  label: string
  value: string
  suffix?: string
  delta: string
  positive: boolean
  icon: React.ComponentType<{ className?: string }>
  tone: string
  spark: string
  progress?: number
  hint: string
}

const stats: Stat[] = [
  {
    label: 'Videos processed',
    value: String(dashboardStats.videosProcessed),
    delta: `+${dashboardStats.videosDelta}%`,
    positive: true,
    icon: Video,
    tone: 'from-violet-500/20 to-indigo-500/5 text-violet-400',
    spark: sparkPaths[0],
    hint: 'vs. last month',
  },
  {
    label: 'Clips created',
    value: String(dashboardStats.clipsCreated),
    delta: `+${dashboardStats.clipsDelta}%`,
    positive: true,
    icon: Clapperboard,
    tone: 'from-blue-500/20 to-cyan-500/5 text-blue-400',
    spark: sparkPaths[1],
    hint: 'vs. last month',
  },
  {
    label: 'Avg. virality score',
    value: String(dashboardStats.avgScore),
    suffix: '/100',
    delta: '+4.2',
    positive: true,
    icon: Flame,
    tone: 'from-orange-500/20 to-rose-500/5 text-orange-400',
    spark: sparkPaths[2],
    hint: 'across 642 clips',
  },
  {
    label: 'AI credits',
    value: '1,240',
    suffix: 'left',
    delta: '62%',
    positive: true,
    icon: Zap,
    tone: 'from-emerald-500/20 to-teal-500/5 text-emerald-400',
    spark: sparkPaths[3],
    progress: 62,
    hint: 'of 2,000 monthly',
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-4 shadow-soft backdrop-blur-sm transition-colors hover:border-border"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="flex items-start justify-between">
            <div className={cn('grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/5', stat.tone)}>
              <stat.icon className="h-4 w-4" />
            </div>
            <svg viewBox="0 0 84 32" className="h-8 w-20 overflow-visible" aria-hidden>
              <defs>
                <linearGradient id={`spark-${index}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <path d={stat.spark} fill="none" stroke={`url(#spark-${index})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</span>
              {stat.suffix ? <span className="text-[11px] font-medium text-muted-foreground">{stat.suffix}</span> : null}
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{stat.label}</p>
          </div>
          {typeof stat.progress === 'number' ? (
            <Progress value={stat.progress} className="mt-2.5 h-1" label={`${stat.label} remaining`} />
          ) : null}
          <div className="mt-2 flex items-center gap-1.5 text-[10px]">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold',
                stat.positive ? 'bg-success/12 text-success' : 'bg-destructive/12 text-destructive',
              )}
            >
              {stat.positive ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
              {stat.delta}
            </span>
            <span className="text-muted-foreground">{stat.hint}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
