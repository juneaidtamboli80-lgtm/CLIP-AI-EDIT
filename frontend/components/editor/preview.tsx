'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Maximize2, Pause, Play, Scan, Volume2, VolumeX, Wand2 } from 'lucide-react'
import type { EditorState } from '@/lib/editor'
import { cn, formatTimecode } from '@/lib/utils'

const aspectStyle: Record<string, string> = {
  '9:16': '9 / 16',
  '1:1': '1 / 1',
  '16:9': '16 / 9',
}

const positionClass = (position: EditorState['captionSettings']['position'], dual: boolean) => {
  if (position === 'top') return 'justify-start pt-10 sm:pt-14'
  if (position === 'bottom') return cn('justify-end', dual ? 'pb-20' : 'pb-12')
  return 'justify-center'
}

export function EditorPreview({
  state,
  time,
  playing,
  onTogglePlay,
  onWordClick,
  onToggleSafeZones,
  onToggleMute,
  muted,
}: {
  state: EditorState
  time: number
  playing: boolean
  onTogglePlay: () => void
  onWordClick: (index: number) => void
  onToggleSafeZones: () => void
  onToggleMute: () => void
  muted: boolean
}) {
  const settings = state.captionSettings
  const duration = Math.max(1, state.outPoint - state.inPoint)
  const progress = Math.max(0, Math.min(1, (time - state.inPoint) / duration))
  const words = state.captionText.split(/\s+/).filter(Boolean)
  const activeIndex = Math.min(words.length - 1, Math.floor(progress * words.length))
  const scale = state.aspectRatio === '16:9' ? 1.05 : state.aspectRatio === '1:1' ? 0.82 : 0.68
  const fontSize = Math.max(13, settings.size * scale)

  const animation =
    settings.animation === 'pop'
      ? { scale: [0.82, 1.08, 1] }
      : settings.animation === 'bounce'
        ? { y: [0, -8, 0] }
        : settings.animation === 'fade'
          ? { opacity: [0.35, 1] }
          : undefined

  const backgroundStyle =
    state.background === 'color'
      ? { backgroundColor: state.backgroundColor }
      : state.background === 'image'
        ? { backgroundImage: state.backgroundImage }
        : {
            backgroundImage:
              'radial-gradient(circle at 20% 18%, rgba(139,92,246,.55), transparent 45%), radial-gradient(circle at 82% 26%, rgba(59,130,246,.45), transparent 45%), linear-gradient(160deg, #0b1020, #111827 55%, #1e1b4b)',
          }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-2">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 blur-3xl"
          style={backgroundStyle}
          aria-hidden
        />
        <div
          className="relative max-h-full max-w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_90px_-30px_rgba(0,0,0,.9)]"
          style={{ aspectRatio: aspectStyle[state.aspectRatio], height: '100%', maxWidth: '100%' }}
        >
          <div className="absolute inset-0" style={backgroundStyle} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,.14),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/35" />

          {/* Stylized talking-head frame (real source video arrives in Phase 2) */}
          <div className="absolute inset-x-0 bottom-0 top-[8%]">
            <svg viewBox="0 0 200 300" className="h-full w-full" preserveAspectRatio="xMidYMax slice" aria-hidden>
              <defs>
                <linearGradient id="body-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <radialGradient id="head-gradient" cx="40%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#cbd5e1" />
                  <stop offset="60%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#334155" />
                </radialGradient>
                <radialGradient id="rim-gradient" cx="50%" cy="50%" r="50%">
                  <stop offset="80%" stopColor="transparent" />
                  <stop offset="100%" stopColor="rgba(167,139,250,.55)" />
                </radialGradient>
              </defs>
              <ellipse cx="100" cy="292" rx="98" ry="26" fill="rgba(2,6,23,.65)" />
              <path d="M20 300 C20 216 58 176 100 176 C142 176 180 216 180 300 Z" fill="url(#body-gradient)" />
              <circle cx="100" cy="112" r="52" fill="url(#head-gradient)" />
              <circle cx="100" cy="112" r="52" fill="url(#rim-gradient)" />
              <path d="M64 112 C64 84 80 66 100 66 C122 66 138 86 138 112 C138 96 124 82 100 82 C78 82 64 94 64 112 Z" fill="#1e293b" opacity=".65" />
              <circle cx="84" cy="110" r="3" fill="#0f172a" opacity=".7" />
              <circle cx="116" cy="110" r="3" fill="#0f172a" opacity=".7" />
              <path d="M90 132 Q100 138 110 132" stroke="#0f172a" strokeWidth="2.4" fill="none" opacity=".55" strokeLinecap="round" />
            </svg>
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_30%,rgba(2,6,23,.45))]" />

          {state.logoEnabled ? (
            <div
              className={cn(
                'absolute z-20 flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/45 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-md',
                state.logoPosition === 'top-left' && 'left-3 top-3',
                state.logoPosition === 'top-right' && 'right-3 top-3',
                state.logoPosition === 'bottom-left' && 'bottom-3 left-3',
                state.logoPosition === 'bottom-right' && 'bottom-3 right-3',
              )}
            >
              <span className="grid h-3.5 w-3.5 place-items-center rounded-[4px] bg-brand-gradient text-[7px]">CF</span>
              ClipForge
            </div>
          ) : null}

          {state.safeZones ? (
            <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
              <div className="absolute inset-x-[8%] top-[10%] h-[12%] rounded border border-dashed border-cyan-300/50" />
              <div className="absolute inset-x-[8%] bottom-[22%] h-[16%] rounded border border-dashed border-cyan-300/50" />
              <div className="absolute inset-y-[10%] right-[6%] w-[14%] rounded border border-dashed border-cyan-300/50" />
            </div>
          ) : null}

          {state.captionsEnabled ? (
            <div
              className={cn(
                'pointer-events-none absolute inset-0 z-20 flex flex-col items-center px-4',
                positionClass(settings.position, state.dualSubtitles),
              )}
            >
              <div
                className="pointer-events-auto max-w-full text-center leading-[1.15]"
                style={{
                  fontFamily: `${settings.font}, Inter, sans-serif`,
                  fontSize: `${fontSize}px`,
                  fontWeight: settings.weight,
                  color: settings.color,
                  textTransform: settings.uppercase ? 'uppercase' : 'none',
                  textShadow: settings.shadow ? '0 3px 14px rgba(0,0,0,.85)' : 'none',
                  WebkitTextStroke: settings.outlineWidth > 0 ? `${settings.outlineWidth * 0.55}px ${settings.outlineColor}` : undefined,
                  paintOrder: 'stroke fill',
                  letterSpacing: settings.uppercase ? '0.01em' : '-0.01em',
                }}
              >
                <span
                  style={
                    settings.background
                      ? {
                          backgroundColor: settings.backgroundColor,
                          padding: '3px 8px',
                          borderRadius: '8px',
                          boxDecorationBreak: 'clone',
                          WebkitBoxDecorationBreak: 'clone',
                        }
                      : undefined
                  }
                >
                  {words.map((word, index) => {
                    const isActive = index === activeIndex
                    const hidden = settings.presetId === 'typewriter' && index > activeIndex
                    return (
                      <React.Fragment key={`${word}-${index}`}>
                        <motion.button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onWordClick(index)
                          }}
                          animate={isActive && animation ? animation : undefined}
                          transition={{ duration: 0.32, ease: 'easeOut' }}
                          className={cn(
                            'inline-block cursor-text rounded-sm outline-none transition-colors hover:bg-white/10 focus-visible:bg-white/20',
                            hidden && 'opacity-0',
                          )}
                          style={{
                            color: isActive ? settings.highlightColor : settings.color,
                            WebkitTextStroke:
                              settings.outlineWidth > 0
                                ? `${settings.outlineWidth * 0.55}px ${settings.outlineColor}`
                                : undefined,
                            paintOrder: 'stroke fill',
                          }}
                          title="Click to fix this word"
                        >
                          {word}
                          {isActive && settings.emoji ? ' 🔥' : ''}
                        </motion.button>
                        {index < words.length - 1 ? ' ' : ''}
                      </React.Fragment>
                    )
                  })}
                </span>
              </div>
            </div>
          ) : null}

          {state.dualSubtitles ? (
            <div className="absolute inset-x-3 bottom-3 z-20 text-center">
              <span className="inline-block max-w-full rounded-md bg-slate-950/55 px-2 py-1 text-[10px] leading-snug text-white/90 backdrop-blur-sm">
                {state.translatedText}
              </span>
            </div>
          ) : null}

          {!playing ? (
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label="Play clip"
              className="absolute left-1/2 top-1/2 z-30 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-slate-950/40 text-white backdrop-blur-md transition-transform hover:scale-105"
            >
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-border/60 bg-card/40 px-3 py-2">
        <button
          type="button"
          onClick={onTogglePlay}
          className="grid h-7 w-7 place-items-center rounded-lg bg-brand-gradient text-white shadow-glow-sm transition-transform hover:scale-105"
          aria-label={playing ? 'Pause clip' : 'Play clip'}
        >
          {playing ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
        </button>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {formatTimecode(Math.max(0, time - state.inPoint))} <span className="text-muted-foreground/40">/</span>{' '}
          {formatTimecode(duration)}
        </span>
        <div className="ml-1 hidden h-4 w-px bg-border sm:block" />
        <button
          type="button"
          onClick={onToggleMute}
          className="hidden rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:block"
          aria-label={muted ? 'Unmute preview' : 'Mute preview'}
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
        <span className="hidden rounded-md bg-secondary/70 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground sm:block">
          {state.speed}×
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="hidden items-center gap-1 rounded-md bg-secondary/70 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground sm:flex">
            <Wand2 className="h-2.5 w-2.5" /> {state.aspectRatio}
          </span>
          <button
            type="button"
            onClick={onToggleSafeZones}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              state.safeZones ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
            aria-label="Toggle safe zones"
            aria-pressed={state.safeZones}
            title="Toggle safe zones"
          >
            <Scan className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Fullscreen preview"
            title="Fullscreen (coming in Phase 2)"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
