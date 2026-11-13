'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Download, Flame, Pencil, Trash2, Clock3, Sparkles } from 'lucide-react'
import type { Clip } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatDuration } from '@/lib/utils'

export function ClipCard({
  clip,
  index,
  onDelete,
  onDownload,
}: {
  clip: Clip
  index: number
  onDelete: (clip: Clip) => void
  onDownload: (clip: Clip) => void
}) {
  const duration = clip.end - clip.start
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow-sm"
    >
      <div className={cn('relative aspect-[9/13] overflow-hidden bg-gradient-to-br', clip.thumbnail)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.3),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,.8),transparent_60%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            <Flame className="h-2.5 w-2.5 text-orange-400" />
            {clip.score}
          </span>
          <span className="rounded-full bg-slate-950/60 px-2 py-1 text-[9px] font-medium text-white/90 backdrop-blur-sm">
            {formatDuration(duration)}s
          </span>
        </div>

        <div className="absolute right-2.5 top-2.5">
          <Badge variant="secondary" className="border-white/15 bg-slate-950/55 px-1.5 py-0.5 text-[8px] uppercase text-white backdrop-blur-sm">
            {clip.aspectRatio}
          </Badge>
        </div>

        <div className="absolute inset-x-2.5 bottom-2.5">
          <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-white drop-shadow">
            {clip.title}
          </p>
          <div className="mt-1.5 flex items-center gap-2 text-[9px] text-white/70">
            <span className="flex items-center gap-1">
              <Clock3 className="h-2.5 w-2.5" /> {formatDuration(clip.start)}–{formatDuration(clip.end)}
            </span>
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <span className="flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> AI pick
            </span>
          </div>
        </div>

        <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Link
            href={`/editor/${clip.id}`}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition-transform hover:scale-105"
            aria-label={`Edit ${clip.title}`}
          >
            <Pencil className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="space-y-2.5 p-3">
        <p className="line-clamp-2 min-h-[2.25rem] text-[11px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Why it works: </span>
          {clip.reason}
        </p>
        <div className="flex items-center gap-1.5">
          <Link href={`/editor/${clip.id}`} className="flex-1">
            <Button size="sm" variant="secondary" className="w-full">
              <Pencil className="h-3 w-3" /> Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownload(clip)}
            aria-label={`Download ${clip.title}`}
            title="Download clip"
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(clip)}
            aria-label={`Delete ${clip.title}`}
            title="Delete clip"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
