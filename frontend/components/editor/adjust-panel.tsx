'use client'

import Link from 'next/link'
import { ArrowUpRight, Gauge, Image as ImageIcon, Music2, Palette, Sparkles, Timer, Volume2, Wand2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { aspectOptions, backgroundPresets, musicTracks } from '@/lib/editor'
import type { EditorState } from '@/lib/editor'
import { cn, formatTimecode } from '@/lib/utils'

const backgroundModes = [
  { value: 'blur' as const, label: 'Blur', icon: Wand2 },
  { value: 'color' as const, label: 'Color', icon: Palette },
  { value: 'image' as const, label: 'Image', icon: ImageIcon },
]

export function AdjustPanel({
  state,
  update,
  onResetTrims,
}: {
  state: EditorState
  update: (patch: Partial<EditorState>) => void
  onResetTrims: () => void
}) {
  const duration = state.outPoint - state.inPoint

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border/60 bg-background/30 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/12 text-emerald-400">
              <Gauge className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[11px] font-medium">Clip settings</p>
              <p className="text-[9px] text-muted-foreground">{formatTimecode(state.inPoint)} – {formatTimecode(state.outPoint)}</p>
            </div>
          </div>
          <button type="button" onClick={onResetTrims} className="text-[9px] text-muted-foreground hover:text-foreground">
            Reset trim
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-lg bg-secondary/50 px-2 py-1.5 text-[9px]">
          <span className="text-muted-foreground">Output duration</span>
          <span className="font-mono font-medium">{formatTimecode(duration)}</span>
        </div>
      </div>

      <section className="space-y-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Aspect ratio</h3>
        <div className="grid grid-cols-3 gap-1.5">
          {aspectOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => update({ aspectRatio: option.value })}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-colors',
                state.aspectRatio === option.value
                  ? 'border-primary/40 bg-primary/[0.06] ring-1 ring-primary/20'
                  : 'border-border/60 bg-background/30 hover:bg-secondary/40',
              )}
            >
              <span className="flex h-8 w-full items-center justify-center">
                <span
                  className={cn(
                    'rounded border-2',
                    state.aspectRatio === option.value ? 'border-primary bg-primary/20' : 'border-muted-foreground/40',
                    option.value === '9:16' && 'h-8 w-[18px]',
                    option.value === '1:1' && 'h-7 w-7',
                    option.value === '16:9' && 'h-5 w-8',
                  )}
                />
              </span>
              <span className="text-[8px] font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Background</h3>
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-border/60 bg-secondary/40 p-1">
          {backgroundModes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => update({ background: mode.value })}
              className={cn(
                'flex items-center justify-center gap-1 rounded-md py-1.5 text-[9px] font-medium transition-colors',
                state.background === mode.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <mode.icon className="h-3 w-3" /> {mode.label}
            </button>
          ))}
        </div>
        {state.background === 'color' ? (
          <div className="flex items-center gap-1.5">
            {['#0b1020', '#111827', '#1e1b4b', '#3b0764', '#022c22', '#431407'].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => update({ backgroundColor: color })}
                className={cn('h-6 flex-1 rounded-md border border-border/70', state.backgroundColor === color && 'ring-2 ring-primary ring-offset-1 ring-offset-background')}
                style={{ backgroundColor: color }}
                aria-label={`Background ${color}`}
              />
            ))}
          </div>
        ) : null}
        {state.background === 'image' ? (
          <div className="grid grid-cols-4 gap-1.5">
            {backgroundPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => update({ backgroundImage: preset.value })}
                className={cn(
                  'h-10 overflow-hidden rounded-lg border border-border/70 text-[7px] font-medium text-white/90 transition-transform hover:scale-[1.03]',
                  state.backgroundImage === preset.value && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                )}
                style={{ backgroundImage: preset.value }}
              >
                <span className="flex h-full items-end justify-center bg-slate-950/20 pb-0.5">{preset.label}</span>
              </button>
            ))}
          </div>
        ) : null}
        <p className="text-[8px] leading-relaxed text-muted-foreground/70">
          Background fills the frame behind your speaker crop. Real face-tracked video compositing lands in Phase 5.
        </p>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Logo / watermark</h3>
          <Switch checked={state.logoEnabled} onCheckedChange={(logoEnabled) => update({ logoEnabled })} label="Logo watermark" />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((position) => (
            <button
              key={position}
              type="button"
              onClick={() => update({ logoPosition: position })}
              disabled={!state.logoEnabled}
              className={cn(
                'relative h-10 rounded-lg border border-border/60 bg-background/30 transition-colors disabled:opacity-40',
                state.logoPosition === position && state.logoEnabled && 'border-primary/40 bg-primary/[0.06] ring-1 ring-primary/20',
              )}
              aria-label={`Logo position ${position}`}
            >
              <span className={cn('absolute h-2 w-4 rounded-sm bg-primary/60', position === 'top-left' && 'left-1.5 top-1.5', position === 'top-right' && 'right-1.5 top-1.5', position === 'bottom-left' && 'bottom-1.5 left-1.5', position === 'bottom-right' && 'bottom-1.5 right-1.5')} />
              <span className="absolute inset-0 grid place-items-center text-[7px] capitalize text-muted-foreground">{position.replace('-', ' ')}</span>
            </button>
          ))}
        </div>
        <Link href="/brand-kit" className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-2.5 py-2 text-[9px] text-muted-foreground transition-colors hover:text-foreground">
          <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-primary" /> Brand kit colors & logo</span>
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </section>

      <section className="space-y-2">
        <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Music2 className="h-3 w-3" /> Background music
        </h3>
        <select
          value={state.music}
          onChange={(event) => update({ music: event.target.value })}
          aria-label="Background music track"
          className="h-8 w-full rounded-lg border border-border bg-background/50 px-2 text-[10px] outline-none focus:border-primary/50"
        >
          {musicTracks.map((track) => (
            <option key={track.id} value={track.id}>{track.label}{track.bpm !== '—' ? ` · ${track.bpm}` : ''}</option>
          ))}
        </select>
        {state.music !== 'none' ? (
          <div className="space-y-1.5">
            <div className="flex h-8 items-center gap-[2px] overflow-hidden rounded-lg border border-border/50 bg-background/30 px-1.5">
              {Array.from({ length: 56 }, (_, index) => (
                <span key={index} className="flex-1 rounded-full bg-emerald-400/50" style={{ height: `${20 + Math.abs(Math.sin(index * 0.8)) * 60}%` }} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="h-3 w-3 shrink-0 text-muted-foreground" />
              <Slider value={state.musicVolume} min={0} max={100} onValueChange={(musicVolume) => update({ musicVolume })} label="Music volume" />
              <span className="w-7 text-right text-[9px] tabular-nums text-muted-foreground">{state.musicVolume}%</span>
            </div>
          </div>
        ) : null}
        <p className="text-[8px] text-muted-foreground/70">Music library and ducking are added in Phase 5.</p>
      </section>

      <section className="space-y-2">
        <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Timer className="h-3 w-3" /> Speed & cleanup
        </h3>
        <div className="flex items-center gap-2">
          <Slider value={state.speed} min={0.5} max={2} step={0.05} onValueChange={(speed) => update({ speed })} label="Playback speed" />
          <span className="w-9 text-right text-[9px] font-medium tabular-nums text-primary">{state.speed.toFixed(2)}×</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[0.75, 1, 1.25, 1.5].map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => update({ speed })}
              className={cn(
                'rounded-md border py-1 text-[8px] transition-colors',
                Math.abs(state.speed - speed) < 0.01 ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border/60 text-muted-foreground hover:text-foreground',
              )}
            >
              {speed}×
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-2.5 py-2">
          <div>
            <p className="text-[10px] text-muted-foreground">Auto-remove silences</p>
            <p className="text-[8px] text-muted-foreground/70">Trim dead air between sentences</p>
          </div>
          <Switch checked={state.removeSilences} onCheckedChange={(removeSilences) => update({ removeSilences })} label="Auto-remove silences" />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-2.5 py-2">
          <span className="text-[10px] text-muted-foreground">Intro animation</span>
          <Switch checked={state.intro} onCheckedChange={(intro) => update({ intro })} label="Intro animation" />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-2.5 py-2">
          <span className="text-[10px] text-muted-foreground">Outro card</span>
          <Switch checked={state.outro} onCheckedChange={(outro) => update({ outro })} label="Outro card" />
        </div>
      </section>
    </div>
  )
}
