'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  ClipboardPaste,
  CloudUpload,
  FileVideo,
  Link2,
  Loader2,
  Play,
  Sparkles,
  UploadCloud,
  X,
  Youtube,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { cn, formatBytes } from '@/lib/utils'

const ACCEPTED = ['.mp4', '.mov', '.mkv', '.webm']
const MAX_BYTES = 2 * 1024 * 1024 * 1024

function isValidYouTubeUrl(value: string) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]{6,}/i.test(
    value.trim(),
  )
}

export function CreateCard() {
  const router = useRouter()
  const { toast } = useToast()
  const [tab, setTab] = React.useState('youtube')
  const [url, setUrl] = React.useState('')
  const [urlError, setUrlError] = React.useState('')
  const [dragging, setDragging] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [fileError, setFileError] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  function submitYouTube(event: React.FormEvent) {
    event.preventDefault()
    if (!url.trim()) {
      setUrlError('Paste a YouTube link to get started.')
      return
    }
    if (!isValidYouTubeUrl(url)) {
      setUrlError('That doesn’t look like a YouTube link. Try a watch, Shorts or youtu.be URL.')
      return
    }
    setUrlError('')
    router.push(`/new?tab=youtube&url=${encodeURIComponent(url.trim())}`)
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
      setUrlError('')
    } catch {
      toast({
        title: 'Clipboard unavailable',
        description: 'Your browser blocked clipboard access. Paste the link manually.',
        variant: 'error',
      })
    }
  }

  function pickFile(candidate?: File | null) {
    if (!candidate) return
    const extension = `.${candidate.name.split('.').pop()?.toLowerCase() ?? ''}`
    if (!ACCEPTED.includes(extension)) {
      setFileError('Use MP4, MOV, MKV or WebM.')
      return
    }
    if (candidate.size > MAX_BYTES) {
      setFileError('That file is over 2 GB. Compress it or trim it before uploading.')
      return
    }
    setFileError('')
    setFile(candidate)
  }

  function continueUpload() {
    if (!file) {
      inputRef.current?.click()
      return
    }
    router.push(`/new?tab=upload&name=${encodeURIComponent(file.name)}&size=${file.size}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/70 p-1 shadow-soft backdrop-blur-md"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-10 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative rounded-[calc(1.5rem-4px)] border border-white/[0.03] bg-gradient-to-b from-card/40 to-card/10 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="h-3 w-3" /> Create new
            </div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Forge your next viral clip</h2>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Drop a long video or paste a YouTube link. ClipForge finds the moments worth posting.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-background/40 px-3 py-1.5 text-[10px] text-muted-foreground sm:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            Pipeline ready
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mt-5">
          <TabsList className="w-full max-w-xs">
            <TabsTrigger value="youtube" className="flex-1">
              <Youtube className="h-3.5 w-3.5" /> YouTube link
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1">
              <UploadCloud className="h-3.5 w-3.5" /> Upload file
            </TabsTrigger>
          </TabsList>

          <TabsContent value="youtube" className="mt-3">
            <form onSubmit={submitYouTube} className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={url}
                    onChange={(event) => {
                      setUrl(event.target.value)
                      setUrlError('')
                    }}
                    placeholder="https://youtube.com/watch?v=…"
                    aria-label="YouTube video URL"
                    aria-invalid={Boolean(urlError)}
                    aria-describedby={urlError ? 'youtube-url-error' : undefined}
                    className="h-11 w-full rounded-xl border border-border bg-background/60 pl-10 pr-20 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={pasteFromClipboard}
                    className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <ClipboardPaste className="h-3 w-3" /> Paste
                  </button>
                </div>
                <Button type="submit" className="h-11 shrink-0 px-5">
                  Fetch video <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              {urlError ? (
                <p id="youtube-url-error" className="text-[11px] text-destructive">
                  {urlError}
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground">
                  We’ll show a title, thumbnail and duration preview before processing. Hindi, English and Hinglish supported.
                </p>
              )}
            </form>

            <div className="mt-4 flex items-center gap-2 overflow-hidden rounded-xl border border-border/50 bg-background/30 p-2">
              <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.35),transparent_50%)]" />
                <Play className="absolute inset-0 m-auto h-4 w-4 fill-white text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">The Creator Economy Is Changing Faster Than You Think</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">42:18 · English · 1080p source</p>
              </div>
              <span className="hidden rounded-full bg-success/12 px-2 py-0.5 text-[9px] font-semibold text-success sm:block">
                7 clips ready
              </span>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-3">
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload a video file"
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
                'group flex min-h-[148px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-5 text-center transition-all',
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
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                    <FileVideo className="h-5 w-5" />
                  </div>
                  <p className="mt-2 max-w-full truncate text-sm font-medium">{file.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{formatBytes(file.size)} · ready to continue</p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setFile(null)
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" /> Remove
                  </button>
                </>
              ) : (
                <>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:-translate-y-0.5">
                    <CloudUpload className="h-5 w-5" />
                  </div>
                  <p className="mt-2 text-sm font-medium">Drag & drop your video</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    MP4, MOV, MKV or WebM · up to 2 GB · chunked upload
                  </p>
                  <span className="mt-2.5 inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-background/80 px-2.5 text-[10px] font-medium">
                    Browse files
                  </span>
                </>
              )}
            </div>
            {fileError ? <p className="mt-2 text-[11px] text-destructive">{fileError}</p> : null}
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[10px] text-muted-foreground">Your file stays on your workspace storage.</p>
              <Button size="sm" onClick={continueUpload} disabled={!file}>
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/60 pt-3 text-[10px] text-muted-foreground">
          {['Auto language detect', '9:16 face tracking', 'Captions in 12 styles', '3–10 clips per video'].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-success" /> {item}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
