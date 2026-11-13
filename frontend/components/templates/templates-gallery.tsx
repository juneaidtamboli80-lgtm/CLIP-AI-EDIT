'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Clapperboard, Flame, LayoutTemplate, Sparkles, Wand2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { templates } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const categories = ['All', 'Podcast', 'Regional', 'Business', 'Education', 'Gaming', 'Marketing']

export function TemplatesGallery() {
  const [category, setCategory] = React.useState('All')
  const filtered = category === 'All' ? templates : templates.filter((template) => template.category === category)

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/12 text-primary">
            <LayoutTemplate className="h-3.5 w-3.5" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Templates</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Start from a proven workflow</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Each template pre-configures clip length, caption style and highlight scoring for a content type. Tweak anything afterwards.
        </p>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border/70 bg-card/50 p-1 scrollbar-none">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors',
              category === item ? 'bg-card text-foreground shadow-sm ring-1 ring-border/60' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((template, index) => (
          <motion.article
            key={template.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow-sm"
          >
            <div className={cn('relative aspect-[16/9] overflow-hidden bg-gradient-to-br', template.gradient)}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,.32),transparent_55%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,.7),transparent_60%)]" />
              <div className="absolute inset-0 flex items-center justify-center gap-2">
                <span className="h-20 w-11 rounded-md border border-white/25 bg-white/10 backdrop-blur-sm" />
                <span className="h-14 w-8 rounded-md border border-white/20 bg-white/[0.07] backdrop-blur-sm" />
                <span className="h-20 w-11 rounded-md border border-white/25 bg-white/10 backdrop-blur-sm" />
              </div>
              <div className="absolute left-3 top-3 flex items-center gap-1.5">
                <Badge variant="secondary" className="border-white/15 bg-slate-950/50 text-[8px] text-white backdrop-blur-sm">
                  {template.category}
                </Badge>
                <Badge variant="secondary" className="border-white/15 bg-slate-950/50 text-[8px] text-white backdrop-blur-sm">
                  {template.aspect}
                </Badge>
              </div>
              <div className="absolute inset-x-3 bottom-2.5 flex items-center justify-between text-[9px] text-white/80">
                <span className="flex items-center gap-1"><Clapperboard className="h-3 w-3" /> {template.clips} clips</span>
                <Sparkles className="h-3 w-3" />
              </div>
            </div>
            <div className="space-y-2.5 p-3.5">
              <div>
                <h2 className="text-[13px] font-semibold">{template.name}</h2>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">{template.description}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Link href={`/new?template=${template.id}`} className="flex-1">
                  <Button size="sm" variant="secondary" className="w-full">
                    <Wand2 className="h-3 w-3" /> Use template
                  </Button>
                </Link>
                <Link href={`/new?template=${template.id}`}>
                  <Button size="sm" variant="ghost" aria-label={`Preview ${template.name}`}>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/50 to-accent/10 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow-sm">
            <Flame className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Build your own template</h2>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Save any editor preset as a reusable workflow for your team.</p>
          </div>
        </div>
        <Link href="/new">
          <Button size="sm">
            Create project <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
