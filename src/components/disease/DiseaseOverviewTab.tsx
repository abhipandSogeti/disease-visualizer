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
import { getDataSource, WORLD_BANK_SOURCE } from '@/lib/data-provenance'
import type { WorldBankIndicatorValue } from '@/types/worldbank.schema'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
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

  // Latest record that actually has a value (World Bank returns recent years with
  // null values); year and value come from the same point so the badge stays truthful.
  const latestWB = (records?: WorldBankIndicatorValue[]): WorldBankIndicatorValue | null =>
    [...(records ?? [])]
      .filter((r) => r.value !== null)
      .sort((a, b) => Number(b.date) - Number(a.date))[0] ?? null

  const beds = useMemo(() => latestWB(bedsData), [bedsData])
  const lifeExp = useMemo(() => latestWB(lifeExpData), [lifeExpData])
  const gdp = useMemo(() => latestWB(gdpData), [gdpData])

  const peakEntry = useMemo(
    () =>
      chartData.length > 0
        ? chartData.reduce((max, d) => (d.value > max.value ? d : max), chartData[0])
        : null,
    [chartData],
  )

  if (!disease.whoIndicator)
    return (
      <EmptyState
        message={`No WHO surveillance data available for ${disease.name}.`}
        suggestion="WHO does not publish country-level time-series for this disease via the Global Health Observatory API."
      />
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
  if (!isLoading && sorted.length === 0)
    return (
      <EmptyState
        message={`No ${disease.name} cases recorded for this country.`}
        suggestion="WHO has no reported cases for this country in their surveillance dataset. Try a country in an endemic region."
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
          context=""
          dataYear={latest?.TimeDim ?? null}
          source={getDataSource(disease.id)}
          accent={colour}
        />
        <MetricCard
          label="Incidence Rate"
          value={incidencePer100k !== null ? Math.round(incidencePer100k) : null}
          unit="per 100k"
          context="per 100,000 population"
          dataYear={latest?.TimeDim ?? null}
          source={getDataSource(disease.id)}
          accent={colour}
        />
      </div>
      {peakEntry && (
        <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-sm">
          <span className="text-[11px] font-medium text-gray-500">Peak recorded year</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">{peakEntry.year}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ background: colour }}
            >
              {peakEntry.value.toLocaleString()}
            </span>
          </div>
        </div>
      )}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: colour }} />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            Cases over time
          </h3>
        </div>
        <EpidemicCurveChart data={chartData} diseaseName={disease.name} colour={colour} />
        <p className="mt-1 text-[11px] text-gray-400">
          WHO Global Health Observatory · {chartData[0]?.year ?? '—'}–
          {chartData.at(-1)?.year ?? '—'}
        </p>
      </div>
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gray-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            Country health context
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <MetricCard
            label="Hospital Beds"
            value={beds?.value != null ? Math.round(beds.value * 10) / 10 : null}
            unit="per 1k"
            context=""
            dataYear={beds ? Number(beds.date) : null}
            source={WORLD_BANK_SOURCE}
          />
          <MetricCard
            label="Life Expectancy"
            value={lifeExp?.value != null ? Math.round(lifeExp.value * 10) / 10 : null}
            unit="yrs"
            context=""
            dataYear={lifeExp ? Number(lifeExp.date) : null}
            source={WORLD_BANK_SOURCE}
          />
          <MetricCard
            label="GDP / Capita"
            value={gdp?.value != null ? Math.round(gdp.value) : null}
            unit="USD"
            context=""
            dataYear={gdp ? Number(gdp.date) : null}
            source={WORLD_BANK_SOURCE}
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
          className="flex w-full items-center justify-center gap-1.5 rounded border border-stone-300 py-2 text-xs text-gray-600 hover:bg-stone-200 hover:text-gray-900"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Export data as CSV
        </button>
      )}
    </div>
  )
}
