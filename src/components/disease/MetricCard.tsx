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
    <div className="rounded border border-stone-300 bg-stone-200/60 p-3">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-600">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">
        {value === null ? (
          'No data available'
        ) : (
          <>
            {formatCount(value)}
            {unit && <span className="ml-1 text-sm font-normal text-gray-600">{unit}</span>}
          </>
        )}
      </p>
      {previous !== undefined && previous !== null && value !== null && (
        <div className="mt-1">
          <TrendBadge previous={previous} current={value} />
        </div>
      )}
      {context && <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{context}</p>}
    </div>
  )
}
