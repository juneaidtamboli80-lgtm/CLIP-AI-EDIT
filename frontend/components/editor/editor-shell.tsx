'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Cloud,
  Command,
  Download,
  Keyboard,
  Loader2,
  Redo2,
  Save,
  Scissors,
  Sparkles,
  Undo2,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { EditorPreview } from '@/components/editor/preview'
import { EditorTimeline } from '@/components/editor/timeline'
import { PropertiesPanel } from '@/components/editor/properties-panel'
import { ExportDialog } from '@/components/editor/export-dialog'
import { createEditorState, DEFAULT_CAPTION_TEXT } from '@/lib/editor'
import type { EditorState } from '@/lib/editor'
import type { Clip, Project } from '@/lib/types'
import { clamp, cn, formatDuration, formatTimecode } from '@/lib/utils'

const shortcuts = [
  { keys: ['Space'], label: 'Play / pause preview' },
  { keys: ['S'], label: 'Split clip at playhead' },
  { keys: ['←', '→'], label: 'Nudge playhead 1 second' },
  { keys: ['⌘', 'Z'], label: 'Undo' },
  { keys: ['⇧', '⌘', 'Z'], label: 'Redo' },
  { keys: ['⌘', 'S'], label: 'Force save' },
  { keys: ['?'], label: 'Show this panel' },
]

