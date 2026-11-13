'use client'

import * as React from 'react'
import { Captions, Download, Flame, Globe2, Languages, Sparkles } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { subtitleLanguages } from '@/lib/caption-presets'
import { makeCues, translations } from '@/lib/editor'
import type { EditorState } from '@/lib/editor'
import { downloadTextFile, toSrt, toVtt } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function SubtitlesPanel({
  state,
  update,
}: {
  state: EditorState
  update: (patch: Partial<EditorState>) => void
}) {
  const { toast } = useToast()
  const duration = Math.max(1, state.outPoint - state.inPoint)
  const language = subtitleLanguages.find((item) => item.code === state.subtitleLanguage) ?? subtitleLanguages[0]
  const translated = state.subtitleLanguage !== 'en'
  const exportText = translated ? state.translatedText : state.captionText

  function translate() {
    if (!translated) {
      toast({ title: 'Already in English', description: 'Pick another language to translate.', variant: 'info' })
      return
    }
    update({ translatedText: translations[state.subtitleLanguage] ?? translations.en })
    toast({
      title: `Translated to ${language.label}`,
      description: 'Demo translation shown. The LLM translation endpoint is wired in Phase 4.',
      variant: 'success',
    })
  }

  function exportSubtitles(format: 'srt' | 'vtt') {
    const cues = makeCues(exportText, duration, 8)
    const content = format === 'srt' ? toSrt(cues) : toVtt(cues)
    downloadTextFile(`clipforge-${state.subtitleLanguage}.${format}`, content, format === 'srt' ? 'text/plain' : 'text/vtt')
    toast({ title: `${format.toUpperCase()} downloaded`, description: `${cues.length} cues · ${language.label}`, variant: 'success' })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/30 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/12 text-accent">
            <Languages className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[11px] font-medium">Subtitles</p>
            <p className="text-[9px] text-muted-foreground">Translate, style and export</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[8px]">{subtitleLanguages.length} languages</Badge>
      </div>

      <section className="space-y-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Target language</h3>
        <div className="relative">
          <Globe2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <select
            value={state.subtitleLanguage}
            onChange={(event) => {
              const code = event.target.value
              update({ subtitleLanguage: code, translatedText: translations[code] ?? translations.en })
            }}
            aria-label="Subtitle language"
            className="h-9 w-full appearance-none rounded-xl border border-border bg-background/50 pl-8 pr-7 text-[11px] outline-none focus:border-primary/50"
          >
            {subtitleLanguages.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label} — {item.native}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[8px] text-muted-foreground">▾</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {subtitleLanguages.slice(0, 6).map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => update({ subtitleLanguage: item.code, translatedText: translations[item.code] ?? translations.en })}
              className={cn(
                'rounded-full border px-2 py-0.5 text-[8px] transition-colors',
                state.subtitleLanguage === item.code
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border/70 text-muted-foreground hover:text-foreground',
              )}
            >
              {item.native}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={translate}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/25 bg-primary/[0.06] py-2 text-[10px] font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <Sparkles className="h-3 w-3" /> Translate with AI
        </button>
      </section>

      <section className="space-y-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Delivery</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { value: 'burned' as const, label: 'Burned-in', description: 'Hardcoded into video', icon: Flame },
            { value: 'soft' as const, label: 'Soft subtitles', description: 'Toggleable track', icon: Captions },
          ].map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => update({ subtitleMode: mode.value })}
              className={cn(
                'rounded-xl border p-2.5 text-left transition-colors',
                state.subtitleMode === mode.value
                  ? 'border-primary/40 bg-primary/[0.06] ring-1 ring-primary/20'
                  : 'border-border/60 bg-background/30 hover:bg-secondary/40',
              )}
            >
              <mode.icon className={cn('h-3.5 w-3.5', state.subtitleMode === mode.value ? 'text-primary' : 'text-muted-foreground')} />
              <p className="mt-1 text-[10px] font-medium">{mode.label}</p>
              <p className="text-[8px] text-muted-foreground">{mode.description}</p>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-2.5 py-2">
          <div>
            <p className="text-[10px] text-muted-foreground">Dual subtitles</p>
            <p className="text-[8px] text-muted-foreground/70">Show original + translation</p>
          </div>
          <Switch checked={state.dualSubtitles} onCheckedChange={(dualSubtitles) => update({ dualSubtitles })} label="Dual subtitles" />
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Translation preview</h3>
          <Badge variant={translated ? 'success' : 'secondary'} className="text-[8px]">{language.label}</Badge>
        </div>
        <div
          dir={language.rtl ? 'rtl' : 'ltr'}
          className="rounded-xl border border-border/60 bg-background/30 p-2.5 text-[10px] leading-relaxed text-muted-foreground"
        >
          {state.subtitleLanguage === 'en' ? state.captionText : state.translatedText}
        </div>
        <p className="text-[8px] leading-relaxed text-muted-foreground/70">
          Demo translation. The `/api/subtitles/translate` endpoint and LLM translation pipeline are added in Phase 4.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Export subtitle files</h3>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => exportSubtitles('srt')}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/40 py-2 text-[10px] font-medium transition-colors hover:border-primary/30 hover:bg-primary/[0.05]"
          >
            <Download className="h-3 w-3" /> .SRT
          </button>
          <button
            type="button"
            onClick={() => exportSubtitles('vtt')}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background/40 py-2 text-[10px] font-medium transition-colors hover:border-primary/30 hover:bg-primary/[0.05]"
          >
            <Download className="h-3 w-3" /> .VTT
          </button>
        </div>
        <p className="text-[8px] leading-relaxed text-muted-foreground/70">
          Exports {translated ? `${language.label} translation` : 'the original English transcript'} split into {makeCues(exportText, duration, 8).length} timed cues.
        </p>
      </section>
    </div>
  )
}
