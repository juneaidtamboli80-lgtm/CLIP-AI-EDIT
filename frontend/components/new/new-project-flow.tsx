'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardPaste,
  CloudUpload,
  FileVideo,
  Film,
  Link2,
  Loader2,
  MonitorPlay,
  RectangleHorizontal,
  RectangleVertical,
  ScanFace,
  Sparkles,
  Square,
  Subtitles,
  UploadCloud,
  Wand2,
  X,
  Youtube,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { ProcessingOverlay } from '@/components/new/processing-overlay'
import { captionPresets } from '@/lib/caption-presets'
import { projects } from '@/lib/mock-data'
import type { AspectRatio } from '@/lib/types'
import { cn, formatBytes, formatDuration } from '@/lib/utils'

const demoProject = projects[0]

const stepLabels = ['Source', 'Settings', 'Review']

function isValidYouTubeUrl(value: string) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]{6,}/i.test(
    value.trim(),
  )
}

const aspects: { value: AspectRatio; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: '9:16', label: 'Vertical', icon: RectangleVertical },
  { value: '1:1', label: 'Square', icon: Square },
  { value: '16:9', label: 'Landscape', icon: RectangleHorizontal },
]

const lengths = ['15–30s', '30–60s', 'Auto']

export function NewProjectFlow({
  initialTab = 'youtube',
  initialUrl = '',
  initialName = '',
  initialSize = '',
}: {
  initialTab?: string
  initialUrl?: string
  initialName?: string
  initialSize?: string
}) {
  const { toast } = useToast()
  const [tab, setTab] = React.useState(initialTab === 'upload' ? 'upload' : 'youtube')
  const [url, setUrl] = React.useState(initialUrl)
  const [previewed, setPreviewed] = React.useState(Boolean(initialUrl && isValidYouTubeUrl(initialUrl)))
  const [fetching, setFetching] = React.useState(false)
  const [urlError, setUrlError] = React.useState('')
  const [dragging, setDragging] = React.useState(false)
  const [file, setFile] = React.useState<{ name: string; size: number } | null>(
    initialName ? { name: initialName, size: Number(initialSize) || 0 } : null,
  )
  const [fileError, setFileError] = React.useState('')
  const [language, setLanguage] = React.useState('auto')
  const [clipCount, setClipCount] = React.useState(7)
  const [clipLength, setClipLength] = React.useState('30–60s')
  const [aspect, setAspect] = React.useState<AspectRatio>('9:16')
  const [captionPreset, setCaptionPreset] = React.useState('hormozi')
  const [faceTracking, setFaceTracking] = React.useState(true)
  const [removeSilences, setRemoveSilences] = React.useState(true)
  const [autoCaptions, setAutoCaptions] = React.useState(true)
  const [processingOpen, setProcessingOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const hasSource = tab === 'youtube' ? previewed : Boolean(file)
  const sourceTitle = tab === 'youtube' && previewed ? demoProject.title : file?.name ?? 'No source selected'
  const sourceDuration = tab === 'youtube' && previewed ? demoProject.duration : 0
  const creditsEstimate = Math.max(4, Math.round((sourceDuration / 60) * 1.5 + clipCount * 2))

  function fetchPreview(event?: React.FormEvent) {
    event?.preventDefault()
    if (!isValidYouTubeUrl(url)) {
      setUrlError('Paste a valid YouTube watch, Shorts or youtu.be link.')
      return
    }
    setUrlError('')
    setFetching(true)
    window.setTimeout(() => {
      setFetching(false)
      setPreviewed(true)
      toast({
        title: 'Video preview loaded',
        description: 'Demo metadata shown. yt-dlp metadata fetching is wired up in Phase 2.',
        variant: 'info',
      })
    }, 900)
  }

  async function pasteUrl() {
    try {
      setUrl(await navigator.clipboard.readText())
      setUrlError('')
    } catch {
      toast({ title: 'Clipboard blocked', description: 'Paste the link manually.', variant: 'error' })
    }
  }

  function pickFile(candidate?: File | null) {
    if (!candidate) return
    const extension = `.${candidate.name.split('.').pop()?.toLowerCase() ?? ''}`
    if (!['.mp4', '.mov', '.mkv', '.webm'].includes(extension)) {
      setFileError('Use MP4, MOV, MKV or WebM.')
      return
    }
    if (candidate.size > 2 * 1024 * 1024 * 1024) {
      setFileError('Maximum file size is 2 GB.')
      return
    }
    setFileError('')
    setFile({ name: candidate.name, size: candidate.size })
    setTab('upload')
  }

  function start() {
    if (!hasSource) {
      toast({
        title: 'Add a source first',
        description: 'Paste a YouTube link or choose a video file.',
        variant: 'error',
      })
      return
    }
    setProcessingOpen(true)
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to dashboard
        </Link>
        <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/20 bg-primary/[0.06] text-[9px] uppercase tracking-[0.16em] text-primary">
                <Sparkles className="h-2.5 w-2.5" /> New project
              </Badge>
              <span className="text-[10px] text-muted-foreground">Step 1 of 3 · Source & settings</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Feed the forge. <span className="gradient-text">Get clips.</span>
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Import a long video and ClipForge will transcribe it, find the strongest moments, and frame them for vertical.
            </p>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            {stepLabels.map((label, index) => (
              <React.Fragment key={label}>
                <span
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium',
                    index === 0
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-border/70 bg-card/50 text-muted-foreground',
                  )}
                >
                  <span className={cn('grid h-4 w-4 place-items-center rounded-full text-[8px]', index === 0 ? 'bg-primary text-white' : 'bg-secondary')}>
                    {index + 1}
                  </span>
                  {label}
                </span>
                {index < stepLabels.length - 1 ? <span className="h-px w-3 bg-border" /> : null}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-soft sm:p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/12 text-primary">
                <Film className="h-3.5 w-3.5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Source video</h2>
                <p className="text-[10px] text-muted-foreground">YouTube link or a file from your device</p>
              </div>
            </div>

            <Tabs value={tab} onValueChange={setTab} className="mt-4">
              <TabsList className="w-full max-w-xs">
                <TabsTrigger value="youtube" className="flex-1">
                  <Youtube className="h-3.5 w-3.5" /> YouTube
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex-1">
                  <UploadCloud className="h-3.5 w-3.5" /> Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="youtube" className="mt-3 space-y-3">
                <form onSubmit={fetchPreview} className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={url}
                      onChange={(event) => {
                        setUrl(event.target.value)
                        setPreviewed(false)
                        setUrlError('')
                      }}
                      placeholder="https://youtube.com/watch?v=…"
                      aria-label="YouTube URL"
                      className="h-11 w-full rounded-xl border border-border bg-background/60 pl-10 pr-20 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={pasteUrl}
                      className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <ClipboardPaste className="h-3 w-3" /> Paste
                    </button>
                  </div>
                  <Button type="submit" variant="secondary" className="h-11" disabled={fetching}>
                    {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Youtube className="h-4 w-4" />}
                    {fetching ? 'Fetching…' : 'Fetch preview'}
                  </Button>
                </form>
                {urlError ? <p className="text-[11px] text-destructive">{urlError}</p> : null}

                {previewed ? (
                  <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/40 p-3 sm:flex-row sm:items-center">
                    <div className={cn('relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br sm:w-44', demoProject.thumbnail)}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.35),transparent_55%)]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                      <div className="absolute inset-0 grid place-items-center">
                        <span className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-white/15 backdrop-blur-md">
                          <MonitorPlay className="h-4 w-4 text-white" />
                        </span>
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 rounded bg-slate-950/70 px-1.5 py-0.5 text-[9px] font-medium text-white">
                        {formatDuration(demoProject.duration)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">Preview loaded</p>
                      <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug">{demoProject.title}</h3>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Creator Economy Podcast · 1080p · English (auto-detected)
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="text-[9px]">42:18</Badge>
                        <Badge variant="secondary" className="text-[9px]">YouTube</Badge>
                        <Badge variant="success" className="text-[9px]">Metadata OK</Badge>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewed(false)}
                      className="self-start rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground sm:self-center"
                      aria-label="Remove preview"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/70 bg-background/20 px-3 py-2.5 text-[10px] text-muted-foreground">
                    Preview mode uses demo metadata. yt-dlp title, thumbnail and duration fetching arrives in Phase 2.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upload" className="mt-3">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      inputRef.current?.click()
                    }
                  }}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault()
                    setDragging(false)
                    pickFile(event.dataTransfer.files?.[0])
                  }}
                  className={cn(
                    'flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition-all',
                    dragging
                      ? 'border-primary bg-primary/10 ring-4 ring-primary/10'
                      : 'border-border bg-background/30 hover:border-primary/50 hover:bg-primary/[0.04]',
                  )}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".mp4,.mov,.mkv,.webm,video/*"
                    className="sr-only"
                    onChange={(event) => pickFile(event.target.files?.[0])}
                  />
                  {file ? (
                    <>
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                        <FileVideo className="h-6 w-6" />
                      </div>
                      <p className="mt-3 max-w-full truncate text-sm font-medium">{file.name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {file.size ? `${formatBytes(file.size)} · ` : ''}Ready for chunked upload (5 MB chunks)
                      </p>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setFile(null)
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" /> Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                        <CloudUpload className="h-6 w-6" />
                      </div>
                      <p className="mt-3 text-sm font-medium">Drag & drop your video here</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">MP4, MOV, MKV, WebM · up to 2 GB</p>
                      <span className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background/80 px-3 text-[11px] font-medium">
                        Browse files
                      </span>
                    </>
                  )}
                </div>
                {fileError ? <p className="mt-2 text-[11px] text-destructive">{fileError}</p> : null}
                <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Zap className="h-3 w-3 text-primary" /> Uploads resume automatically if your connection drops.
                </p>
              </TabsContent>
            </Tabs>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-soft sm:p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/12 text-accent">
                <Wand2 className="h-3.5 w-3.5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Clip settings</h2>
                <p className="text-[10px] text-muted-foreground">You can fine-tune every clip in the editor later</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Spoken language</span>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border border-border bg-background/60 px-3 pr-8 text-xs outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="auto">Auto-detect (recommended)</option>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="hinglish">Hinglish (Hindi + English)</option>
                    <option value="es">Spanish</option>
                    <option value="ar">Arabic</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </label>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted-foreground">Number of clips</span>
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">{clipCount}</span>
                </div>
                <div className="flex h-10 items-center">
                  <Slider value={clipCount} min={3} max={10} onValueChange={setClipCount} label="Number of clips" />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>3</span>
                  <span>10</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Target clip length</span>
                <div className="grid grid-cols-3 gap-1 rounded-xl border border-border/70 bg-secondary/50 p-1">
                  {lengths.map((length) => (
                    <button
                      key={length}
                      type="button"
                      onClick={() => setClipLength(length)}
                      className={cn(
                        'rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors',
                        clipLength === length ? 'bg-card text-foreground shadow-sm ring-1 ring-border/60' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {length}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Aspect ratio</span>
                <div className="grid grid-cols-3 gap-1 rounded-xl border border-border/70 bg-secondary/50 p-1">
                  {aspects.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setAspect(item.value)}
                      className={cn(
                        'flex items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-medium transition-colors',
                        aspect === item.value ? 'bg-card text-foreground shadow-sm ring-1 ring-border/60' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <item.icon className="h-3 w-3" /> {item.value}
                    </button>
                  ))}
                </div>
              </div>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-[11px] font-medium text-muted-foreground">Default caption style</span>
                <div className="relative">
                  <select
                    value={captionPreset}
                    onChange={(event) => setCaptionPreset(event.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border border-border bg-background/60 px-3 pr-8 text-xs outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  >
                    {captionPresets.slice(0, 6).map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name} — {preset.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </label>
            </div>

            <div className="mt-4 grid gap-2.5 border-t border-border/60 pt-4 sm:grid-cols-3">
              {[
                { label: 'Face tracking', description: 'Auto-crop to speaker', checked: faceTracking, set: setFaceTracking, icon: ScanFace },
                { label: 'Remove silences', description: 'Tighten dead air', checked: removeSilences, set: setRemoveSilences, icon: Zap },
                { label: 'Auto captions', description: 'Word-level timing', checked: autoCaptions, set: setAutoCaptions, icon: Subtitles },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/30 px-2.5 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <item.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-medium">{item.label}</p>
                      <p className="truncate text-[9px] text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <Switch checked={item.checked} onCheckedChange={item.set} label={item.label} />
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/70 shadow-soft backdrop-blur-sm">
            <div className="border-b border-border/60 p-4">
              <h2 className="text-sm font-semibold">Project summary</h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Everything before the forge fires</p>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-start gap-2.5">
                <div className={cn('relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br', hasSource ? (tab === 'youtube' ? demoProject.thumbnail : 'from-slate-600 to-slate-800') : 'from-secondary to-secondary')}>
                  {hasSource ? <Film className="h-5 w-5 text-white/90" /> : <CloudUpload className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-xs font-medium leading-snug">{sourceTitle}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {hasSource
                      ? `${tab === 'youtube' ? `${formatDuration(sourceDuration)} · YouTube` : formatBytes(file?.size ?? 0)}`
                      : 'Waiting for a source'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-border/60 bg-background/30 p-3 text-[10px]">
                {[
                  ['Clips', `${clipCount} · ${clipLength}`],
                  ['Aspect', `${aspect} ${aspect === '9:16' ? 'vertical' : aspect === '1:1' ? 'square' : 'landscape'}`],
                  ['Language', language === 'auto' ? 'Auto-detect' : language === 'hinglish' ? 'Hinglish' : language.toUpperCase()],
                  ['Captions', autoCaptions ? captionPresets.find((preset) => preset.id === captionPreset)?.name ?? 'On' : 'Off'],
                  ['Face tracking', faceTracking ? 'On' : 'Off'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-right font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/[0.06] px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Zap className="h-3 w-3 text-primary" /> Estimated credits
                </span>
                <span className="text-sm font-semibold tabular-nums text-primary">{creditsEstimate}</span>
              </div>

              <Button className="w-full" size="lg" onClick={start} disabled={!hasSource}>
                <Sparkles className="h-4 w-4" /> Start AI clipping
              </Button>
              <p className="text-center text-[9px] leading-relaxed text-muted-foreground">
                Phase 1 preview: this runs a simulated demo pipeline. Real processing is wired in Phase 2.
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground">
                <Check className="h-3 w-3 text-success" /> You can cancel before rendering
              </div>
            </div>
          </div>
        </aside>
      </div>

      <ProcessingOverlay open={processingOpen} onOpenChange={setProcessingOpen} projectTitle={sourceTitle} />
    </div>
  )
}
