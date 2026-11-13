'use client'

import * as React from 'react'
import { Check, Copy, Languages, Search, Sparkles } from 'lucide-react'
import type { TranscriptCue } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn, formatDuration } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

export function TranscriptPanel({
  cues,
  currentTime,
  onSeek,
  language,
}: {
  cues: TranscriptCue[]
  currentTime: number
  onSeek: (time: number) => void
  language: string
}) {
  const { toast } = useToast()
  const [query, setQuery] = React.useState('')

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return cues
    return cues.filter((cue) => cue.text.toLowerCase().includes(term))
  }, [cues, query])

  const activeCue = cues.find((cue) => currentTime >= cue.start && currentTime < cue.end)

  async function copyTranscript() {
    try {
      await navigator.clipboard.writeText(cues.map((cue) => cue.text).join('\n\n'))
      toast({ title: 'Transcript copied', description: 'Plain text is on your clipboard.', variant: 'success' })
    } catch {
      toast({ title: 'Could not copy', description: 'Clipboard access was blocked.', variant: 'error' })
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-soft">
      <div className="border-b border-border/60 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary/12 text-primary">
              <Languages className="h-3 w-3" />
            </span>
            <h2 className="text-xs font-semibold">Transcript</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-[9px]">{language}</Badge>
            <button
              type="button"
              onClick={copyTranscript}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Copy transcript"
              title="Copy transcript"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="relative mt-2.5">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search transcript…"
            className="h-8 pl-8 text-[11px]"
            aria-label="Search transcript"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-[11px] text-muted-foreground">No lines match “{query}”.</p>
        ) : (
          filtered.map((cue) => {
            const active = activeCue?.id === cue.id
            return (
              <button
                key={cue.id}
                type="button"
                onClick={() => onSeek(cue.start)}
                className={cn(
                  'flex w-full gap-2.5 rounded-lg px-2 py-2 text-left transition-colors',
                  active ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-secondary/70',
                )}
              >
                <span className={cn('mt-0.5 shrink-0 font-mono text-[9px] tabular-nums', active ? 'text-primary' : 'text-muted-foreground/70')}>
                  {formatDuration(cue.start)}
                </span>
                <span className="min-w-0">
                  <span className="block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                    {cue.speaker}
                  </span>
                  <span className={cn('block text-[11px] leading-relaxed', active ? 'text-foreground' : 'text-muted-foreground')}>
                    {cue.text}
                  </span>
                </span>
                {active ? <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> : null}
              </button>
            )
          })
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border/60 px-3 py-2 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Check className="h-2.5 w-2.5 text-success" /> Whisper · word timestamps
        </span>
        <span>{cues.length} lines</span>
      </div>
    </div>
  )
}
