'use client'

import * as React from 'react'
import Link from 'next/link'
import { FolderOpen, Grid2X2, List, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/projects/project-card'
import { projects } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/lib/types'

const filters: { label: string; value: 'all' | ProjectStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Ready', value: 'ready' },
  { label: 'Processing', value: 'processing' },
  { label: 'Drafts', value: 'draft' },
]

export function ProjectsGrid() {
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState<'all' | ProjectStatus>('all')
  const [sort, setSort] = React.useState('recent')
  const [view, setView] = React.useState<'grid' | 'list'>('grid')

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase()
    const list = projects.filter((project) => {
      const matchesQuery = !term || `${project.title} ${project.language}`.toLowerCase().includes(term)
      const matchesFilter = filter === 'all' || project.status === filter
      return matchesQuery && matchesFilter
    })
    return [...list].sort((a, b) => {
      if (sort === 'clips') return b.clipsCount - a.clipsCount
      if (sort === 'duration') return b.duration - a.duration
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [query, filter, sort])

  const counts = {
    all: projects.length,
    ready: projects.filter((project) => project.status === 'ready').length,
    processing: projects.filter((project) => project.status === 'processing').length,
    draft: projects.filter((project) => project.status === 'draft').length,
    failed: projects.filter((project) => project.status === 'failed').length,
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/12 text-primary">
              <FolderOpen className="h-3.5 w-3.5" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Library</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">My projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length} source videos · {projects.reduce((sum, project) => sum + project.clipsCount, 0)} clips generated
          </p>
        </div>
        <Link href="/new">
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" /> New project
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-card/50 p-2.5 shadow-soft sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects, languages…"
            aria-label="Search projects"
            className="h-9 w-full rounded-xl border border-transparent bg-transparent pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-border focus:bg-background/50"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-secondary/60 p-1 scrollbar-none">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors',
                filter === item.value ? 'bg-card text-foreground shadow-sm ring-1 ring-border/60' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
              <span className="rounded bg-background/60 px-1 text-[8px] tabular-nums text-muted-foreground">{counts[item.value]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort projects"
              className="h-8 appearance-none rounded-lg border border-border/70 bg-background/50 pl-7 pr-6 text-[10px] outline-none focus:border-primary/50"
            >
              <option value="recent">Recent</option>
              <option value="clips">Most clips</option>
              <option value="duration">Longest</option>
            </select>
          </div>
          <div className="hidden items-center rounded-lg border border-border/70 bg-background/50 p-0.5 sm:flex">
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-label="Grid view"
              className={cn('rounded-md p-1.5', view === 'grid' ? 'bg-secondary text-foreground' : 'text-muted-foreground')}
            >
              <Grid2X2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              aria-label="List view"
              className={cn('rounded-md p-1.5', view === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground')}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/30 px-6 py-16 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <h2 className="mt-3 text-sm font-semibold">No projects found</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">Try a different search or filter.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setQuery('')
              setFilter('all')
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
          <Link
            href="/new"
            className="group flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-card/30 p-5 text-center transition-all hover:border-primary/40 hover:bg-primary/[0.04]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-border/70 bg-background/60 text-muted-foreground transition-all group-hover:border-primary/30 group-hover:text-primary">
              <Plus className="h-4 w-4" />
            </span>
            <span className="text-xs font-medium">Add a project</span>
            <span className="text-[10px] text-muted-foreground">YouTube link or file upload</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/50 p-2.5 transition-colors hover:border-primary/30 hover:bg-card/80"
            >
              <div className={cn('relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br', project.thumbnail)}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.3),transparent_55%)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{project.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {project.clipsCount} clips · {project.language} · {project.resolution}
                </p>
              </div>
              <span className="hidden text-[10px] text-muted-foreground sm:block">{project.status}</span>
              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[9px] tabular-nums text-muted-foreground">
                {Math.round(project.duration / 60)} min
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
