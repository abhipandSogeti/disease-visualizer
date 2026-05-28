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
  const { data: years, isLoading: yearsLoading } = useAvailableYears(
    primaryDisease?.whoIndicator ?? '',
  )

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

      {/* Disease list */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
          Active Diseases
        </span>
        <button
          onClick={() => setShowPicker((v) => !v)}
          aria-label="Add disease"
          aria-expanded={showPicker}
          className="rounded p-1 text-gray-600 hover:bg-stone-200 hover:text-gray-900"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {showPicker && inactive.length > 0 && (
        <ul
          className="flex flex-col gap-1 rounded border border-stone-300 bg-navy-950 p-1"
          role="list"
        >
          {inactive.map((d) => (
            <li key={d.id}>
              <button
                onClick={() => {
                  addDisease(d)
                  setShowPicker(false)
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-600 hover:bg-stone-200 hover:text-gray-900"
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
            className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-stone-200"
          >
            <div className="flex items-center gap-2">
              <Circle
                className="h-2.5 w-2.5 flex-shrink-0"
                style={{ color: DISEASE_COLOURS[disease.category] }}
                aria-hidden="true"
              />
              <span className="text-xs text-gray-700">{disease.name}</span>
            </div>
            <button
              onClick={() => removeDisease(disease.id)}
              aria-label={`Remove ${disease.name}`}
              className="rounded p-0.5 text-gray-600 hover:text-gray-700"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      {activeDiseases.length === 0 && (
        <p className="text-xs text-gray-600">No diseases selected. Use + to add.</p>
      )}

      {/* Year selector — range comes from actual WHO data for the active disease */}
      <div className="mt-auto flex flex-col gap-2 border-t border-stone-300 pt-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Year</span>

        {/* No WHO indicator for this disease */}
        {!primaryDisease?.whoIndicator && (
          <p className="text-[10px] leading-snug text-gray-600">
            No time-series data available for this disease
          </p>
        )}

        {/* Loading skeleton */}
        {primaryDisease?.whoIndicator && yearsLoading && (
          <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading years">
            <div className="h-8 w-16 animate-pulse rounded bg-stone-300" />
            <div className="h-2 w-full animate-pulse rounded-full bg-stone-300" />
            <div className="flex justify-between">
              <div className="h-2.5 w-8 animate-pulse rounded bg-stone-300" />
              <div className="h-2.5 w-8 animate-pulse rounded bg-stone-300" />
            </div>
          </div>
        )}

        {/* Polished slider */}
        {years &&
          years.length > 1 &&
          (() => {
            const clampedYear = Math.min(Math.max(selectedYear, minYear), maxYear)
            const pct =
              maxYear === minYear ? 100 : ((clampedYear - minYear) / (maxYear - minYear)) * 100

            // Tick marks every 5 years, always include first/last
            const tickYears: number[] = []
            const step5Start = Math.ceil(minYear / 5) * 5
            for (let y = step5Start; y <= maxYear; y += 5) {
              if (y >= minYear) tickYears.push(y)
            }
            if (!tickYears.includes(minYear)) tickYears.unshift(minYear)
            if (!tickYears.includes(maxYear)) tickYears.push(maxYear)

            return (
              <>
                {/* Large year display */}
                <div
                  className="text-3xl font-bold tabular-nums text-gray-900"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {clampedYear}
                </div>

                {/* Slider with gradient fill */}
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min={minYear}
                    max={maxYear}
                    step={1}
                    value={clampedYear}
                    onChange={(e) => setYear(Number(e.target.value))}
                    aria-label={`Select year between ${minYear} and ${maxYear}`}
                    aria-valuetext={String(clampedYear)}
                    style={{
                      background: `linear-gradient(to right, #111827 ${pct}%, #d1d5db ${pct}%)`,
                    }}
                    className={[
                      'w-full cursor-pointer appearance-none rounded-full',
                      'h-2',
                      // Thumb styling (webkit + moz)
                      '[&::-webkit-slider-thumb]:appearance-none',
                      '[&::-webkit-slider-thumb]:h-4',
                      '[&::-webkit-slider-thumb]:w-4',
                      '[&::-webkit-slider-thumb]:rounded-full',
                      '[&::-webkit-slider-thumb]:bg-white',
                      '[&::-webkit-slider-thumb]:shadow-md',
                      '[&::-webkit-slider-thumb]:ring-2',
                      '[&::-webkit-slider-thumb]:ring-gray-900',
                      '[&::-webkit-slider-thumb]:transition-transform',
                      '[&::-webkit-slider-thumb]:hover:scale-125',
                      '[&::-moz-range-thumb]:h-4',
                      '[&::-moz-range-thumb]:w-4',
                      '[&::-moz-range-thumb]:rounded-full',
                      '[&::-moz-range-thumb]:border-0',
                      '[&::-moz-range-thumb]:bg-white',
                      '[&::-moz-range-thumb]:shadow-md',
                      '[&::-moz-range-thumb]:ring-2',
                      '[&::-moz-range-thumb]:ring-gray-900',
                      // Track (moz)
                      '[&::-moz-range-track]:rounded-full',
                      '[&::-moz-range-track]:h-2',
                      'focus-visible:outline-none',
                      'focus-visible:ring-2',
                      'focus-visible:ring-gray-900',
                      'focus-visible:ring-offset-2',
                      'focus-visible:ring-offset-navy-900',
                    ].join(' ')}
                  />
                </div>

                {/* Tick labels */}
                <div className="relative h-4">
                  {tickYears.map((y) => {
                    const pos = ((y - minYear) / (maxYear - minYear)) * 100
                    return (
                      <span
                        key={y}
                        style={{ left: `${pos}%` }}
                        className={[
                          'absolute -translate-x-1/2 text-[9px] tabular-nums',
                          y === clampedYear ? 'font-bold text-gray-700' : 'text-gray-600',
                        ].join(' ')}
                      >
                        {y}
                      </span>
                    )
                  })}
                </div>
              </>
            )
          })()}

        {/* Edge case: indicator present but only one data point */}
        {primaryDisease?.whoIndicator && !yearsLoading && years && years.length === 1 && (
          <p className="text-[10px] text-gray-600">Only one year of data: {years[0]}</p>
        )}
      </div>
    </aside>
  )
}
