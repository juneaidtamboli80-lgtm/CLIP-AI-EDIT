import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ToastProvider } from '@/components/ui/toast'

export const metadata: Metadata = {
  title: {
    default: 'ClipForge — Turn long videos into viral shorts',
    template: '%s · ClipForge',
  },
  description:
    'ClipForge uses AI to transcribe long videos, find viral moments, and turn them into captioned vertical clips for Shorts, Reels and TikTok.',
  applicationName: 'ClipForge',
  keywords: ['AI video editor', 'YouTube Shorts', 'TikTok clips', 'video repurposing'],
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#080b14' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
}

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('clipforge-theme');
    var system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    var theme = stored || system;
    document.documentElement.classList.toggle('dark', theme !== 'light');
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
