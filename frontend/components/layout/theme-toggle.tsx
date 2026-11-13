'use client'

import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="relative overflow-hidden"
    >
      <motion.span
        key={theme}
        initial={{ y: 12, opacity: 0, rotate: -30 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.25 }}
        className="grid place-items-center"
      >
        {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </motion.span>
    </Button>
  )
}
