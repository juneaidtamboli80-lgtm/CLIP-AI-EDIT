import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1440px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        success: 'hsl(var(--success) / <alpha-value>)',
        warning: 'hsl(var(--warning) / <alpha-value>)',
      },
      borderRadius: {
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 14px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 45%, #3b82f6 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(139,92,246,.22), rgba(59,130,246,.16))',
        'mesh-dark':
          'radial-gradient(60% 80% at 10% 0%, rgba(139,92,246,.18) 0%, transparent 60%), radial-gradient(50% 70% at 90% 10%, rgba(59,130,246,.14) 0%, transparent 60%), radial-gradient(40% 60% at 50% 100%, rgba(168,85,247,.10) 0%, transparent 60%)',
        'mesh-light':
          'radial-gradient(60% 80% at 10% 0%, rgba(139,92,246,.16) 0%, transparent 60%), radial-gradient(50% 70% at 90% 10%, rgba(59,130,246,.12) 0%, transparent 60%)',
        'grid-fade':
          'linear-gradient(to right, hsl(var(--border) / .5) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / .5) 1px, transparent 1px)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139,92,246,.25), 0 18px 60px -20px rgba(99,102,241,.55)',
        'glow-sm': '0 10px 36px -16px rgba(99,102,241,.6)',
        soft: '0 24px 70px -34px rgba(2, 6, 23, .65)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(139,92,246,.45)' },
          '70%': { boxShadow: '0 0 0 12px rgba(139,92,246,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(139,92,246,0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s cubic-bezier(.22,1,.36,1) both',
        shimmer: 'shimmer 1.8s infinite',
        'pulse-ring': 'pulse-ring 2s infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
