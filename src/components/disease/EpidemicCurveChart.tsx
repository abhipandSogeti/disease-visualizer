import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCount } from '@/lib/format'
import { EmptyState } from '@/components/ui/EmptyState'

interface DataPoint {
  year: number
  value: number
}
interface EpidemicCurveChartProps {
  data: DataPoint[]
  diseaseName: string
  colour: string
}

function CustomTooltip({
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
    <div className="rounded border border-slate-700 bg-slate-900 p-2 text-xs shadow-xl">
      <p className="font-semibold text-slate-200">{label}</p>
      <p className="mt-0.5 text-slate-400">{formatCount(payload[0].value)}</p>
    </div>
  )
}

export function EpidemicCurveChart({ data, diseaseName, colour }: EpidemicCurveChartProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        message="No historical data available for this disease and country."
        suggestion="Try selecting a different country or disease from the left panel."
      />
    )
  }
  return (
    <div role="img" aria-label={`${diseaseName} cases over time`} className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${diseaseName}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colour} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colour} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatCount(v)}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={colour}
            strokeWidth={2}
            fill={`url(#gradient-${diseaseName})`}
            dot={false}
            activeDot={{ r: 4, fill: colour }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
