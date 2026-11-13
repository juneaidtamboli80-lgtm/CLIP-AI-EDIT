'use client'

import * as React from 'react'
import { Check, Download, FileVideo, Loader2, Sparkles, Subtitles } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/toast'
import type { EditorState } from '@/lib/editor'
import { makeCues } from '@/lib/editor'
import { cn, downloadTextFile, formatTimecode, toSrt } from '@/lib/utils'

const resolutions = [
  { value: '720p', label: '720p', hint: '1280 × 720' },
  { value: '1080p', label: '1080p', hint: '1920 × 1080' },
]
const fpsOptions = [30, 60]
const bitrates = ['Auto', '6 Mbps', '8 Mbps', '12 Mbps']

export function ExportDialog({
  open,
  onOpenChange,
  state,
  clipTitle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: EditorState
  clipTitle: string
}) {
  const { toast } = useToast()
  const [resolution, setResolution] = React.useState('1080p')
  const [fps, setFps] = React.useState(30)
  const [bitrate, setBitrate] = React.useState('Auto')
  const [captions, setCaptions] = React.useState<'burned' | 'soft' | 'none'>(state.captionsEnabled ? 'burned' : 'soft')
  const [scope, setScope] = React.useState<'single' | 'bulk'>('single')
  const [progress, setProgress] = React.useState(0)
  const [rendering, setRendering] = React.useState(false)
  const [done, setDone] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setProgress(0)
      setRendering(false)
      setDone(false)
    }
  }, [open])

  React.useEffect(() => {
    if (!rendering) return
    const timer = window.setInterval(() => {
      setProgress((value) => {
        const next = Math.min(100, value + 4)
        if (next >= 100) {
          window.clearInterval(timer)
          setRendering(false)
          setDone(true)
        }
        return next
      })
    }, 130)
    return () => window.clearInterval(timer)
  }, [rendering])

  const duration = Math.max(1, state.outPoint - state.inPoint)
  const estimatedMb = Math.max(2, Math.round((duration * (resolution === '1080p' ? 8 : 4) * (fps === 60 ? 1.4 : 1)) / 8))

  function render() {
    if (scope === 'bulk') {
      toast({
        title: 'Bulk export arrives in Phase 6',
        description: 'Zip downloads for all project clips are part of the export phase.',
        variant: 'info',
      })
      return
    }
    setDone(false)
    setProgress(0)
    setRendering(true)
  }

  function downloadSrt() {
    const cues = makeCues(state.captionText, duration, 8)
    downloadTextFile('clipforge-captions.srt', toSrt(cues))
    toast({ title: 'Subtitles downloaded', description: `${cues.length} cues exported as .SRT`, variant: 'success' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="sm:max-w-lg" labelledBy="export-title">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow-sm">
          <FileVideo className="h-4 w-4" />
        </span>
        <div>
          <h2 id="export-title" className="text-base font-semibold tracking-tight">Export clip</h2>
          <p className="text-[10px] text-muted-foreground">{clipTitle}</p>
        </div>
      </div>

      {done ? (
        <div className="mt-5">
          <div className="rounded-2xl border border-success/25 bg-success/[0.06] p-4 text-center">
            <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success">
              <Check className="h-5 w-5" />
            </span>
            <h3 className="mt-2 text-sm font-semibold">Render preview complete</h3>
            <p className="mx-auto mt-1 max-w-sm text-[10px] leading-relaxed text-muted-foreground">
              Your settings are valid. Actual MP4 rendering with FFmpeg is enabled in Phase 6; for now you can take the timed subtitles with you.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Button size="sm" variant="secondary" onClick={downloadSrt}>
                <Subtitles className="h-3.5 w-3.5" /> Download .SRT
              </Button>
              <Button size="sm" onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[9px] text-muted-foreground">
            <div className="rounded-lg bg-secondary/50 p-2"><span className="block font-mono text-[10px] text-foreground">{resolution}</span>resolution</div>
            <div className="rounded-lg bg-secondary/50 p-2"><span className="block font-mono text-[10px] text-foreground">{fps} fps</span>frame rate</div>
            <div className="rounded-lg bg-secondary/50 p-2"><span className="block font-mono text-[10px] text-foreground">{formatTimecode(duration)}</span>duration</div>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground">Export scope</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { value: 'single' as const, label: 'This clip', hint: 'MP4 download' },
                { value: 'bulk' as const, label: 'All project clips', hint: 'ZIP · Phase 6' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setScope(item.value)}
                  className={cn(
                    'rounded-xl border p-2.5 text-left transition-colors',
                    scope === item.value ? 'border-primary/40 bg-primary/[0.06]' : 'border-border/60 bg-background/30 hover:bg-secondary/40',
                  )}
                >
                  <p className="text-[10px] font-medium">{item.label}</p>
                  <p className="text-[8px] text-muted-foreground">{item.hint}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground">Resolution</p>
            <div className="grid grid-cols-2 gap-1.5">
              {resolutions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setResolution(item.value)}
                  className={cn(
                    'rounded-xl border p-2.5 text-left transition-colors',
                    resolution === item.value ? 'border-primary/40 bg-primary/[0.06]' : 'border-border/60 bg-background/30 hover:bg-secondary/40',
                  )}
                >
                  <p className="text-[11px] font-semibold">{item.label}</p>
                  <p className="text-[8px] text-muted-foreground">{item.hint}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium text-muted-foreground">Frame rate</p>
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-border/60 bg-secondary/40 p-1">
                {fpsOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFps(option)}
                    className={cn('rounded-lg py-1.5 text-[10px] font-medium transition-colors', fps === option ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground')}
                  >
                    {option} fps
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium text-muted-foreground">Bitrate</p>
              <select
                value={bitrate}
                onChange={(event) => setBitrate(event.target.value)}
                aria-label="Bitrate"
                className="h-[34px] w-full rounded-xl border border-border bg-background/50 px-2 text-[10px] outline-none focus:border-primary/50"
              >
                {bitrates.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground">Captions</p>
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-border/60 bg-secondary/40 p-1">
              {[
                { value: 'burned' as const, label: 'Burned-in' },
                { value: 'soft' as const, label: 'Soft track' },
                { value: 'none' as const, label: 'None' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCaptions(item.value)}
                  className={cn('rounded-lg py-1.5 text-[9px] font-medium transition-colors', captions === item.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground')}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/30 p-3">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Format</span>
              <span className="font-medium">MP4 · H.264 + AAC</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-mono font-medium">{formatTimecode(duration)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Estimated size</span>
              <span className="font-mono font-medium">~{estimatedMb} MB</span>
            </div>
          </div>

          {rendering ? (
            <div className="space-y-1.5 rounded-xl border border-primary/20 bg-primary/[0.05] p-3">
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 font-medium text-primary"><Loader2 className="h-3 w-3 animate-spin" /> Rendering preview…</span>
                <span className="tabular-nums text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} label="Render progress" />
              <p className="text-[8px] text-muted-foreground">Cropping 9:16 · burning captions · mixing audio</p>
            </div>
          ) : null}

          <Button className="w-full" size="lg" onClick={render} disabled={rendering}>
            <Sparkles className="h-4 w-4" /> {rendering ? 'Rendering…' : scope === 'bulk' ? 'Prepare ZIP export' : 'Render clip'}
          </Button>
          <p className="text-center text-[8px] leading-relaxed text-muted-foreground/70">
            Phase 1 preview. Real FFmpeg rendering, storage URLs and download endpoints ship in Phase 6.
          </p>
        </div>
      )}
    </Dialog>
  )
}
