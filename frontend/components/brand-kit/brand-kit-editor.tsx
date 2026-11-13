'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  ImagePlus,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Type,
  UploadCloud,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/components/ui/toast'
import { captionFonts, captionPresets } from '@/lib/caption-presets'
import { cn } from '@/lib/utils'

type BrandKitDraft = {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  font: string
  captionPresetId: string
  logoText: string
  watermark: boolean
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  watermarkOpacity: number
  applyByDefault: boolean
}

const initialKits: BrandKitDraft[] = [
  {
    id: 'studio',
    name: "Alex's Studio",
    primaryColor: '#8b5cf6',
    secondaryColor: '#3b82f6',
    font: 'Inter',
    captionPresetId: 'hormozi',
    logoText: 'AC',
    watermark: true,
    watermarkPosition: 'top-right',
    watermarkOpacity: 70,
    applyByDefault: true,
  },
  {
    id: 'podcast',
    name: 'Deep Dive Podcast',
    primaryColor: '#f97316',
    secondaryColor: '#facc15',
    font: 'Poppins',
    captionPresetId: 'podcast',
    logoText: 'DD',
    watermark: false,
    watermarkPosition: 'bottom-right',
    watermarkOpacity: 55,
    applyByDefault: false,
  },
]

const colorSwatches = [
  '#8b5cf6',
  '#6366f1',
  '#3b82f6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#f97316',
  '#ef4444',
  '#ec4899',
  '#a3a3a3',
]

