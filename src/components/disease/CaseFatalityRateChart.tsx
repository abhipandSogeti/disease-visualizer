import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useCFR } from '@/hooks/useEpidemiology'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { ErrorState } from '@/components/ui/ErrorState'

interface CaseFatalityRateChartProps {
  iso3: string
  diseaseId: string
}

const DISEASE_DISPLAY_NAMES: Record<string, string> = {
  malaria: 'Malaria',
  tuberculosis: 'Tuberculosis',
  hiv: 'HIV/AIDS',
  cholera: 'Cholera',
  polio: 'Polio',
  dengue: 'Dengue',
  covid19: 'COVID-19',
  ebola: 'Ebola',
}

const COLOUR = '#ef4444'

interface DataPoint {
  year: number
  value: number
}

function CfrTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded border border-stone-300 bg-stone-100 p-2 text-xs shadow-xl">
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="mt-0.5 text-gray-600">{payload[0].value.toFixed(2)}%</p>
    </div>
  )
}

export function CaseFatalityRateChart({ iso3, diseaseId }: CaseFatalityRateChartProps) {
  const { data, isLoading, isError, hasData } = useCFR(iso3, diseaseId)

  if (isLoading) {
    return <LoadingSkeleton label="Loading case fatality rate..." rows={3} />
  }

  if (isError) {
    return (
      <ErrorState message="Could not load CFR data." detail="WHO servers may be unavailable." />
    )
  }

  if (!hasData) {
    const diseaseName = DISEASE_DISPLAY_NAMES[diseaseId] ?? diseaseId
    return (
      <div className="rounded border border-stone-300 bg-stone-200/40 p-3 text-xs text-gray-600">
        WHO does not publish a case fatality rate for {diseaseName} via the GHO API.
      </div>
    )
  }

  const chartData: DataPoint[] = (data ?? []).map((row) => ({ year: row.year, value: row.cfr }))
  const firstYear = chartData[0]?.year
  const lastYear = chartData[chartData.length - 1]?.year

  return (
    <div className="flex flex-col gap-1">
      <div
        role="img"
        aria-label={`Case fatality rate for ${DISEASE_DISPLAY_NAMES[diseaseId] ?? diseaseId} over time`}
        className="h-40 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-cfr-${diseaseId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLOUR} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLOUR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fill: '#374151', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => `${v.toFixed(1)}%`}
              tick={{ fill: '#374151', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={52}
              label={{
                value: 'CFR %',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { fill: '#374151', fontSize: 10 },
              }}
            />
            <Tooltip content={<CfrTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={COLOUR}
              strokeWidth={2}
              fill={`url(#gradient-cfr-${diseaseId})`}
              dot={false}
              activeDot={{ r: 4, fill: COLOUR }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-xs text-gray-600">
        Derived from WHO GHO deaths / incidence · {firstYear}–{lastYear}
      </p>
    </div>
  )
}
