'use client'

import * as React from 'react'
import { CaseUpper, Palette, RotateCcw, Sparkles, Type } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/input'
import { captionFonts, captionPresets, getPreset } from '@/lib/caption-presets'
import type { EditorState } from '@/lib/editor'
import type { CaptionAnimation, CaptionPosition } from '@/lib/types'
import { cn } from '@/lib/utils'

const swatches = ['#ffffff', '#facc15', '#22d3ee', '#f472b6', '#a78bfa', '#4ade80', '#fb923c', '#0f172a']
const positions: { value: CaptionPosition; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'middle', label: 'Middle' },
  { value: 'bottom', label: 'Bottom' },
]
const animations: { value: CaptionAnimation; label: string }[] = [
  { value: 'pop', label: 'Pop' },
  { value: 'fade', label: 'Fade' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'none', label: 'None' },
]

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
        {hint ? <span className="text-[9px] tabular-nums text-muted-foreground/70">{hint}</span> : null}
      </div>
      {children}
    </div>
  )
}

function ColorSwatches({
  value,
  onChange,
  allowTransparent,
}: {
  value: string
  onChange: (color: string) => void
  allowTransparent?: boolean
}) {
  const colors = allowTransparent ? ['transparent', ...swatches] : swatches
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-label={color === 'transparent' ? 'Transparent' : `Use ${color}`}
          className={cn(
            'h-5 w-5 rounded-md border border-border/80 transition-transform hover:scale-110',
            value === color && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
          )}
          style={{
            background:
              color === 'transparent'
                ? 'repeating-conic-gradient(#94a3b8 0% 25%, #475569 0% 50%) 50% / 6px 6px'
                : color,
          }}
        />
      ))}
      <label className="relative ml-0.5 grid h-5 w-5 cursor-pointer place-items-center rounded-md border border-dashed border-border text-muted-foreground hover:text-foreground">
        <Palette className="h-2.5 w-2.5" />
        <input
          type="color"
          value={value === 'transparent' ? '#ffffff' : value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Custom color"
        />
      </label>
    </div>
  )
}

