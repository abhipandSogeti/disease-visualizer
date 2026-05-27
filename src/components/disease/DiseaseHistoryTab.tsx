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
  if (isLoading) return <LoadingSkeleton label={`Loading ${disease.name} history...`} rows={5} />
  return (
    <div className="flex flex-col gap-6">
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
