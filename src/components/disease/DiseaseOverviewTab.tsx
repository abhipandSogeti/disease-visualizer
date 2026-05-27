import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { useCountryDiseaseTimeSeries } from '@/hooks/useCountryDisease'
import { usePopulation } from '@/hooks/useWorldBank'
import { DISEASE_COLOURS } from '@/lib/colour-scale'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { MetricCard } from './MetricCard'
import { EpidemicCurveChart } from './EpidemicCurveChart'
import { exportAsCsv } from '@/lib/export'
import type { Disease, Persona } from '@/types/app.types'

interface DiseaseOverviewTabProps {
  iso3: string
  disease: Disease
  persona: Persona
}

export function DiseaseOverviewTab({ iso3, disease, persona }: DiseaseOverviewTabProps) {
  const { data, isLoading, isError, refetch } = useCountryDiseaseTimeSeries(
    iso3,
    disease.whoIndicator,
  )
  const { data: popData } = usePopulation(iso3.slice(0, 2))

  const latestPop = useMemo(() => popData?.find((d) => d.value !== null)?.value ?? null, [popData])

  const sorted = useMemo(() => [...(data ?? [])].sort((a, b) => a.TimeDim - b.TimeDim), [data])
  const latest = sorted.at(-1)
  const previous = sorted.at(-2)

  const chartData = useMemo(
    () =>
      sorted
        .filter((r) => r.NumericValue !== null)
        .map((r) => ({ year: r.TimeDim, value: r.NumericValue as number })),
    [sorted],
  )

  const incidenceRate = useMemo(() => {
    if (!latest?.NumericValue || !latestPop) return null
    return latest.NumericValue / latestPop
  }, [latest, latestPop])

  if (isLoading)
    return <LoadingSkeleton label={`Fetching ${disease.name} data for this country...`} />
  if (isError)
    return (
      <ErrorState
        message={`Could not load ${disease.name} data.`}
        detail="WHO servers may be temporarily unavailable."
        onRetry={() => void refetch()}
      />
    )

  const colour = DISEASE_COLOURS[disease.category]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Most Recent Cases"
          value={latest?.NumericValue ?? null}
          previous={previous?.NumericValue ?? null}
          context={latest ? `Recorded in ${latest.TimeDim}` : ''}
        />
        <MetricCard
          label="Incidence Rate"
          value={incidenceRate}
          unit="per person"
          context="Cases relative to total population"
        />
      </div>
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Cases over time
        </h3>
        <EpidemicCurveChart data={chartData} diseaseName={disease.name} colour={colour} />
        <p className="mt-1 text-xs text-slate-600">
          Source: WHO Global Health Observatory · Data from {chartData[0]?.year ?? '—'} to{' '}
          {chartData.at(-1)?.year ?? '—'}
        </p>
      </div>
      {(persona === 'epidemiologist' || persona === 'clinical') && (
        <div className="rounded border border-slate-800 bg-slate-900/40 p-3">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Epidemiology Detail
          </h3>
          <p className="text-xs leading-relaxed text-slate-400">
            Extended epidemiological breakdown — age cohort data, seasonality, and R-naught curves —
            will appear here when WHO sub-indicator data is available for the selected country.
          </p>
        </div>
      )}
      {persona === 'analyst' && chartData.length > 0 && (
        <button
          onClick={() => {
            exportAsCsv(
              `${disease.id}-${iso3}`,
              ['Year', 'Cases'],
              chartData.map((d) => [String(d.year), String(d.value)]),
            )
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded border border-slate-700 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Export data as CSV
        </button>
      )}
    </div>
  )
}
