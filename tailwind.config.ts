import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#f5f4f0',
          900: '#eae9e4',
          800: '#d4d3ce',
          700: '#bfbeba',
        },
        disease: {
          viral: '#ef4444',
          respiratory: '#f59e0b',
          parasitic: '#22c55e',
          bacterial: '#3b82f6',
          vectorborne: '#14b8a6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
