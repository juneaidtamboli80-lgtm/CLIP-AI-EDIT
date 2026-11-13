'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, MobileCreateButton } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { CommandPalette } from '@/components/layout/command-palette'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
        return
      }
      if (event.key === 'Escape') setSidebarOpen(false)
      if (event.key === '/' && !isTyping && !event.metaKey && !event.ctrlKey) {
        event.preventDefault()
        setPaletteOpen(true)
      }
      if (!isTyping && event.key.toLowerCase() === 'n' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        router.push('/new')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router])

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-mesh-light dark:bg-mesh-dark" aria-hidden />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[276px]">
        <Topbar onMenuClick={() => setSidebarOpen(true)} onSearchClick={() => setPaletteOpen(true)} />
        <main
          id="main-content"
          className="mx-auto w-full max-w-[1560px] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12"
        >
          {children}
        </main>
      </div>
      <MobileCreateButton />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  )
}
