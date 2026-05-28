import { useState } from 'react'
import { Activity, Sun, Moon, Search } from 'lucide-react'
import { useAppStore } from '@/stores/app.store'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import type { Persona } from '@/types/app.types'

const PERSONAS: { id: Persona; label: string }[] = [
  { id: 'analyst', label: 'Analyst' },
  { id: 'epidemiologist', label: 'Epidemiologist' },
  { id: 'clinical', label: 'Clinical' },
]

export function Header() {
  const { persona, setPersona, theme, setTheme } = useAppStore()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-white/[0.06] bg-navy-900 px-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-violet-400" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-wide text-slate-100">
            Disease Visualizer
          </span>
        </div>
        <nav aria-label="Persona selection" className="flex gap-1">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPersona(p.id)}
              aria-pressed={persona === p.id}
              className={[
                'rounded px-3 py-1 text-xs font-medium transition-colors',
                persona === p.id
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100',
              ].join(' ')}
            >
              {p.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="flex w-56 items-center gap-2 rounded bg-white/[0.05] py-1 pl-3 pr-3 text-xs text-slate-500 hover:bg-white/[0.08] hover:text-slate-300"
          >
            <Search className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>Search countries, diseases, drugs...</span>
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
