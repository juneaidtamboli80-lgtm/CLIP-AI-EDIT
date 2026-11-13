'use client'

import * as React from 'react'

type Theme = 'dark' | 'light'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('dark')

  React.useEffect(() => {
    const stored = window.localStorage.getItem('clipforge-theme') as Theme | null
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
    const next = stored ?? (prefersLight ? 'light' : 'dark')
    setThemeState(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }, [])

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next)
    window.localStorage.setItem('clipforge-theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.style.colorScheme = next
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [setTheme, theme])

  const value = React.useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
