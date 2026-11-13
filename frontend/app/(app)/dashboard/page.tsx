import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Clapperboard,
  Command,
  FolderKanban,
  Plus,
  Sparkles,
  UploadCloud,
  Wand2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { CreateCard } from '@/components/dashboard/create-card'
import { PipelineCard } from '@/components/dashboard/pipeline-card'
import { ProjectCard } from '@/components/projects/project-card'
import { projects } from '@/lib/mock-data'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  const recent = projects.slice(0, 3)

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/20 bg-primary/[0.06] text-[9px] uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-2.5 w-2.5" /> Studio overview
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, Alex. <span className="gradient-text">Let&apos;s forge something.</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your studio has created <span className="font-medium text-foreground">642 clips</span> this month. One long video is all it takes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/projects">
            <Button variant="outline" size="sm">
              <FolderKanban className="h-3.5 w-3.5" /> My projects
            </Button>
          </Link>
          <Link href="/new">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" /> Create new
            </Button>
          </Link>
        </div>
      </section>

      <StatsCards />

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CreateCard />
        </div>
        <PipelineCard />
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Recent projects</h2>
            <p className="text-xs text-muted-foreground">Pick up where you left off.</p>
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {recent.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
          <Link
            href="/new"
            className="group flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-card/30 p-5 text-center transition-all hover:border-primary/40 hover:bg-primary/[0.04]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-border/70 bg-background/60 text-muted-foreground transition-all group-hover:border-primary/30 group-hover:text-primary">
              <UploadCloud className="h-4 w-4" />
            </span>
            <span className="text-xs font-medium">Import another video</span>
            <span className="text-[10px] text-muted-foreground">YouTube link or device upload</span>
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 p-4 shadow-soft md:col-span-2">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow-sm">
              <Wand2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold">Pro workflow: one source, ten posts</h3>
              <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-muted-foreground">
                Start with a 30–60 minute podcast or stream. ClipForge detects the strongest hooks, frames speakers vertically, and keeps your brand kit applied across every export.
              </p>
              <Link
                href="/templates"
                className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                Explore templates <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Command className="h-3.5 w-3.5 text-primary" /> Keyboard shortcuts
          </div>
          <div className="mt-3 space-y-2 text-[11px]">
            {[
              ['Search anything', '⌘ K'],
              ['New project', 'N'],
              ['Toggle theme', '⌘ ⇧ L'],
              ['Play / pause clip', 'Space'],
            ].map(([label, keys]) => (
              <div key={label} className="flex items-center justify-between gap-3 text-muted-foreground">
                <span>{label}</span>
                <kbd className="rounded-md border border-border/80 bg-background/60 px-1.5 py-0.5 font-mono text-[9px] text-foreground">
                  {keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="flex flex-col items-center justify-between gap-2 border-t border-border/50 pt-4 text-[10px] text-muted-foreground sm:flex-row">
        <span>© 2026 ClipForge · Built for creators</span>
        <span className="flex items-center gap-1.5">
          <Clapperboard className="h-3 w-3" /> Phase 1 UI shell · mock data
        </span>
      </footer>
    </div>
  )
}
