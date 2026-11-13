'use client'

import * as React from 'react'
import { Pause, Play, Redo2, Scissors, Undo2, ZoomIn, ZoomOut } from 'lucide-react'
import type { EditorState } from '@/lib/editor'
import { makeCues } from '@/lib/editor'
import { cn, formatTimecode } from '@/lib/utils'

const TOTAL = 60
const TRACK_LABEL_WIDTH = 68

const filmstrip = [
  'from-violet-600 to-indigo-700',
  'from-indigo-600 to-blue-700',
  'from-blue-600 to-cyan-700',
  'from-fuchsia-600 to-violet-700',
  'from-slate-600 to-slate-800',
  'from-purple-600 to-indigo-800',
  'from-blue-700 to-slate-900',
  'from-indigo-500 to-violet-800',
]

export function EditorTimeline({
  state,
  time,
  playing,
  onTogglePlay,
  onSeek,
  onTrim,
  onSplit,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: {
  state: EditorState
  time: number
  playing: boolean
  onTogglePlay: () => void
  onSeek: (time: number) => void
  onTrim: (handle: 'in' | 'out', time: number) => void
  onSplit: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}) {
  const [zoom, setZoom] = React.useState(1)
  const [dragHandle, setDragHandle] = React.useState<'in' | 'out' | 'playhead' | null>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)

  const inPercent = (state.inPoint / TOTAL) * 100
  const outPercent = (state.outPoint / TOTAL) * 100
  const playPercent = (Math.min(time, TOTAL) / TOTAL) * 100
  const cues = React.useMemo(() => makeCues(state.captionText, state.outPoint - state.inPoint, 7), [state.captionText, state.outPoint, state.inPoint])

  const timeFromClientX = React.useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return 0
    return Math.max(0, Math.min(TOTAL, ((clientX - rect.left) / rect.width) * TOTAL))
  }, [])

  React.useEffect(() => {
    if (!dragHandle) return
    const handle = dragHandle
    function onMove(event: PointerEvent) {
      const next = timeFromClientX(event.clientX)
      if (handle === 'playhead') onSeek(next)
      else onTrim(handle, next)
    }
    function onUp() {
      setDragHandle(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragHandle, onSeek, onTrim, timeFromClientX])

  function onTrackPointerDown(event: React.PointerEvent) {
    if ((event.target as HTMLElement).closest('[data-handle]')) return
    onSeek(timeFromClientX(event.clientX))
  }

  return (
    <section className="shrink-0 border-t border-border/60 bg-card/40 backdrop-blur-sm" aria-label="Timeline">
      <div className="flex items-center gap-1.5 border-b border-border/50 px-3 py-1.5">
        <button
          type="button"
          onClick={onTogglePlay}
          className="grid h-6 w-6 place-items-center rounded-md bg-secondary text-foreground transition-colors hover:bg-secondary/70"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause className="h-3 w-3 fill-current" /> : <Play className="ml-0.5 h-3 w-3 fill-current" />}
        </button>
        <span className="font-mono text-[10px] tabular-nums text-foreground">{formatTimecode(time)}</span>
        <span className="font-mono text-[9px] tabular-nums text-muted-foreground/60">/ {formatTimecode(TOTAL)}</span>
        <div className="mx-1 h-3.5 w-px bg-border" />
        <button
          type="button"
          onClick={onSplit}
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[9px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="Split at playhead (S)"
        >
          <Scissors className="h-3 w-3" /> Split
        </button>
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
          aria-label="Undo"
          title="Undo (⌘Z)"
        >
          <Undo2 className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
          aria-label="Redo"
          title="Redo (⇧⌘Z)"
        >
          <Redo2 className="h-3 w-3" />
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="hidden items-center gap-1 rounded-md bg-secondary/60 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wide text-muted-foreground sm:flex">
            {state.splitPoints.length ? `${state.splitPoints.length} split${state.splitPoints.length > 1 ? 's' : ''}` : 'No splits'}
          </span>
          <button
            type="button"
            onClick={() => setZoom((value) => Math.max(1, value - 0.5))}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-3 w-3" />
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.25}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="h-1 w-14 cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
            aria-label="Timeline zoom"
          />
          <button
            type="button"
            onClick={() => setZoom((value) => Math.min(3, value + 0.5))}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-3 w-3" />
          </button>
          <span className="w-7 text-right font-mono text-[8px] text-muted-foreground">{zoom.toFixed(1)}×</span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-none">
        <div style={{ width: `${zoom * 100}%`, minWidth: '100%' }}>
          <div className="flex">
            <div className="shrink-0 border-r border-border/40" style={{ width: TRACK_LABEL_WIDTH }}>
              <div className="h-6 border-b border-border/40" />
              <div className="space-y-1 py-1.5 pr-2">
                {[
                  { label: 'Video', color: 'bg-primary', height: 'h-10' },
                  { label: 'Captions', color: 'bg-violet-400', height: 'h-8' },
                  { label: 'Music', color: 'bg-emerald-400', height: 'h-6' },
                ].map((track) => (
                  <div key={track.label} className={cn('flex items-center justify-end gap-1.5', track.height)}>
                    <span className="text-[8px] font-medium text-muted-foreground">{track.label}</span>
                    <span className={cn('h-1.5 w-1.5 rounded-full', track.color)} />
                  </div>
                ))}
              </div>
            </div>
            <div
              ref={trackRef}
              className="relative flex-1 select-none"
              onPointerDown={onTrackPointerDown}
              role="presentation"
            >
              <div className="relative h-6 border-b border-border/40">
                {Array.from({ length: 13 }, (_, index) => index * 5).map((second) => (
                  <div
                    key={second}
                    className="absolute top-0 h-full"
                    style={{ left: `${(second / TOTAL) * 100}%` }}
                  >
                    <span className="absolute top-1 -translate-x-1/2 font-mono text-[8px] text-muted-foreground/70">
                      {second % 10 === 0 ? formatTimecode(second).slice(0, 5) : ''}
                    </span>
                    <span className={cn('absolute bottom-0 w-px bg-border/60', second % 10 === 0 ? 'h-2' : 'h-1')} />
                  </div>
                ))}
              </div>

              <div className="relative space-y-1 py-1.5">
                <div className="relative ml-1 mr-1 h-10 overflow-hidden rounded-md border border-border/50 bg-secondary/40">
                  <div className="flex h-full">
                    {filmstrip.map((gradient, index) => (
                      <div
                        key={index}
                        className={cn('relative h-full flex-1 border-r border-black/20 bg-gradient-to-br last:border-r-0', gradient)}
                        style={{ opacity: index * 7.5 >= state.inPoint && index * 7.5 <= state.outPoint ? 1 : 0.45 }}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,.2),transparent_60%)]" />
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded bg-slate-950/50 px-1.5 py-0.5 text-[8px] font-medium text-white/90 backdrop-blur-sm">
                      Source video
                    </span>
                  </div>
                </div>

                <div className="relative ml-1 mr-1 h-8 rounded-md border border-border/50 bg-secondary/30">
                  <div className="flex h-full items-stretch gap-px px-1 py-1">
                    {cues.map((cue, index) => {
                      const left = ((state.inPoint + cue.start) / TOTAL) * 100
                      const width = ((cue.end - cue.start) / TOTAL) * 100
                      return (
                        <div
                          key={index}
                          className="absolute top-1 flex h-6 items-center overflow-hidden rounded bg-primary/25 px-1 text-[7px] font-medium text-primary ring-1 ring-primary/25"
                          style={{ left: `${left}%`, width: `${Math.max(2, width)}%` }}
                          title={cue.text}
                        >
                          <span className="truncate">{cue.text}</span>
                        </div>
                      )
                    })}
                    {!cues.length ? (
                      <span className="px-1 text-[8px] text-muted-foreground">Captions disabled</span>
                    ) : null}
                  </div>
                </div>

                <div className="relative ml-1 mr-1 h-6 overflow-hidden rounded-md border border-border/50 bg-secondary/30">
                  {state.music === 'none' ? (
                    <span className="absolute inset-0 grid place-items-center text-[8px] text-muted-foreground">No music track</span>
                  ) : (
                    <div className="flex h-full items-center gap-[2px] px-1.5">
                      {Array.from({ length: 90 }, (_, index) => (
                        <span
                          key={index}
                          className="flex-1 rounded-full bg-emerald-400/50"
                          style={{ height: `${20 + Math.abs(Math.sin(index * 0.9)) * 60}%` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className="pointer-events-none absolute inset-y-0 z-10 rounded-md border-x-2 border-primary/60 bg-primary/[0.04]"
                  style={{ left: `${inPercent}%`, width: `${Math.max(0, outPercent - inPercent)}%` }}
                />

                {state.splitPoints.map((point) => (
                  <div
                    key={point}
                    className="pointer-events-none absolute inset-y-0 z-20 w-px bg-amber-400/70"
                    style={{ left: `${(point / TOTAL) * 100}%` }}
                  >
                    <span className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 bg-amber-400" />
                  </div>
                ))}

                <div
                  data-handle="in"
                  role="slider"
                  tabIndex={0}
                  aria-label="Trim in point"
                  aria-valuemin={0}
                  aria-valuemax={state.outPoint - 2}
                  aria-valuenow={state.inPoint}
                  onPointerDown={(event) => {
                    event.stopPropagation()
                    setDragHandle('in')
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowRight') onTrim('in', Math.min(state.outPoint - 2, state.inPoint + 1))
                    if (event.key === 'ArrowLeft') onTrim('in', Math.max(0, state.inPoint - 1))
                  }}
                  className="absolute inset-y-0 z-30 w-2.5 -translate-x-1/2 cursor-ew-resize"
                  style={{ left: `${inPercent}%` }}
                >
                  <span className="absolute inset-y-1 left-1/2 w-1 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,.7)]" />
                  <span className="absolute left-1/2 top-1/2 h-5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-primary bg-card">
                    <span className="absolute inset-y-1 left-[3px] w-px bg-primary/70" />
                    <span className="absolute inset-y-1 right-[3px] w-px bg-primary/70" />
                  </span>
                </div>

                <div
                  data-handle="out"
                  role="slider"
                  tabIndex={0}
                  aria-label="Trim out point"
                  aria-valuemin={state.inPoint + 2}
                  aria-valuemax={TOTAL}
                  aria-valuenow={state.outPoint}
                  onPointerDown={(event) => {
                    event.stopPropagation()
                    setDragHandle('out')
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowRight') onTrim('out', Math.min(TOTAL, state.outPoint + 1))
                    if (event.key === 'ArrowLeft') onTrim('out', Math.max(state.inPoint + 2, state.outPoint - 1))
                  }}
                  className="absolute inset-y-0 z-30 w-2.5 -translate-x-1/2 cursor-ew-resize"
                  style={{ left: `${outPercent}%` }}
                >
                  <span className="absolute inset-y-1 left-1/2 w-1 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,.7)]" />
                  <span className="absolute left-1/2 top-1/2 h-5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-primary bg-card">
                    <span className="absolute inset-y-1 left-[3px] w-px bg-primary/70" />
                    <span className="absolute inset-y-1 right-[3px] w-px bg-primary/70" />
                  </span>
                </div>

                <div
                  data-handle="playhead"
                  className="absolute inset-y-0 z-40 w-0.5 cursor-ew-resize bg-white shadow-[0_0_6px_rgba(255,255,255,.65)]"
                  style={{ left: `${playPercent}%` }}
                  onPointerDown={(event) => {
                    event.stopPropagation()
                    setDragHandle('playhead')
                  }}
                  aria-hidden
                >
                  <span className="absolute -left-[3px] top-0 h-2 w-2 rounded-full bg-white" />
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-1 pb-0.5 font-mono text-[7px] text-muted-foreground/60">
                <span>00:00</span>
                <span>{formatTimecode(TOTAL)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
