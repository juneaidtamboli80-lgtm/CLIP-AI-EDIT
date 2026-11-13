import Link from 'next/link'
import { ArrowLeft, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'

export default function NotFound() {
  return (
    <main id="main-content" className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh-light dark:bg-mesh-dark" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 surface-grid opacity-60" aria-hidden />
      <div className="w-full max-w-md text-center">
        <Link href="/dashboard" className="inline-flex rounded-xl">
          <Logo />
        </Link>
        <div className="mx-auto mt-8 grid h-14 w-14 place-items-center rounded-2xl border border-border/70 bg-card/70 text-primary shadow-soft backdrop-blur-sm">
          <Compass className="h-6 w-6" />
        </div>
        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Error 404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">This clip doesn&apos;t exist</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          The page may have been moved, or the project was deleted. Head back to your studio and pick up where you left off.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link href="/dashboard">
            <Button size="sm">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
            </Button>
          </Link>
          <Link href="/new">
            <Button variant="outline" size="sm">
              Create a project
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
