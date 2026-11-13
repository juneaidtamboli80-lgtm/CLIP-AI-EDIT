'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronsUpDown,
  Clapperboard,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  Palette,
  Plus,
  Settings,
  Sparkles,
  Video,
  X,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  match?: (pathname: string) => boolean
}

const workspaceNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'New project', href: '/new', icon: Plus },
  {
    label: 'My projects',
    href: '/projects',
    icon: FolderKanban,
    match: (path) => path.startsWith('/projects'),
  },
  { label: 'Templates', href: '/templates', icon: Sparkles },
]

const studioNav: NavItem[] = [
  { label: 'Brand kit', href: '/brand-kit', icon: Palette },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const credits = { used: 760, total: 2000 }

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname()
  const active = item.match ? item.match(pathname) : pathname === item.href
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/70 hover:text-foreground',
        active && 'bg-secondary/90 text-foreground shadow-sm ring-1 ring-border/60',
      )}
    >
      {active ? (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand-gradient"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      ) : null}
      <Icon
        className={cn(
          'h-[17px] w-[17px] shrink-0 transition-colors',
          active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
        )}
      />
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <Badge variant="gradient" className="px-1.5 py-0 text-[9px] uppercase tracking-wide">
          {item.badge}
        </Badge>
      ) : null}
    </Link>
  )
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const percent = Math.round((credits.used / credits.total) * 100)

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            type="button"
            aria-label="Close navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          />
        ) : null}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[276px] flex-col border-r border-border/60 bg-surface/85 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-[72px] items-center justify-between px-5">
          <Link href="/dashboard" onClick={onClose} className="rounded-xl focus-visible:ring-2">
            <Logo />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-2.5 text-left transition-colors hover:bg-card"
          >
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-bold text-white">
              AC
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">Alex&apos;s Studio</p>
              <p className="text-[10px] text-muted-foreground">Pro workspace</p>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5 scrollbar-none">
          <div>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              Workspace
            </p>
            <div className="space-y-1">
              {workspaceNav.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={onClose} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              Studio
            </p>
            <div className="space-y-1">
              {studioNav.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={onClose} />
              ))}
            </div>
          </div>
        </nav>

        <div className="space-y-3 border-t border-border/60 p-4">
          <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-card/70 to-accent/10 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                <Zap className="h-3.5 w-3.5 text-primary" /> AI credits
              </span>
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {credits.used.toLocaleString()} / {credits.total.toLocaleString()}
              </span>
            </div>
            <Progress value={percent} label="AI credits used" />
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{percent}% used this month</span>
              <button type="button" className="text-[10px] font-semibold text-primary hover:underline">
                Upgrade
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl p-1 text-xs text-muted-foreground">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-500 text-[10px] font-bold text-white ring-2 ring-background">
              AC
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">Alex Chen</p>
              <p className="truncate text-[10px]">alex@studio.co</p>
            </div>
            <Link
              href="/settings"
              className="rounded-lg p-1.5 transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Account settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Video className="h-3 w-3" /> Local storage · 2 GB
            </span>
            <Link href="/settings" className="flex items-center gap-1 hover:text-foreground">
              <LifeBuoy className="h-3 w-3" /> Help
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}

export function MobileCreateButton() {
  return (
    <Link
      href="/new"
      className="fixed bottom-5 right-5 z-30 flex h-12 items-center gap-2 rounded-full bg-brand-gradient px-4 text-sm font-semibold text-white shadow-glow lg:hidden"
    >
      <Clapperboard className="h-4 w-4" /> Create
    </Link>
  )
}
