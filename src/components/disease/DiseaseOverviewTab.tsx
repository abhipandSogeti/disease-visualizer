import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { useCountryDiseaseTimeSeries } from '@/hooks/useCountryDisease'
import {
  usePopulation,
  useHospitalBeds,
  useLifeExpectancy,
  useGdpPerCapita,
} from '@/hooks/useWorldBank'
import { DISEASE_COLOURS } from '@/lib/colour-scale'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { MetricCard } from './MetricCard'
import { EpidemicCurveChart } from './EpidemicCurveChart'
import { EpidemiologyDetailSection } from './EpidemiologyDetailSection'
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
  const { data: popData } = usePopulation(iso3)
  const { data: bedsData } = useHospitalBeds(iso3)
  const { data: lifeExpData } = useLifeExpectancy(iso3)
  const { data: gdpData } = useGdpPerCapita(iso3)

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

  const incidencePer100k = useMemo(() => {
    if (!latest?.NumericValue || !latestPop) return null
    return (latest.NumericValue / latestPop) * 100_000
  }, [latest, latestPop])

  const latestBeds = useMemo(() => bedsData?.[0]?.value ?? null, [bedsData])
  const latestLifeExp = useMemo(() => lifeExpData?.[0]?.value ?? null, [lifeExpData])
  const latestGdp = useMemo(() => gdpData?.[0]?.value ?? null, [gdpData])

  const peakEntry = useMemo(
    () =>
      chartData.length > 0
        ? chartData.reduce((max, d) => (d.value > max.value ? d : max), chartData[0])
        : null,
    [chartData],
  )

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
          value={incidencePer100k !== null ? Math.round(incidencePer100k) : null}
          unit="per 100k people"
          context="Cases per 100,000 population"
        />
      </div>
      {peakEntry && (
        <div className="flex items-center justify-between rounded border border-slate-800 bg-slate-900/40 px-3 py-2">
          <span className="text-xs text-slate-500">Peak recorded year</span>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-200">{peakEntry.year}</span>
            <span className="ml-2 text-xs text-slate-400">
              {peakEntry.value.toLocaleString()} cases
            </span>
          </div>
        </div>
      )}
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
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Country health context
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <MetricCard
            label="Hospital Beds"
            value={latestBeds !== null ? Math.round(latestBeds * 10) / 10 : null}
            unit="per 1k"
            context="World Bank"
          />
          <MetricCard
            label="Life Expectancy"
            value={latestLifeExp !== null ? Math.round(latestLifeExp * 10) / 10 : null}
            unit="yrs"
            context="World Bank"
          />
          <MetricCard
            label="GDP / Capita"
            value={latestGdp !== null ? Math.round(latestGdp) : null}
            unit="USD"
            context="World Bank"
          />
        </div>
      </div>
      {(persona === 'epidemiologist' || persona === 'clinical') && (
        <EpidemiologyDetailSection iso3={iso3} disease={disease} />
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
