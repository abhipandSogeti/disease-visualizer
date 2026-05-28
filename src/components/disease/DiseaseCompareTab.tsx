import { useMemo, useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import { useCountryDisease, useCountryDiseaseTimeSeries } from '@/hooks/useCountryDisease'
import { formatCount, getTrendDirection } from '@/lib/format'
import { DISEASE_COLOURS } from '@/lib/colour-scale'
import { EpidemicCurveChart } from './EpidemicCurveChart'
import { useAppStore } from '@/stores/app.store'
import { useCountryName } from '@/hooks/useCountryName'
import type { Disease } from '@/types/app.types'

// Common ISO3 codes for quick selection
const COMMON_COUNTRIES = [
  { iso3: 'NGA', name: 'Nigeria' },
  { iso3: 'COD', name: 'DR Congo' },
  { iso3: 'IND', name: 'India' },
  { iso3: 'BRA', name: 'Brazil' },
  { iso3: 'USA', name: 'United States' },
  { iso3: 'GBR', name: 'United Kingdom' },
  { iso3: 'ZAF', name: 'South Africa' },
  { iso3: 'CHN', name: 'China' },
  { iso3: 'ETH', name: 'Ethiopia' },
  { iso3: 'KEN', name: 'Kenya' },
  { iso3: 'TZA', name: 'Tanzania' },
  { iso3: 'UGA', name: 'Uganda' },
  { iso3: 'MOZ', name: 'Mozambique' },
  { iso3: 'GHA', name: 'Ghana' },
  { iso3: 'EGY', name: 'Egypt' },
  { iso3: 'PAK', name: 'Pakistan' },
]

interface DiseaseCompareTabProps {
  iso3Primary: string
  iso3Compare: string | null
  disease: Disease
}

function CountryColumn({ iso3, disease }: { iso3: string; disease: Disease }) {
  const countryName = useCountryName(iso3)
  const { data } = useCountryDisease(iso3, disease.whoIndicator)
  const { data: series } = useCountryDiseaseTimeSeries(iso3, disease.whoIndicator)
  const sorted = useMemo(() => (data ?? []).slice().sort((a, b) => b.TimeDim - a.TimeDim), [data])
  const latest = sorted[0]
  const previous = sorted[1]
  const trend =
    latest?.NumericValue != null && previous?.NumericValue != null
      ? getTrendDirection(previous.NumericValue, latest.NumericValue)
      : null
  const chartData = useMemo(
    () =>
      (series ?? [])
        .filter((r) => r.NumericValue !== null)
        .sort((a, b) => a.TimeDim - b.TimeDim)
        .map((r) => ({ year: r.TimeDim, value: r.NumericValue as number })),
    [series],
  )
  return (
    <div className="flex-1 rounded border border-slate-800 bg-slate-900/40 p-3">
      <p className="mb-2 text-xs font-bold text-slate-300">{countryName}</p>
      <p className="text-lg font-bold text-slate-100">
        {formatCount(latest?.NumericValue ?? null)}
      </p>
      {trend && (
        <p
          className={`mt-0.5 text-xs ${trend === 'increasing' ? 'text-red-400' : trend === 'decreasing' ? 'text-green-400' : 'text-slate-500'}`}
        >
          {trend === 'increasing' ? 'Increasing' : trend === 'decreasing' ? 'Decreasing' : 'Stable'}
        </p>
      )}
      <div className="mt-3">
        <EpidemicCurveChart
          data={chartData}
          diseaseName={iso3}
          colour={DISEASE_COLOURS[disease.category]}
        />
      </div>
    </div>
  )
}

export function DiseaseCompareTab({ iso3Primary, iso3Compare, disease }: DiseaseCompareTabProps) {
  const { setCompareCountry } = useAppStore()
  const [query, setQuery] = useState('')

  const filtered = COMMON_COUNTRIES.filter(
    (c) =>
      c.iso3 !== iso3Primary &&
      (query === '' ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.iso3.toLowerCase().includes(query.toLowerCase())),
  )

  if (!iso3Compare) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-slate-400">
          Pick a country to compare against{' '}
          <span className="font-semibold text-slate-300">{iso3Primary}</span>. You can also
          right-click any country on the globe or map.
        </p>
        <div className="relative">
          <Search
            className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Filter countries…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-900 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <ul className="flex flex-col gap-1">
          {filtered.map((c) => (
            <li key={c.iso3}>
              <button
                onClick={() => setCompareCountry(c.iso3)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              >
                <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                {c.name}
                <span className="ml-auto text-slate-600">{c.iso3}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3 w-3" aria-hidden="true" />
          Comparing {disease.name} burden
        </div>
        <button
          onClick={() => setCompareCountry(null)}
          className="text-[10px] text-slate-600 hover:text-slate-400"
        >
          Clear
        </button>
      </div>
      <div className="flex gap-2">
        <CountryColumn iso3={iso3Primary} disease={disease} />
        <CountryColumn iso3={iso3Compare} disease={disease} />
      </div>
    </div>
  )
}