export function EditorShell({ clip, project }: { clip: Clip; project: Project }) {
  const { toast } = useToast()
  const [state, setState] = React.useState<EditorState>(() => createEditorState(clip))
  const [time, setTime] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  const [muted, setMuted] = React.useState(false)
  const [saveStatus, setSaveStatus] = React.useState<'saved' | 'saving'>('saved')
  const [lastSaved, setLastSaved] = React.useState('just now')
  const [exportOpen, setExportOpen] = React.useState(false)
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false)
  const [editingWord, setEditingWord] = React.useState<{ index: number; value: string } | null>(null)
  const [historyTick, setHistoryTick] = React.useState(0)

  const pastRef = React.useRef<EditorState[]>([])
  const futureRef = React.useRef<EditorState[]>([])
  const lastHistoryAt = React.useRef(0)
  const lastTrimHistoryAt = React.useRef(0)
  const hasMounted = React.useRef(false)
  const initialDuration = Math.max(15, Math.round(clip.end - clip.start))

  const update = React.useCallback((patch: Partial<EditorState>) => {
    setState((current) => {
      const now = Date.now()
      if (now - lastHistoryAt.current > 320) {
        pastRef.current.push(current)
        if (pastRef.current.length > 60) pastRef.current.shift()
        futureRef.current = []
        lastHistoryAt.current = now
      }
      return { ...current, ...patch }
    })
    setHistoryTick((tick) => tick + 1)
  }, [])

  const undo = React.useCallback(() => {
    setState((current) => {
      const previous = pastRef.current.pop()
      if (!previous) return current
      futureRef.current.push(current)
      return previous
    })
    setHistoryTick((tick) => tick + 1)
  }, [])

  const redo = React.useCallback(() => {
    setState((current) => {
      const next = futureRef.current.pop()
      if (!next) return current
      pastRef.current.push(current)
      return next
    })
    setHistoryTick((tick) => tick + 1)
  }, [])

  const canUndo = pastRef.current.length > 0
  const canRedo = futureRef.current.length > 0
  void historyTick

  React.useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    setSaveStatus('saving')
    const timer = window.setTimeout(() => {
      setSaveStatus('saved')
      setLastSaved('just now')
    }, 700)
    return () => window.clearTimeout(timer)
  }, [state])

  React.useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setTime((current) => {
        const next = current + 0.1
        if (next >= state.outPoint) {
          setPlaying(false)
          return state.inPoint
        }
        return next
      })
    }, 100)
    return () => window.clearInterval(timer)
  }, [playing, state.inPoint, state.outPoint])

  const togglePlay = React.useCallback(() => {
    setPlaying((current) => {
      if (!current) {
        if (time < state.inPoint || time >= state.outPoint) setTime(state.inPoint)
      }
      return !current
    })
  }, [state.inPoint, state.outPoint, time])

  const handleSeek = React.useCallback(
    (next: number) => {
      setTime(clamp(next, 0, 60))
    },
    [],
  )

  const handleTrim = React.useCallback((handle: 'in' | 'out', value: number) => {
    setState((current) => {
      const now = Date.now()
      if (now - lastTrimHistoryAt.current > 450) {
        pastRef.current.push(current)
        if (pastRef.current.length > 60) pastRef.current.shift()
        futureRef.current = []
        lastTrimHistoryAt.current = now
      }
      const next =
        handle === 'in'
          ? { ...current, inPoint: clamp(value, 0, current.outPoint - 2) }
          : { ...current, outPoint: clamp(value, current.inPoint + 2, 60) }
      setTime((currentTime) => clamp(currentTime, next.inPoint, next.outPoint))
      return next
    })
    setHistoryTick((tick) => tick + 1)
  }, [])

  const split = React.useCallback(() => {
    const point = Math.round(time * 10) / 10
    if (point <= state.inPoint + 1 || point >= state.outPoint - 1) {
      toast({ title: 'Move the playhead first', description: 'Splits need at least 1 second on each side.', variant: 'error' })
      return
    }
    if (state.splitPoints.includes(point)) return
    update({ splitPoints: [...state.splitPoints, point].sort((a, b) => a - b) })
    toast({ title: 'Split added', description: `Marker at ${formatTimecode(point)}`, variant: 'success' })
  }, [state.inPoint, state.outPoint, state.splitPoints, time, toast, update])

  const saveNow = React.useCallback(() => {
    setSaveStatus('saved')
    setLastSaved('just now')
    toast({ title: 'Project saved', description: 'Captions, trims and style settings are up to date.', variant: 'success' })
  }, [toast])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if (isTyping) return
      const meta = event.metaKey || event.ctrlKey
      if (event.key === ' ') {
        event.preventDefault()
        togglePlay()
      } else if (meta && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      } else if (meta && event.key.toLowerCase() === 's') {
        event.preventDefault()
        saveNow()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setTime((current) => clamp(current - 1, 0, 60))
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        setTime((current) => clamp(current + 1, 0, 60))
      } else if (event.key.toLowerCase() === 's') {
        event.preventDefault()
        split()
      } else if (event.key === '?') {
        event.preventDefault()
        setShortcutsOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [redo, saveNow, split, togglePlay, undo])

  function startEditingWord(index: number) {
    const words = state.captionText.split(/\s+/).filter(Boolean)
    setPlaying(false)
    setEditingWord({ index, value: words[index] ?? '' })
  }

  function applyWordEdit() {
    if (!editingWord) return
    const words = state.captionText.split(/\s+/).filter(Boolean)
    if (!editingWord.value.trim()) {
      setEditingWord(null)
      return
    }
    words[editingWord.index] = editingWord.value.trim()
    update({ captionText: words.join(' ') })
    setEditingWord(null)
    toast({ title: 'Caption word updated', description: 'The change is reflected in the preview.', variant: 'success' })
  }

  const words = state.captionText.split(/\s+/).filter(Boolean)
  const duration = state.outPoint - state.inPoint

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background xl:h-[100dvh] xl:overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/70 bg-card/60 px-2.5 backdrop-blur-xl sm:px-3.5">
        <Link
          href={`/projects/${project.id}`}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Back to project"
          title="Back to project"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
        <div className="hidden h-5 w-px bg-border sm:block" />
        <div className="hidden items-center gap-1.5 text-[10px] text-muted-foreground sm:flex">
          <Link href="/dashboard" className="transition-colors hover:text-foreground">ClipForge</Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <Link href={`/projects/${project.id}`} className="max-w-[140px] truncate transition-colors hover:text-foreground">
            {project.title}
          </Link>
          <ChevronRight className="h-2.5 w-2.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-xs font-semibold">{clip.title}</p>
            <Badge variant="secondary" className="hidden text-[8px] sm:flex">{state.aspectRatio}</Badge>
            <Badge variant="outline" className="hidden text-[8px] md:flex">Demo</Badge>
          </div>
          <p className="truncate text-[9px] text-muted-foreground">
            {formatTimecode(state.inPoint)} – {formatTimecode(state.outPoint)} · {formatDuration(duration)} output
          </p>
        </div>

        <div className="hidden items-center gap-1.5 rounded-lg border border-border/60 bg-background/30 px-2 py-1 lg:flex">
          {saveStatus === 'saving' ? (
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
          ) : (
            <Cloud className="h-3 w-3 text-success" />
          )}
          <span className="text-[9px] text-muted-foreground">
            {saveStatus === 'saving' ? 'Saving…' : `Saved ${lastSaved}`}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
            aria-label="Undo"
            title="Undo (⌘Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
            aria-label="Redo"
            title="Redo (⇧⌘Z)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={saveNow}
            className="hidden rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:block"
            aria-label="Save"
            title="Save (⌘S)"
          >
            <Save className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShortcutsOpen(true)}
            className="hidden rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:block"
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </button>
        </div>

        <Button size="sm" className="ml-1 h-8 px-3 text-[10px]" onClick={() => setExportOpen(true)}>
          <Download className="h-3 w-3" /> Export
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
        <main className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-border/50 bg-card/20 px-3 py-1.5">
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Sparkles className="h-3 w-3 text-primary" /> Live preview
              </span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>Face-tracked crop · {state.aspectRatio} · 1080p</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
              <span className="hidden sm:block">Source {formatTimecode(clip.start)}</span>
              <span className="flex items-center gap-1 rounded bg-secondary/60 px-1.5 py-0.5">
                <Scissors className="h-2.5 w-2.5" /> {state.splitPoints.length} splits
              </span>
            </div>
          </div>

          <div className="min-h-[360px] flex-1 bg-[radial-gradient(ellipse_at_center,hsl(var(--secondary)/.45),hsl(var(--background))_75%)] xl:min-h-0">
            <EditorPreview
              state={state}
              time={time}
              playing={playing}
              onTogglePlay={togglePlay}
              onWordClick={startEditingWord}
              onToggleSafeZones={() => update({ safeZones: !state.safeZones })}
              onToggleMute={() => setMuted((value) => !value)}
              muted={muted}
            />
          </div>

          {editingWord ? (
            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 bg-card/60 px-3 py-2">
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" /> Fix word {editingWord.index + 1} of {words.length}
              </span>
              <input
                value={editingWord.value}
                onChange={(event) => setEditingWord({ ...editingWord, value: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applyWordEdit()
                  if (event.key === 'Escape') setEditingWord(null)
                }}
                autoFocus
                aria-label="Edit caption word"
                className="h-7 min-w-[120px] flex-1 rounded-lg border border-primary/40 bg-background px-2 text-[11px] outline-none ring-2 ring-primary/15 sm:max-w-xs"
              />
              <Button size="sm" className="h-7 text-[10px]" onClick={applyWordEdit}>
                <Check className="h-3 w-3" /> Apply
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => setEditingWord(null)}>
                <X className="h-3 w-3" /> Cancel
              </Button>
            </div>
          ) : null}

          <EditorTimeline
            state={state}
            time={time}
            playing={playing}
            onTogglePlay={togglePlay}
            onSeek={handleSeek}
            onTrim={handleTrim}
            onSplit={split}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </main>

        <aside className="h-[78vh] shrink-0 border-t border-border/70 bg-card/40 xl:h-auto xl:w-[352px] xl:border-l xl:border-t-0">
          <PropertiesPanel
            state={state}
            update={update}
            onResetTrims={() =>
              update({
                inPoint: 0,
                outPoint: initialDuration,
                splitPoints: [],
                captionText: state.captionText || DEFAULT_CAPTION_TEXT,
              })
            }
          />
        </aside>
      </div>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} state={state} clipTitle={clip.title} />

      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} className="sm:max-w-sm" labelledBy="shortcuts-title">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/12 text-primary">
            <Command className="h-4 w-4" />
          </span>
          <div>
            <h2 id="shortcuts-title" className="text-sm font-semibold">Keyboard shortcuts</h2>
            <p className="text-[10px] text-muted-foreground">Edit without leaving the keyboard</p>
          </div>
        </div>
        <div className="mt-4 space-y-1">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.label} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-[11px] text-muted-foreground hover:bg-secondary/50">
              <span>{shortcut.label}</span>
              <span className="flex items-center gap-1">
                {shortcut.keys.map((key) => (
                  <kbd key={key} className="min-w-5 rounded border border-border/80 bg-background/70 px-1 py-0.5 text-center font-mono text-[9px] text-foreground">
                    {key}
                  </kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-lg border border-border/60 bg-background/30 p-2 text-[9px] leading-relaxed text-muted-foreground">
          Shortcuts are disabled while typing in a caption field. Auto-save runs after every change.
        </p>
      </Dialog>
    </div>
  )
}
