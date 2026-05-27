import { Activity, Sun, Moon, Search } from 'lucide-react'
import { useAppStore } from '@/stores/app.store'
import type { Persona } from '@/types/app.types'

const PERSONAS: { id: Persona; label: string }[] = [
  { id: 'analyst', label: 'Analyst' },
  { id: 'epidemiologist', label: 'Epidemiologist' },
  { id: 'clinical', label: 'Clinical' },
]

export function Header() {
  const { persona, setPersona, theme, setTheme } = useAppStore()
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-navy-900 px-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-400" aria-hidden="true" />
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
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
            ].join(' ')}
          >
            {p.label}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search
            className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search countries, diseases, drugs..."
            aria-label="Search"
            className="w-56 rounded bg-slate-800 py-1 pl-7 pr-3 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
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
  )
}
