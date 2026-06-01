import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, Circle, Globe, Map } from 'lucide-react'
import { useAppStore } from '@/stores/app.store'
import { DISEASE_COLOURS } from '@/lib/colour-scale'
import { DEFAULT_DISEASES } from '@/types/app.types'
import { useAvailableYears } from '@/hooks/useAvailableYears'

export function LeftPanel() {
  const { activeDiseases, selectedYear, setYear, view, setView } = useAppStore()

  const primaryDisease = activeDiseases[0]
  const { data: years, isLoading: yearsLoading } = useAvailableYears(
    primaryDisease?.whoIndicator ?? '',
  )

  const DATA_MAX = 2026
  const minYear = years ? years[years.length - 1] : 2000
  const maxYear = Math.max(years ? years[0] : 2024, DATA_MAX)
  const clampedYear = Math.min(Math.max(selectedYear, minYear), maxYear)
  // Latest year that actually has data for this disease
  const latestDataYear = years?.[0] ?? null
  const hasDataForYear = years?.includes(clampedYear) ?? false

  // Auto-select most recent year when disease changes or years load
  useEffect(() => {
    if (years && years.length > 0 && selectedYear < minYear) {
      setYear(years[0])
    }
  }, [years, selectedYear, minYear, setYear])

  const handleSelectDisease = (id: string) => {
    const disease = DEFAULT_DISEASES.find((d) => d.id === id)
    if (!disease || activeDiseases[0]?.id === id) return
    // Put the selected disease first, keep others in order
    const others = activeDiseases.filter((d) => d.id !== id)
    useAppStore.setState({ activeDiseases: [disease, ...others] })
  }

  return (
    <aside
      className="flex w-52 flex-col gap-3 overflow-y-auto border-r border-black/[0.1] bg-navy-900 p-3"
      aria-label="Controls"
    >
      {/* View toggle */}
      <div className="flex rounded border border-stone-300 p-0.5">
        <button
          onClick={() => setView('globe')}
          aria-pressed={view === 'globe'}
          className={[
            'flex flex-1 items-center justify-center gap-1.5 rounded py-1.5 text-xs font-medium transition-colors',
            view === 'globe'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-black/[0.05] hover:text-gray-900',
          ].join(' ')}
        >
          <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          3D Globe
        </button>
        <button
          onClick={() => setView('map')}
          aria-pressed={view === 'map'}
          className={[
            'flex flex-1 items-center justify-center gap-1.5 rounded py-1.5 text-xs font-medium transition-colors',
            view === 'map'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-black/[0.05] hover:text-gray-900',
          ].join(' ')}
        >
          <Map className="h-3.5 w-3.5" aria-hidden="true" />
          2D Map
        </button>
      </div>

      {/* Disease selector — single active disease */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
          Disease
        </span>
        <p className="mt-0.5 text-[10px] text-gray-500">Click to switch</p>
      </div>

      <ul className="flex flex-col gap-0.5" role="radiogroup" aria-label="Select disease">
        {DEFAULT_DISEASES.map((disease) => {
          const isActive = primaryDisease?.id === disease.id
          const hasData = !!disease.whoIndicator
          return (
            <li key={disease.id}>
              <button
                role="radio"
                aria-checked={isActive}
                onClick={() => handleSelectDisease(disease.id)}
                className={[
                  'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors',
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-stone-200 hover:text-gray-900',
                ].join(' ')}
              >
                <Circle
                  className="h-2.5 w-2.5 flex-shrink-0"
                  style={{ color: isActive ? '#fff' : DISEASE_COLOURS[disease.category] }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-xs font-medium">{disease.name}</span>
                {!hasData && (
                  <span className="text-[9px] text-gray-500" title="No WHO data">
                    —
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {/* Year selector */}
      <div className="mt-auto flex flex-col gap-2 border-t border-stone-300 pt-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Year</span>

        {!primaryDisease?.whoIndicator && (
          <p className="text-[10px] leading-snug text-gray-500">No time-series data</p>
        )}

        {primaryDisease?.whoIndicator && yearsLoading && (
          <div className="h-8 w-16 animate-pulse rounded bg-stone-300" aria-busy="true" />
        )}

        {years && years.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setYear(Math.max(clampedYear - 1, minYear))}
                disabled={clampedYear <= minYear}
                aria-label="Previous year"
                className="rounded p-1 text-gray-600 hover:bg-stone-200 hover:text-gray-900 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <span
                className="flex-1 text-center text-2xl font-bold tabular-nums text-gray-900"
                aria-live="polite"
              >
                {clampedYear}
              </span>
              <button
                onClick={() => setYear(Math.min(clampedYear + 1, maxYear))}
                disabled={clampedYear >= maxYear}
                aria-label="Next year"
                className="rounded p-1 text-gray-600 hover:bg-stone-200 hover:text-gray-900 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {!hasDataForYear && latestDataYear && (
              <p className="text-[10px] leading-snug text-gray-500">
                No data yet — showing {latestDataYear}
              </p>
            )}
          </>
        )}

        {primaryDisease?.whoIndicator && !yearsLoading && years && years.length === 1 && (
          <p className="text-[10px] text-gray-500">Only one year: {years[0]}</p>
        )}
      </div>
    </aside>
  )
}
