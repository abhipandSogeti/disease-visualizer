import { useNavigate, Link } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { useAppStore } from '@/stores/app.store'
import type { Persona } from '@/types/app.types'

const PERSONAS: { id: Persona; label: string }[] = [
  { id: 'analyst', label: 'Analyst' },
  { id: 'epidemiologist', label: 'Epidemiologist' },
  { id: 'clinical', label: 'Clinical' },
]

export function Header() {
  const { persona, setPersona, setCountry, setCompareCountry } = useAppStore()
  const navigate = useNavigate()

  const handleHome = () => {
    setCountry(null)
    setCompareCountry(null)
    navigate('/')
  }

  return (
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
      <Link
        to="/place"
        className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-black/[0.05] hover:text-gray-900"
      >
        Place check
      </Link>
    </header>
  )
}
