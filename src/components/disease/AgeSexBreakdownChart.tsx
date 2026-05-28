import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useAgeSexBreakdown } from '@/hooks/useEpidemiology'
import { formatCount } from '@/lib/format'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { ErrorState } from '@/components/ui/ErrorState'

interface AgeSexBreakdownChartProps {
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

function getDiseaseName(diseaseId: string): string {
  return (
    DISEASE_DISPLAY_NAMES[diseaseId] ??
    diseaseId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

interface TooltipPayloadEntry {
  dataKey: string
  value: number
  color: string
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded border border-stone-300 bg-stone-100 p-2 text-xs shadow-xl">
      <p className="mb-1 font-semibold text-gray-800">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="mt-0.5">
          {entry.dataKey === 'male' ? 'Male' : 'Female'}: {formatCount(entry.value)}
        </p>
      ))}
    </div>
  )
}

export function AgeSexBreakdownChart({ iso3, diseaseId }: AgeSexBreakdownChartProps) {
  const { data, isLoading, isError, hasData, year } = useAgeSexBreakdown(iso3, diseaseId)

  if (!hasData && !isLoading && !isError) {
    return (
      <div className="rounded border border-stone-300 bg-stone-200/40 p-3 text-xs text-gray-400">
        WHO does not currently publish age-stratified {getDiseaseName(diseaseId)} data. Age
        breakdowns are available for tuberculosis.
      </div>
    )
  }

  if (isLoading) {
    return <LoadingSkeleton label="Loading age breakdown..." rows={4} />
  }

  if (isError) {
    return (
      <ErrorState message="Could not load age data." detail="WHO servers may be unavailable." />
    )
  }

  if (!data) return null

  return (
    <div>
      <div role="img" aria-label="TB cases by age and sex">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <YAxis
              type="category"
              dataKey="ageGroup"
              width={40}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <XAxis
              type="number"
              tickFormatter={(v: number) => formatCount(v)}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 10, color: '#64748b' }}
              formatter={(value: string) => (value === 'male' ? 'Male' : 'Female')}
            />
            <Bar dataKey="male" fill="#60a5fa" />
            <Bar dataKey="female" fill="#f472b6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-xs text-gray-400">
        Source: WHO GHO · TB_Notification_agesex_num{year !== undefined ? ` · ${year}` : ''}
      </p>
    </div>
  )
}
