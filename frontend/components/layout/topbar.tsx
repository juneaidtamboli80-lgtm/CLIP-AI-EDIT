'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  User,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { cn } from '@/lib/utils'

const breadcrumbMap: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'My projects',
  new: 'New project',
  templates: 'Templates',
  'brand-kit': 'Brand kit',
  settings: 'Settings',
  editor: 'Editor',
}

function useBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  return segments.map((segment, index) => ({
    label: breadcrumbMap[segment] ?? (index > 0 ? 'Project' : segment),
    href: `/${segments.slice(0, index + 1).join('/')}`,
    last: index === segments.length - 1,
  }))
}

export function Topbar({
  onMenuClick,
  onSearchClick,
}: {
  onMenuClick: () => void
  onSearchClick: () => void
}) {
  const breadcrumbs = useBreadcrumbs()
  const [profileOpen, setProfileOpen] = React.useState(false)
  const profileRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-xs sm:flex">
          <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
            Workspace
          </Link>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.href}>
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
              {crumb.last ? (
                <span className="truncate font-medium text-foreground">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="truncate text-muted-foreground transition-colors hover:text-foreground">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onSearchClick}
            className="hidden h-9 w-56 items-center gap-2 rounded-xl border border-border/70 bg-secondary/50 px-3 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-secondary md:flex xl:w-64"
            aria-label="Search projects, clips and pages"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Search anything…</span>
            <kbd className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
              ⌘K
            </kbd>
          </button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onSearchClick} aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>

          <div className="hidden items-center gap-2 rounded-xl border border-border/70 bg-secondary/40 px-2.5 py-1.5 lg:flex">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <div className="w-16">
              <div className="flex items-baseline justify-between text-[9px] text-muted-foreground">
                <span>Credits</span>
                <span className="tabular-nums text-foreground">1,240</span>
              </div>
              <Progress value={62} className="mt-1 h-1" label="Credits remaining" />
            </div>
          </div>

          <ThemeToggle />

          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications" title="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background" />
          </Button>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              className={cn(
                'ml-0.5 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-500 text-[10px] font-bold text-white ring-2 ring-background transition-transform hover:scale-105',
                profileOpen && 'ring-primary/50',
              )}
            >
              AC
            </button>
            {profileOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-11 w-60 overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-soft backdrop-blur-xl"
              >
                <div className="border-b border-border/60 px-3 py-2.5">
                  <p className="text-sm font-semibold">Alex Chen</p>
                  <p className="text-[11px] text-muted-foreground">alex@studio.co</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-medium text-primary">
                    <Sparkles className="h-2.5 w-2.5" /> Pro plan
                  </span>
                </div>
                {[
                  { label: 'Profile', icon: User, href: '/settings' },
                  { label: 'Workspace settings', icon: Settings, href: '/settings' },
                  { label: 'Billing & credits', icon: CreditCard, href: '/settings#billing' },
                  { label: 'Help center', icon: HelpCircle, href: '/settings#help' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <item.icon className="h-3.5 w-3.5" /> {item.label}
                  </Link>
                ))}
                <div className="my-1 h-px bg-border/60" />
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
