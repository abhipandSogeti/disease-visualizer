import { useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { useCountryDisease, useCountryDiseaseTimeSeries } from '@/hooks/useCountryDisease'
import { formatCount, getTrendDirection } from '@/lib/format'
import { DISEASE_COLOURS } from '@/lib/colour-scale'
import { EpidemicCurveChart } from './EpidemicCurveChart'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Disease } from '@/types/app.types'

interface DiseaseCompareTabProps {
  iso3Primary: string
  iso3Compare: string | null
  disease: Disease
}

function CountryColumn({ iso3, disease }: { iso3: string; disease: Disease }) {
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
      <p className="mb-2 text-xs font-bold text-slate-300">{iso3}</p>
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
  if (!iso3Compare) {
    return (
      <EmptyState
        message="No comparison country selected."
        suggestion="Right-click a second country on the globe to compare it with the current selection."
      />
    )
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin className="h-3 w-3" aria-hidden="true" />
        Comparing {disease.name} burden
      </div>
      <div className="flex gap-2">
        <CountryColumn iso3={iso3Primary} disease={disease} />
        <CountryColumn iso3={iso3Compare} disease={disease} />
      </div>
    </div>
  )
}