const watermarkPositions: BrandKitDraft['watermarkPosition'][] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
]

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-border/70 shadow-sm">
          <input
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label={`${label} color picker`}
            className="absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] cursor-pointer border-0 bg-transparent p-0"
          />
        </span>
        <Input
          value={value.toUpperCase()}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} hex value`}
          className="h-9 font-mono text-[11px] uppercase"
        />
      </div>
    </div>
  )
}

export function BrandKitEditor() {
  const { toast } = useToast()
  const [kits, setKits] = React.useState<BrandKitDraft[]>(initialKits)
  const [activeId, setActiveId] = React.useState(initialKits[0].id)
  const [saved, setSaved] = React.useState(true)
  const [dirty, setDirty] = React.useState(false)

  const active = kits.find((kit) => kit.id === activeId) ?? kits[0]
  const preset = captionPresets.find((item) => item.id === active.captionPresetId) ?? captionPresets[0]

  const handleSave = React.useCallback(() => {
    setSaved(true)
    setDirty(false)
    toast({
      title: 'Brand kit saved',
      description: `${active.name} will be applied to new projects and exports.`,
      variant: 'success',
    })
  }, [active.name, toast])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSave])

  function update(patch: Partial<BrandKitDraft>) {
    setKits((current) => current.map((kit) => (kit.id === activeId ? { ...kit, ...patch } : kit)))
    setSaved(false)
    setDirty(true)
  }

  function handleReset() {
    const original = initialKits.find((kit) => kit.id === activeId)
    if (!original) return
    setKits((current) => current.map((kit) => (kit.id === activeId ? original : kit)))
    setSaved(true)
    setDirty(false)
    toast({ title: 'Changes reverted', description: 'Brand kit restored to the last saved version.' })
  }

  function handleCreate() {
    const id = `kit-${Date.now()}`
    const next: BrandKitDraft = {
      ...initialKits[0],
      id,
      name: 'New brand kit',
      logoText: 'NK',
      applyByDefault: false,
    }
    setKits((current) => [...current, next])
    setActiveId(id)
    setSaved(false)
    setDirty(true)
  }

  function handleDelete() {
    if (kits.length <= 1) {
      toast({ title: 'Keep at least one kit', variant: 'error' })
      return
    }
    const remaining = kits.filter((kit) => kit.id !== activeId)
    setKits(remaining)
    setActiveId(remaining[0].id)
    toast({ title: 'Brand kit deleted' })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/12 text-primary">
              <Palette className="h-3.5 w-3.5" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Studio</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Brand kit</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Lock in your colors, fonts, logo and default captions so every clip ships on-brand.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset} disabled={!dirty}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button size="sm" onClick={handleSave}>
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
        <aside className="space-y-2">
          <div className="rounded-2xl border border-border/70 bg-card/50 p-2 shadow-soft">
            <p className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
              Your kits
            </p>
            <div className="space-y-1">
              {kits.map((kit) => {
                const selected = kit.id === activeId
                return (
                  <button
                    key={kit.id}
                    type="button"
                    onClick={() => {
                      setActiveId(kit.id)
                      setDirty(false)
                      setSaved(true)
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors',
                      selected ? 'bg-secondary text-foreground ring-1 ring-border/70' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                    )}
                  >
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-bold text-white shadow-sm"
                      style={{ backgroundImage: `linear-gradient(135deg, ${kit.primaryColor}, ${kit.secondaryColor})` }}
                    >
                      {kit.logoText || kit.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium">{kit.name}</span>
                      <span className="block text-[10px] text-muted-foreground">
                        {kit.applyByDefault ? 'Default for new projects' : 'Manual apply'}
                      </span>
                    </span>
                    {selected ? <Check className="h-3.5 w-3.5 text-primary" /> : null}
                  </button>
                )
              })}
            </div>
            <Button variant="ghost" size="sm" className="mt-1 w-full justify-start" onClick={handleCreate}>
              <Plus className="h-3.5 w-3.5" /> New brand kit
            </Button>
          </div>

          <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Auto-apply
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              Kits apply to new projects, thumbnails and burned captions. You can always override per clip.
            </p>
          </div>
        </aside>

        <div className="space-y-4">
          <section className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <Palette className="h-3.5 w-3.5 text-primary" /> Identity
              </h2>
              {active.applyByDefault ? <Badge variant="success">Default</Badge> : null}
            </div>
            <div className="space-y-3">
              <div>
                <label htmlFor="brand-name" className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                  Brand name
                </label>
                <Input
                  id="brand-name"
                  value={active.name}
                  onChange={(event) => update({ name: event.target.value })}
                  placeholder="Your studio or channel"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <ColorField label="Primary color" value={active.primaryColor} onChange={(value) => update({ primaryColor: value })} />
                <ColorField label="Secondary color" value={active.secondaryColor} onChange={(value) => update({ secondaryColor: value })} />
              </div>
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Quick palette</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {colorSwatches.map((swatch) => {
                    const selected = active.primaryColor.toLowerCase() === swatch
                    return (
                      <button
                        key={swatch}
                        type="button"
                        aria-label={`Use ${swatch} as primary color`}
                        aria-pressed={selected}
                        onClick={() => update({ primaryColor: swatch })}
                        className={cn(
                          'h-6 w-6 rounded-full border border-black/10 transition-transform hover:scale-110 dark:border-white/15',
                          selected && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
                        )}
                        style={{ backgroundColor: swatch }}
                      />
                    )
                  })}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="brand-font" className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                    Display font
                  </label>
                  <select
                    id="brand-font"
                    value={active.font}
                    onChange={(event) => update({ font: event.target.value })}
                    className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25"
                  >
                    {captionFonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="brand-preset" className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                    Default caption preset
                  </label>
                  <select
                    id="brand-preset"
                    value={active.captionPresetId}
                    onChange={(event) => update({ captionPresetId: event.target.value })}
                    className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25"
                  >
                    {captionPresets.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-soft">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <ImagePlus className="h-3.5 w-3.5 text-primary" /> Logo
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border/80 bg-secondary/40">
                <div
                  className="grid h-14 w-14 place-items-center rounded-xl text-sm font-bold text-white shadow-sm"
                  style={{ backgroundImage: `linear-gradient(135deg, ${active.primaryColor}, ${active.secondaryColor})` }}
                >
                  {active.logoText || 'CF'}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="rounded-xl border border-dashed border-border/80 bg-background/40 p-3 text-center">
                  <UploadCloud className="mx-auto h-4 w-4 text-muted-foreground" />
                  <p className="mt-1 text-[11px] font-medium">Drop a PNG or SVG logo</p>
                  <p className="text-[10px] text-muted-foreground">Transparent background · up to 2 MB</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      toast({
                        title: 'Logo upload is coming in Phase 2',
                        description: 'This UI is wired for the storage service that lands with the backend.',
                      })
                    }
                  >
                    Choose file
                  </Button>
                </div>
                <div>
                  <label htmlFor="logo-text" className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                    Fallback monogram
                  </label>
                  <Input
                    id="logo-text"
                    value={active.logoText}
                    maxLength={3}
                    onChange={(event) => update({ logoText: event.target.value.toUpperCase() })}
                    className="h-9 w-24 text-center font-semibold uppercase"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <Type className="h-3.5 w-3.5 text-primary" /> Watermark
              </h2>
              <Switch
                checked={active.watermark}
                onCheckedChange={(checked) => update({ watermark: checked })}
                label="Show watermark"
              />
            </div>
            <div className={cn('space-y-3 transition-opacity', !active.watermark && 'pointer-events-none opacity-50')}>
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Position</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {watermarkPositions.map((position) => (
                    <button
                      key={position}
                      type="button"
                      onClick={() => update({ watermarkPosition: position })}
                      className={cn(
                        'rounded-lg border px-2 py-1.5 text-[10px] capitalize transition-colors',
                        active.watermarkPosition === position
                          ? 'border-primary/40 bg-primary/10 text-foreground'
                          : 'border-border/70 text-muted-foreground hover:bg-secondary/60',
                      )}
                    >
                      {position.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-muted-foreground">Opacity</span>
                  <span className="tabular-nums text-muted-foreground">{active.watermarkOpacity}%</span>
                </div>
                <Slider
                  value={active.watermarkOpacity}
                  min={10}
                  max={100}
                  onValueChange={(value) => update({ watermarkOpacity: value })}
                  label="Watermark opacity"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-border/70 bg-card/40 p-3.5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-medium">Use as default for new projects</p>
              <p className="text-[10px] text-muted-foreground">You can still switch kits inside any project.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5" /> Delete kit
              </Button>
              <Switch checked={active.applyByDefault} onCheckedChange={(checked) => update({ applyByDefault: checked })} label="Default kit" />
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/70 shadow-soft">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Live preview</span>
              <Badge variant="outline" className="text-[9px]">9:16</Badge>
            </div>
            <div className="p-4">
              <div
                className="relative mx-auto aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-2xl"
                style={{ backgroundImage: `linear-gradient(160deg, ${active.primaryColor}, ${active.secondaryColor})` }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,.35),transparent_55%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,.72),transparent_55%)]" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="relative h-28 w-24">
                    <div className="absolute left-1/2 top-0 h-11 w-11 -translate-x-1/2 rounded-full bg-white/85" />
                    <div className="absolute bottom-0 left-1/2 h-16 w-20 -translate-x-1/2 rounded-t-[2rem] bg-white/75" />
                  </div>
                </div>
                {active.watermark ? (
                  <div
                    className={cn(
                      'absolute flex items-center gap-1 rounded-md bg-slate-950/45 px-1.5 py-1 text-[8px] font-semibold text-white backdrop-blur-sm',
                      active.watermarkPosition === 'top-left' && 'left-2 top-2',
                      active.watermarkPosition === 'top-right' && 'right-2 top-2',
                      active.watermarkPosition === 'bottom-left' && 'bottom-2 left-2',
                      active.watermarkPosition === 'bottom-right' && 'bottom-2 right-2',
                    )}
                    style={{ opacity: active.watermarkOpacity / 100 }}
                  >
                    <span
                      className="grid h-3.5 w-3.5 place-items-center rounded text-[6px] font-bold text-white"
                      style={{ backgroundImage: `linear-gradient(135deg, ${active.primaryColor}, ${active.secondaryColor})` }}
                    >
                      {active.logoText || 'CF'}
                    </span>
                    {active.name}
                  </div>
                ) : null}
                <div className="absolute inset-x-3 bottom-7 text-center">
                  <p
                    className="text-[13px] font-black uppercase leading-tight tracking-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,.6)]"
                    style={{ fontFamily: active.font }}
                  >
                    This hook stops the scroll
                  </p>
                  <p
                    className="mt-0.5 text-[9px] font-medium text-white/80"
                    style={{ fontFamily: active.font }}
                  >
                    {preset.name} · {active.font}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Caption preset</span>
                  <span className="font-medium">{preset.name}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Font</span>
                  <span className="font-medium">{active.font}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Watermark</span>
                  <span className="font-medium">{active.watermark ? 'On' : 'Off'}</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="h-5 flex-1 rounded-md" style={{ backgroundColor: active.primaryColor }} />
                  <span className="h-5 flex-1 rounded-md" style={{ backgroundColor: active.secondaryColor }} />
                  <span className="h-5 flex-1 rounded-md border border-border/60 bg-card" />
                </div>
              </div>
            </div>
            <div className="border-t border-border/60 p-3">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() =>
                  toast({
                    title: 'Preview refreshed',
                    description: 'Live preview already reflects your latest edits.',
                  })
                }
              >
                <Sparkles className="h-3.5 w-3.5" /> Refresh preview
              </Button>
            </div>
          </div>

          {dirty ? (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-center text-[10px] text-muted-foreground"
            >
              Unsaved changes · press <kbd className="rounded border border-border/70 bg-secondary px-1">⌘S</kbd> to save
            </motion.p>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
