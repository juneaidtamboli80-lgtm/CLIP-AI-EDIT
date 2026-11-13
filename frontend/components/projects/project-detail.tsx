'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Clapperboard,
  Download,
  FileVideo,
  Flame,
  FolderOpen,
  Gauge,
  Globe2,
  Loader2,
  Maximize2,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  Scissors,
  Settings2,
  Sparkles,
  Trash2,
  Volume2,
  Wand2,
  Youtube,
} from 'lucide-react'
import type { Clip, Project, TranscriptCue } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ClipCard } from '@/components/projects/clip-card'
import { TranscriptPanel } from '@/components/projects/transcript-panel'
import { useToast } from '@/components/ui/toast'
import { processingSteps } from '@/lib/mock-data'
import { cn, formatDuration, formatRelativeDate } from '@/lib/utils'

const waveform = Array.from({ length: 84 }, (_, index) => {
  const seed = Math.sin(index * 1.7) * Math.cos(index * 0.6)
  return Math.round(18 + Math.abs(seed) * 64)
})

export function ProjectDetail({
  project,
  initialClips,
  transcript,
}: {
  project: Project
  initialClips: Clip[]
  transcript: TranscriptCue[]
}) {
  const { toast } = useToast()
  const [clips, setClips] = React.useState(initialClips)
  const [playing, setPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(project.status === 'ready' ? 312 : 0)
  const [deleteTarget, setDeleteTarget] = React.useState<Clip | null>(null)
  const [tab, setTab] = React.useState<'clips' | 'details'>('clips')

  React.useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setCurrentTime((time) => {
        if (time >= project.duration) {
          setPlaying(false)
          return 0
        }
        return time + 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [playing, project.duration])

  const progress = project.duration ? (currentTime / project.duration) * 100 : 0

  function seek(percent: number) {
    setCurrentTime(Math.max(0, Math.min(project.duration, (percent / 100) * project.duration)))
  }

  function downloadClip(clip: Clip) {
    toast({
      title: 'Export comes next',
      description: `“${clip.title}” is ready. MP4 rendering and downloads are wired up in Phase 6.`,
      variant: 'info',
    })
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setClips((current) => current.filter((clip) => clip.id !== deleteTarget.id))
    toast({ title: 'Clip deleted', description: deleteTarget.title, variant: 'success' })
    setDeleteTarget(null)
  }

  const stepIndex = processingSteps.findIndex((step) => step.id === project.step)

  return (
    <div className="space-y-5">
      <div>
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> All projects
        </Link>
        <div className="mt-2 flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={project.status === 'ready' ? 'success' : project.status === 'processing' ? 'warning' : 'secondary'}>
                {project.status === 'processing' ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <span className="h-1 w-1 rounded-full bg-current" />}
                {project.status === 'ready' ? 'Ready to edit' : project.status === 'processing' ? 'Processing' : project.status === 'draft' ? 'Draft' : 'Failed'}
              </Badge>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                {project.source === 'youtube' ? <Youtube className="h-3 w-3" /> : <FileVideo className="h-3 w-3" />}
                {project.source === 'youtube' ? 'YouTube import' : 'Device upload'}
              </span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="text-[10px] text-muted-foreground">{formatRelativeDate(project.createdAt)}</span>
            </div>
            <h1 className="mt-2 max-w-3xl text-xl font-semibold leading-tight tracking-tight sm:text-2xl">{project.title}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {formatDuration(project.duration)}</span>
              <span className="flex items-center gap-1"><Clapperboard className="h-3 w-3" /> {clips.length} clips</span>
              <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" /> {project.language}</span>
              <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {project.resolution} · {project.aspectRatio}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast({ title: 'Re-analysis queued', description: 'Highlight detection re-runs in Phase 4.', variant: 'info' })
              }
            >
              <RefreshCw className="h-3.5 w-3.5" /> Re-analyze
            </Button>
            <Button
              size="sm"
              onClick={() =>
                toast({
                  title: 'Bulk download is coming',
                  description: 'Zip export of all clips is part of Phase 6.',
                  variant: 'info',
                })
              }
            >
              <Download className="h-3.5 w-3.5" /> Download all
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-soft">
          <div className={cn('relative aspect-video overflow-hidden bg-gradient-to-br', project.thumbnail)}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.3),transparent_55%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,.85),rgba(2,6,23,.2)_55%,rgba(2,6,23,.35))]" />
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.3)_1px,transparent_1px)] [background-size:36px_36px]" />

            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="rounded-full bg-slate-950/55 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                Source video
              </span>
              <span className="rounded-full bg-slate-950/55 px-2 py-1 text-[9px] text-white/80 backdrop-blur-sm">
                {project.resolution} · {project.language}
              </span>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <button
                type="button"
                onClick={() => setPlaying((value) => !value)}
                className="group grid h-16 w-16 place-items-center rounded-full border border-white/25 bg-white/15 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-105 hover:bg-white/25"
                aria-label={playing ? 'Pause preview' : 'Play preview'}
              >
                {playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="ml-1 h-7 w-7 fill-current" />}
              </button>
              <p className="mt-3 max-w-lg text-sm font-semibold text-white/90 drop-shadow sm:text-base">{project.title}</p>
              <p className="mt-1 text-[10px] text-white/60">Preview poster · source video stream wired in Phase 2</p>
            </div>

            <div className="absolute inset-x-0 bottom-0 px-3 pb-2.5 pt-10">
              <div className="flex items-center gap-2.5 text-white/80">
                <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pause' : 'Play'} className="hover:text-white">
                  {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                </button>
                <span className="font-mono text-[10px] tabular-nums text-white/90">{formatDuration(currentTime)} / {formatDuration(project.duration)}</span>
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label="Seek source video"
                  aria-valuemin={0}
                  aria-valuemax={Math.round(project.duration)}
                  aria-valuenow={Math.round(currentTime)}
                  onClick={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect()
                    seek(((event.clientX - rect.left) / rect.width) * 100)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowRight') seek(progress + 2)
                    if (event.key === 'ArrowLeft') seek(progress - 2)
                  }}
                  className="group relative h-6 flex-1 cursor-pointer"
                >
                  <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${progress}%` }} />
                  </div>
                  <span
                    className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
                    style={{ left: `${progress}%` }}
                  />
                </div>
                <Volume2 className="h-4 w-4" />
                <Settings2 className="h-4 w-4" />
                <Maximize2 className="h-4 w-4" />
              </div>
              <div className="mt-1 flex h-5 items-end gap-[2px] opacity-60" aria-hidden>
                {waveform.map((height, index) => (
                  <span
                    key={index}
                    className={cn('flex-1 rounded-full', (index / waveform.length) * 100 <= progress ? 'bg-primary' : 'bg-white/40')}
                    style={{ height: `${Math.max(2, height * 0.22)}px` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-4 py-2.5">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-success" /> Audio extracted</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-success" /> Whisper transcription</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => setCurrentTime(0)}>
                Restart
              </Button>
              <Link href={clips[0] ? `/editor/${clips[0].id}` : '/new'}>
                <Button size="sm" className="h-7 text-[10px]">
                  <Scissors className="h-3 w-3" /> Open editor
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="h-[420px] lg:h-auto">
          <TranscriptPanel cues={transcript} currentTime={currentTime} onSeek={setCurrentTime} language={project.language} />
        </div>
      </div>

      {project.status === 'processing' ? (
        <section className="rounded-2xl border border-warning/25 bg-warning/[0.04] p-4 shadow-soft">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning">
                <Loader2 className="h-4 w-4 animate-spin" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Forging your clips</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Transcribing audio and scoring highlight moments. You can leave this page — we&apos;ll keep working.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold tabular-nums text-warning">{project.progress}%</span>
          </div>
          <Progress value={project.progress ?? 0} className="mt-3" label="Processing progress" />
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {processingSteps.map((step, index) => {
              const done = index < stepIndex || (index === stepIndex && (project.progress ?? 0) > 90)
              const active = index === stepIndex
              return (
                <div key={step.id} className={cn('rounded-xl border p-2.5', active ? 'border-warning/30 bg-warning/[0.06]' : 'border-border/60 bg-background/30')}>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('grid h-4 w-4 place-items-center rounded-full text-[8px]', done ? 'bg-success/20 text-success' : active ? 'bg-warning/20 text-warning' : 'bg-secondary text-muted-foreground')}>
                      {done ? <Check className="h-2.5 w-2.5" /> : active ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : index + 1}
                    </span>
                    <p className={cn('text-[10px] font-medium', active ? 'text-foreground' : 'text-muted-foreground')}>{step.label}</p>
                  </div>
                  <p className="mt-1 pl-5 text-[9px] text-muted-foreground">{step.description}</p>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      <div>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <Sparkles className="h-4 w-4 text-primary" /> AI clips
              <Badge variant="secondary" className="text-[9px]">{clips.length}</Badge>
            </h2>
            <p className="text-xs text-muted-foreground">Ranked by virality score. Open any clip to edit captions, framing and audio.</p>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-secondary/50 p-1">
            <button
              type="button"
              onClick={() => setTab('clips')}
              className={cn('rounded-lg px-2.5 py-1 text-[10px] font-medium transition-colors', tab === 'clips' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground')}
            >
              Clips
            </button>
            <button
              type="button"
              onClick={() => setTab('details')}
              className={cn('rounded-lg px-2.5 py-1 text-[10px] font-medium transition-colors', tab === 'details' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground')}
            >
              Details
            </button>
          </div>
        </div>

        {tab === 'details' ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Source', value: project.source === 'youtube' ? 'YouTube' : 'Device upload', icon: Youtube },
              { label: 'Duration', value: formatDuration(project.duration), icon: Clock3 },
              { label: 'Detected language', value: project.language, icon: Globe2 },
              { label: 'Output format', value: `${project.resolution} · ${project.aspectRatio}`, icon: Gauge },
              { label: 'Transcription', value: 'Whisper large-v3', icon: Wand2 },
              { label: 'Highlight model', value: 'GPT-4o scorer', icon: Flame },
              { label: 'Face tracking', value: 'Speaker auto-frame', icon: FolderOpen },
              { label: 'Created', value: new Date(project.createdAt).toLocaleDateString(), icon: CalendarDays },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border/70 bg-card/60 p-3">
                <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                  <item.icon className="h-3 w-3" /> {item.label}
                </div>
                <p className="mt-1.5 truncate text-xs font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        ) : clips.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {clips.map((clip, index) => (
              <ClipCard key={clip.id} clip={clip} index={index} onDelete={setDeleteTarget} onDownload={downloadClip} />
            ))}
          </div>
        ) : project.status === 'processing' ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
                <div className="skeleton aspect-[9/13] rounded-none" />
                <div className="space-y-2 p-3">
                  <div className="skeleton h-2.5 w-full" />
                  <div className="skeleton h-2.5 w-2/3" />
                  <div className="skeleton h-7 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/30 px-6 py-12 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Wand2 className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold">No clips yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-muted-foreground">
              This project is a draft. Run the AI pipeline to transcribe it and find the strongest moments.
            </p>
            <Link href="/new">
              <Button size="sm" className="mt-4">
                Analyze video <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        className="sm:max-w-sm"
        labelledBy="delete-clip-title"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-destructive/12 text-destructive">
            <Trash2 className="h-4 w-4" />
          </span>
          <div>
            <h2 id="delete-clip-title" className="text-sm font-semibold">Delete this clip?</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              “{deleteTarget?.title}” will be removed from this project. This can&apos;t be undone.
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={confirmDelete}>
            <Trash2 className="h-3.5 w-3.5" /> Delete clip
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
