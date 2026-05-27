import { formatCount } from '@/lib/format'
import { TrendBadge } from './TrendBadge'

interface MetricCardProps {
  label: string
  value: number | null
  context: string
  previous?: number | null
  unit?: string
}

export function MetricCard({ label, value, context, previous, unit }: MetricCardProps) {
  return (
    <div className="rounded border border-slate-800 bg-slate-900/60 p-3">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-100">
        {value === null ? (
          'No data available'
        ) : (
          <>
            {formatCount(value)}
            {unit && <span className="ml-1 text-sm font-normal text-slate-400">{unit}</span>}
          </>
        )}
      </p>
      {previous !== undefined && previous !== null && value !== null && (
        <div className="mt-1">
          <TrendBadge previous={previous} current={value} />
        </div>
      )}
      {context && <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{context}</p>}
    </div>
  )
}
