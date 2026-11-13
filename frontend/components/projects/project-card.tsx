'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Clapperboard, Clock3, Loader2, Play, Youtube, Upload, AlertCircle } from 'lucide-react'
import type { Project } from '@/lib/types'
import { cn, formatDuration, formatRelativeDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const statusStyles: Record<Project['status'], { label: string; variant: 'success' | 'warning' | 'secondary' | 'destructive' }> = {
  ready: { label: 'Ready', variant: 'success' },
  processing: { label: 'Processing', variant: 'warning' },
  draft: { label: 'Draft', variant: 'secondary' },
  failed: { label: 'Failed', variant: 'destructive' },
}

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const status = statusStyles[project.status]
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/projects/${project.id}`}
        className="group block overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow-sm"
      >
        <div className={cn('relative aspect-[16/10] overflow-hidden bg-gradient-to-br', project.thumbnail)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,.28),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,.72),transparent_55%)]" />
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:28px_28px]" />

          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-slate-950/55 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm">
              {project.source === 'youtube' ? <Youtube className="h-2.5 w-2.5" /> : <Upload className="h-2.5 w-2.5" />}
              {project.source === 'youtube' ? 'YouTube' : 'Upload'}
            </span>
            <Badge variant={status.variant} className="border-transparent bg-slate-950/55 px-2 py-0.5 text-[9px] text-white backdrop-blur-sm">
              {project.status === 'processing' ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <span className="h-1 w-1 rounded-full bg-current" />}
              {status.label}
            </Badge>
          </div>

          <span className="absolute right-3 top-3 rounded-md bg-slate-950/60 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white backdrop-blur-sm">
            {formatDuration(project.duration)}
          </span>

          <div className="absolute inset-0 grid place-items-center">
            <span className="grid h-11 w-11 translate-y-1 place-items-center rounded-full border border-white/25 bg-white/15 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Play className="h-4 w-4 fill-current" />
            </span>
          </div>

          <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between gap-2">
            <div className="flex items-center gap-2 text-[10px] text-white/80">
              <span className="flex items-center gap-1">
                <Clapperboard className="h-3 w-3" /> {project.clipsCount} clips
              </span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span>{project.language}</span>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 translate-y-0.5 text-white/70 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100" />
          </div>

          {project.status === 'processing' && typeof project.progress === 'number' ? (
            <div className="absolute inset-x-0 bottom-0">
              <Progress value={project.progress} className="h-1 rounded-none bg-slate-950/40" barClassName="rounded-none" />
            </div>
          ) : null}
        </div>

        <div className="p-3.5">
          <h3 className="line-clamp-2 min-h-[2.4rem] text-[13px] font-medium leading-snug transition-colors group-hover:text-primary">
            {project.title}
          </h3>
          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock3 className="h-3 w-3" /> {formatRelativeDate(project.createdAt)}
            </span>
            <span className="tabular-nums">{project.resolution ?? '1080p'} · {project.aspectRatio}</span>
          </div>
          {project.status === 'processing' && typeof project.progress === 'number' ? (
            <p className="mt-2 flex items-center gap-1 text-[10px] text-warning">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              {project.progress}% · {project.step === 'transcribe' ? 'Transcribing audio' : 'Rendering clips'}
            </p>
          ) : project.status === 'failed' ? (
            <p className="mt-2 flex items-center gap-1 text-[10px] text-destructive">
              <AlertCircle className="h-2.5 w-2.5" /> Source unavailable
            </p>
          ) : null}
        </div>
      </Link>
    </motion.div>
  )
}
