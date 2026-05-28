import { useState, useEffect } from 'react'
import { Plus, X, Circle, Globe, Map } from 'lucide-react'
import { useAppStore } from '@/stores/app.store'
import { DISEASE_COLOURS } from '@/lib/colour-scale'
import { DEFAULT_DISEASES } from '@/types/app.types'
import { useAvailableYears } from '@/hooks/useAvailableYears'

export function LeftPanel() {
  const { activeDiseases, addDisease, removeDisease, selectedYear, setYear, view, setView } =
    useAppStore()
  const [showPicker, setShowPicker] = useState(false)

  const primaryDisease = activeDiseases[0]
  const { data: years } = useAvailableYears(primaryDisease?.whoIndicator ?? '')

  const minYear = years ? years[years.length - 1] : 2000
  const maxYear = years ? years[0] : 2024

  // Auto-select most recent year when disease changes or years load
  useEffect(() => {
    if (years && years.length > 0 && !years.includes(selectedYear)) {
      setYear(years[0])
    }
  }, [years, selectedYear, setYear])

  const inactive = DEFAULT_DISEASES.filter((d) => !activeDiseases.some((a) => a.id === d.id))

  return (
    <aside
      className="flex w-52 flex-col gap-3 overflow-y-auto border-r border-slate-800 bg-navy-900 p-3"
      aria-label="Controls"
    >
      {/* View toggle */}
      <div className="flex rounded border border-slate-700 p-0.5">
        <button
          onClick={() => setView('globe')}
          aria-pressed={view === 'globe'}
          className={[
            'flex flex-1 items-center justify-center gap-1.5 rounded py-1.5 text-xs font-medium transition-colors',
            view === 'globe'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
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
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
          ].join(' ')}
        >
          <Map className="h-3.5 w-3.5" aria-hidden="true" />
          2D Map
        </button>
      </div>

      {/* Disease list */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Active Diseases
        </span>
        <button
          onClick={() => setShowPicker((v) => !v)}
          aria-label="Add disease"
          aria-expanded={showPicker}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {showPicker && inactive.length > 0 && (
        <ul
          className="flex flex-col gap-1 rounded border border-slate-700 bg-navy-950 p-1"
          role="list"
        >
          {inactive.map((d) => (
            <li key={d.id}>
              <button
                onClick={() => {
                  addDisease(d)
                  setShowPicker(false)
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              >
                <Circle
                  className="h-2.5 w-2.5 flex-shrink-0"
                  style={{ color: DISEASE_COLOURS[d.category] }}
                  aria-hidden="true"
                />
                {d.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <ul className="flex flex-col gap-1" role="list">
        {activeDiseases.map((disease) => (
          <li
            key={disease.id}
            className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-slate-800"
          >
            <div className="flex items-center gap-2">
              <Circle
                className="h-2.5 w-2.5 flex-shrink-0"
                style={{ color: DISEASE_COLOURS[disease.category] }}
                aria-hidden="true"
              />
              <span className="text-xs text-slate-300">{disease.name}</span>
            </div>
            <button
              onClick={() => removeDisease(disease.id)}
              aria-label={`Remove ${disease.name}`}
              className="rounded p-0.5 text-slate-600 hover:text-slate-300"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      {activeDiseases.length === 0 && (
        <p className="text-xs text-slate-500">No diseases selected. Use + to add.</p>
      )}

      {/* Year slider — range comes from actual WHO data for the active disease */}
      <div className="mt-auto flex flex-col gap-2 border-t border-slate-800 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Year
          </span>
          <span className="text-xs font-bold text-slate-300">{selectedYear}</span>
        </div>
        {years && years.length > 1 ? (
          <>
            <input
              type="range"
              min={minYear}
              max={maxYear}
              value={Math.min(Math.max(selectedYear, minYear), maxYear)}
              onChange={(e) => setYear(Number(e.target.value))}
              aria-label={`Select year between ${minYear} and ${maxYear}`}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>{minYear}</span>
              <span>{maxYear}</span>
            </div>
          </>
        ) : (
          <p className="text-[10px] text-slate-600">
            {primaryDisease?.whoIndicator ? 'Loading years…' : 'No WHO data for this disease'}
          </p>
        )}
      </div>
    </aside>
  )
}
