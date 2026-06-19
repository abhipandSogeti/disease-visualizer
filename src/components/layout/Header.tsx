import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Search } from 'lucide-react'
import { useAppStore } from '@/stores/app.store'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import type { Persona } from '@/types/app.types'

const PERSONAS: { id: Persona; label: string }[] = [
  { id: 'analyst', label: 'Analyst' },
  { id: 'epidemiologist', label: 'Epidemiologist' },
  { id: 'clinical', label: 'Clinical' },
]

export function Header() {
  const { persona, setPersona, setCountry, setCompareCountry } = useAppStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()

  const handleHome = () => {
    setCountry(null)
    setCompareCountry(null)
    navigate('/')
  }

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-black/[0.1] bg-navy-900 px-4">
        <button
          onClick={handleHome}
          aria-label="Disease Visualizer — return to home"
          className="flex items-center gap-2 rounded px-1 py-1 transition-colors hover:bg-black/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Activity className="h-5 w-5 text-gray-900" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-wide text-gray-900">
            Disease Visualizer
          </span>
        </button>
        <nav aria-label="Persona selection" className="flex gap-1">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPersona(p.id)}
              aria-pressed={persona === p.id}
              className={[
                'rounded px-3 py-1 text-xs font-medium transition-colors',
                persona === p.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-black/[0.05] hover:text-gray-900',
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
            className="flex w-56 items-center gap-2 rounded bg-black/[0.04] py-1 pl-3 pr-3 text-xs text-gray-600 hover:bg-black/[0.07] hover:text-gray-700"
          >
            <Search className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>Search countries, diseases, drugs...</span>
          </button>
        </div>
      </header>
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
