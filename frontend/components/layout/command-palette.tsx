'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Clapperboard,
  CornerDownLeft,
  FolderKanban,
  LayoutDashboard,
  Palette,
  Plus,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { clips, projects } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type Result = {
  id: string
  label: string
  hint: string
  href: string
  group: 'Pages' | 'Projects' | 'Clips'
  icon: React.ComponentType<{ className?: string }>
}

const pages: Result[] = [
  { id: 'p-dash', label: 'Dashboard', hint: 'Overview and stats', href: '/dashboard', group: 'Pages', icon: LayoutDashboard },
  { id: 'p-new', label: 'New project', hint: 'Import or upload a video', href: '/new', group: 'Pages', icon: Plus },
  { id: 'p-projects', label: 'My projects', hint: 'All source videos', href: '/projects', group: 'Pages', icon: FolderKanban },
  { id: 'p-templates', label: 'Templates', hint: 'Start from a workflow', href: '/templates', group: 'Pages', icon: Sparkles },
  { id: 'p-brand', label: 'Brand kit', hint: 'Colors, fonts and logo', href: '/brand-kit', group: 'Pages', icon: Palette },
  { id: 'p-settings', label: 'Settings', hint: 'Workspace preferences', href: '/settings', group: 'Pages', icon: Settings },
]

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [query, setQuery] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(0)

  React.useEffect(() => {
    if (!open) {
      setQuery('')
      setActiveIndex(0)
    }
  }, [open])

  const results = React.useMemo<Result[]>(() => {
    const projectResults: Result[] = projects.map((project) => ({
      id: `project-${project.id}`,
      label: project.title,
      hint: `${project.clipsCount} clips · ${project.language}`,
      href: `/projects/${project.id}`,
      group: 'Projects',
      icon: FolderKanban,
    }))
    const clipResults: Result[] = clips.slice(0, 6).map((clip) => ({
      id: `clip-${clip.id}`,
      label: clip.title,
      hint: `Virality ${clip.score} · ${Math.round(clip.end - clip.start)}s`,
      href: `/editor/${clip.id}`,
      group: 'Clips',
      icon: Clapperboard,
    }))
    const all = [...pages, ...projectResults, ...clipResults]
    const term = query.trim().toLowerCase()
    if (!term) return all.slice(0, 8)
    return all
      .filter((item) => `${item.label} ${item.hint} ${item.group}`.toLowerCase().includes(term))
      .slice(0, 10)
  }, [query])

  React.useEffect(() => setActiveIndex(0), [query])

  function go(result: Result) {
    onOpenChange(false)
    router.push(result.href)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, results.length - 1))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    }
    if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault()
      go(results[activeIndex])
    }
  }

  const grouped = results.reduce<Record<string, Result[]>>((acc, result) => {
    ;(acc[result.group] ??= []).push(result)
    return acc
  }, {})

  let flatIndex = -1

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      showClose={false}
      className="top-[12%] max-w-xl translate-y-0 self-start p-0 sm:top-[15%]"
      labelledBy="command-palette-title"
    >
      <h2 id="command-palette-title" className="sr-only">
        Search ClipForge
      </h2>
      <div className="flex items-center gap-3 border-b border-border/70 px-4">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search projects, clips or pages…"
          className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
          aria-label="Search projects, clips or pages"
          autoComplete="off"
        />
        <kbd className="hidden rounded border border-border/80 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground sm:block">
          ESC
        </kbd>
      </div>

      <div className="max-h-[52vh] overflow-y-auto p-2">
        {results.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium">No results for “{query}”</p>
            <p className="mt-1 text-xs text-muted-foreground">Try a project title, clip or page name.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-1">
              <p className="px-3 pb-1 pt-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                {group}
              </p>
              {items.map((result) => {
                flatIndex += 1
                const index = flatIndex
                const Icon = result.icon
                return (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => go(result)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      activeIndex === index ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60',
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border/60 bg-background/60',
                        activeIndex === index && 'border-primary/30 bg-primary/10 text-primary',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium">{result.label}</span>
                      <span className="block truncate text-[10px] text-muted-foreground">{result.hint}</span>
                    </span>
                    <ArrowRight
                      className={cn('h-3.5 w-3.5 shrink-0', activeIndex === index ? 'text-foreground' : 'text-muted-foreground/40')}
                    />
                  </button>
                )
              })}
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border/70 px-4 py-2.5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border/70 px-1 font-mono">↑</kbd>
            <kbd className="rounded border border-border/70 px-1 font-mono">↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> open
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <Clapperboard className="h-3 w-3" /> ClipForge
        </span>
      </div>
    </Dialog>
  )
}
