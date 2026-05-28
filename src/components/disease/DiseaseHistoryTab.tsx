import { useMemo } from 'react'
import { EpidemicTimeline } from '@/components/timeline/EpidemicTimeline'
import { EpidemicCurveChart } from './EpidemicCurveChart'
import { useCountryDiseaseTimeSeries } from '@/hooks/useCountryDisease'
import { DISEASE_LANDMARKS } from '@/lib/disease-catalogue'
import { DISEASE_COLOURS } from '@/lib/colour-scale'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import type { Disease } from '@/types/app.types'

interface DiseaseHistoryTabProps {
  iso3: string
  disease: Disease
}

export function DiseaseHistoryTab({ iso3, disease }: DiseaseHistoryTabProps) {
  const { data, isLoading } = useCountryDiseaseTimeSeries(iso3, disease.whoIndicator)
  const chartData = useMemo(
    () =>
      (data ?? [])
        .filter((r) => r.NumericValue !== null)
        .sort((a, b) => a.TimeDim - b.TimeDim)
        .map((r) => ({ year: r.TimeDim, value: r.NumericValue as number })),
    [data],
  )
  const landmarks = DISEASE_LANDMARKS[disease.id] ?? []

  const peakEntry = useMemo(
    () =>
      chartData.length > 0
        ? chartData.reduce((max, d) => (d.value > max.value ? d : max), chartData[0])
        : null,
    [chartData],
  )
  const totalCases = useMemo(
    () => (chartData.length > 0 ? chartData.reduce((sum, d) => sum + d.value, 0) : null),
    [chartData],
  )
  const yearSpan =
    chartData.length > 1
      ? `${chartData[0].year}–${chartData.at(-1)!.year}`
      : chartData[0]
        ? String(chartData[0].year)
        : null

  if (isLoading) return <LoadingSkeleton label={`Loading ${disease.name} history...`} rows={5} />
  return (
    <div className="flex flex-col gap-6">
      {(peakEntry || totalCases !== null || yearSpan) && (
        <div className="grid grid-cols-3 gap-2">
          {yearSpan && (
            <div className="rounded border border-slate-800 bg-slate-900/40 p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Data span</p>
              <p className="mt-1 text-xs font-bold text-slate-200">{yearSpan}</p>
            </div>
          )}
          {peakEntry && (
            <div className="rounded border border-slate-800 bg-slate-900/40 p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Peak year</p>
              <p className="mt-1 text-xs font-bold text-slate-200">{peakEntry.year}</p>
              <p className="text-[10px] text-slate-500">{peakEntry.value.toLocaleString()}</p>
            </div>
          )}
          {totalCases !== null && (
            <div className="rounded border border-slate-800 bg-slate-900/40 p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Cumulative</p>
              <p className="mt-1 text-xs font-bold text-slate-200">
                {totalCases >= 1_000_000
                  ? `${(totalCases / 1_000_000).toFixed(1)}M`
                  : totalCases >= 1_000
                    ? `${(totalCases / 1_000).toFixed(0)}K`
                    : totalCases.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500">all years</p>
            </div>
          )}
        </div>
      )}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Cases — full recorded history
        </h3>
        <EpidemicCurveChart
          data={chartData}
          diseaseName={disease.name}
          colour={DISEASE_COLOURS[disease.category]}
        />
      </div>
      <EpidemicTimeline events={landmarks} diseaseName={disease.name} />
    </div>
  )
}