export function CaptionsPanel({
  state,
  update,
  onReset,
}: {
  state: EditorState
  update: (patch: Partial<EditorState>) => void
  onReset: () => void
}) {
  const settings = state.captionSettings
  const setSettings = (patch: Partial<typeof settings>) =>
    update({ captionSettings: { ...settings, ...patch } })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/30 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/12 text-primary">
            <Type className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[11px] font-medium">Burned-in captions</p>
            <p className="text-[9px] text-muted-foreground">Rendered into the exported video</p>
          </div>
        </div>
        <Switch checked={state.captionsEnabled} onCheckedChange={(checked) => update({ captionsEnabled: checked })} label="Burned-in captions" />
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Style presets</h3>
          <Badge variant="secondary" className="text-[8px]">{captionPresets.length} styles</Badge>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {captionPresets.map((preset) => {
            const selected = settings.presetId === preset.id
            const preview = preset.settings
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => update({ captionSettings: getPreset(preset.id).settings })}
                className={cn(
                  'group relative overflow-hidden rounded-xl border p-2 text-left transition-all',
                  selected
                    ? 'border-primary/50 bg-primary/[0.07] ring-1 ring-primary/25'
                    : 'border-border/60 bg-background/30 hover:border-border hover:bg-secondary/40',
                )}
              >
                <div
                  className="mb-1.5 flex h-9 items-center justify-center overflow-hidden rounded-md"
                  style={{
                    background:
                      preview.background
                        ? preview.backgroundColor
                        : 'linear-gradient(135deg, #111827, #1e1b4b)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: preview.font,
                      fontWeight: preview.weight,
                      fontSize: 11,
                      color: preview.color,
                      textTransform: preview.uppercase ? 'uppercase' : 'none',
                      WebkitTextStroke:
                        preview.outlineWidth > 0 ? `${Math.min(1, preview.outlineWidth * 0.3)}px ${preview.outlineColor}` : undefined,
                      textShadow: preview.shadow ? '0 1px 3px rgba(0,0,0,.8)' : 'none',
                    }}
                  >
                    Aa <span style={{ color: preview.highlightColor }}>word</span>
                  </span>
                </div>
                <p className="truncate text-[9px] font-medium">{preset.name}</p>
                <p className="truncate text-[8px] text-muted-foreground">{preset.description}</p>
                {selected ? <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" /> : null}
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Caption text</h3>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-2.5 w-2.5" /> Reset
          </button>
        </div>
        <Textarea
          value={state.captionText}
          onChange={(event) => update({ captionText: event.target.value })}
          rows={3}
          className="min-h-[70px] resize-none text-[11px] leading-relaxed"
          aria-label="Caption text"
        />
        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
          <span>{state.captionText.split(/\s+/).filter(Boolean).length} words</span>
          <span className="flex items-center gap-1 text-primary/80">
            <Sparkles className="h-2.5 w-2.5" /> Click a word in the preview to fix it
          </span>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Typography</h3>
        <Field label="Font">
          <select
            value={settings.font}
            onChange={(event) => setSettings({ font: event.target.value })}
            className="h-8 w-full rounded-lg border border-border bg-background/50 px-2 text-[11px] outline-none focus:border-primary/50"
            aria-label="Caption font"
          >
            {captionFonts.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </Field>
        <Field label="Size" hint={`${settings.size}px`}>
          <Slider value={settings.size} min={18} max={64} onValueChange={(size) => setSettings({ size })} label="Caption size" />
        </Field>
        <Field label="Weight" hint={String(settings.weight)}>
          <div className="grid grid-cols-4 gap-1 rounded-lg border border-border/60 bg-secondary/40 p-1">
            {[400, 600, 800, 900].map((weight) => (
              <button
                key={weight}
                type="button"
                onClick={() => setSettings({ weight })}
                className={cn(
                  'rounded-md py-1 text-[9px] transition-colors',
                  settings.weight === weight ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
                style={{ fontWeight: weight }}
              >
                {weight === 400 ? 'Regular' : weight === 600 ? 'Semi' : weight === 800 ? 'Bold' : 'Black'}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Text color">
          <ColorSwatches value={settings.color} onChange={(color) => setSettings({ color })} allowTransparent />
        </Field>
        <Field label="Active word">
          <ColorSwatches value={settings.highlightColor} onChange={(highlightColor) => setSettings({ highlightColor })} />
        </Field>
      </section>

      <section className="space-y-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Outline & background</h3>
        <Field label="Outline width" hint={`${settings.outlineWidth}px`}>
          <Slider value={settings.outlineWidth} min={0} max={6} step={0.5} onValueChange={(outlineWidth) => setSettings({ outlineWidth })} label="Outline width" />
        </Field>
        <Field label="Outline color">
          <ColorSwatches value={settings.outlineColor} onChange={(outlineColor) => setSettings({ outlineColor })} />
        </Field>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-2.5 py-2">
          <span className="text-[10px] text-muted-foreground">Drop shadow</span>
          <Switch checked={settings.shadow} onCheckedChange={(shadow) => setSettings({ shadow })} label="Drop shadow" />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-2.5 py-2">
          <span className="text-[10px] text-muted-foreground">Caption background</span>
          <Switch checked={settings.background} onCheckedChange={(background) => setSettings({ background })} label="Caption background" />
        </div>
        {settings.background ? (
          <Field label="Background color">
            <ColorSwatches value={settings.backgroundColor} onChange={(backgroundColor) => setSettings({ backgroundColor })} />
          </Field>
        ) : null}
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-2.5 py-2">
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><CaseUpper className="h-3 w-3" /> Uppercase</span>
          <Switch checked={settings.uppercase} onCheckedChange={(uppercase) => setSettings({ uppercase })} label="Uppercase" />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-2.5 py-2">
          <span className="text-[10px] text-muted-foreground">Auto emoji on active word</span>
          <Switch checked={settings.emoji} onCheckedChange={(emoji) => setSettings({ emoji })} label="Auto emoji" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Placement & motion</h3>
        <Field label="Position">
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-border/60 bg-secondary/40 p-1">
            {positions.map((position) => (
              <button
                key={position.value}
                type="button"
                onClick={() => setSettings({ position: position.value })}
                className={cn(
                  'rounded-md py-1.5 text-[9px] font-medium transition-colors',
                  settings.position === position.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {position.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Animation">
          <div className="grid grid-cols-4 gap-1 rounded-lg border border-border/60 bg-secondary/40 p-1">
            {animations.map((animation) => (
              <button
                key={animation.value}
                type="button"
                onClick={() => setSettings({ animation: animation.value })}
                className={cn(
                  'rounded-md py-1.5 text-[9px] font-medium transition-colors',
                  settings.animation === animation.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {animation.label}
              </button>
            ))}
          </div>
        </Field>
      </section>

      <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-2.5 text-[9px] leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Live preview.</span> Changes render instantly in the player. Word-level timing comes from Whisper in Phase 3.
      </div>
    </div>
  )
}
