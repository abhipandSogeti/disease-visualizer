import { formatCount } from '@/lib/format'
import { isStale, type DataSource } from '@/lib/data-provenance'
import { TrendBadge } from './TrendBadge'

interface MetricCardProps {
  label: string
  value: number | null
  context: string
  previous?: number | null
  unit?: string
  accent?: string
  dataYear?: number | null
  source?: DataSource
}

export function MetricCard({
  label,
  value,
  context,
  previous,
  unit,
  accent,
  dataYear,
  source,
}: MetricCardProps) {
  const stale = dataYear != null && isStale(dataYear)
  return (
    <div className="relative overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      {accent && (
        <div
          className="absolute inset-y-0 left-0 w-[3px] rounded-l-lg"
          style={{ background: accent }}
        />
      )}
      <div className={accent ? 'py-3 pl-4 pr-3' : 'px-3 py-3'}>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold leading-none text-gray-900">
          {value === null ? (
            <span className="text-sm font-normal text-gray-400">No data</span>
          ) : (
            <>
              {formatCount(value)}
              {unit && <span className="ml-1 text-sm font-normal text-gray-500">{unit}</span>}
            </>
          )}
        </p>
        {previous !== undefined && previous !== null && value !== null && (
          <div className="mt-1.5">
            <TrendBadge previous={previous} current={value} />
          </div>
        )}
        {context && <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500">{context}</p>}
        {dataYear != null && source && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-1.5 block text-[10px] leading-snug hover:underline ${
              stale ? 'text-amber-700' : 'text-gray-400'
            }`}
          >
            {stale ? '⚠ ' : ''}Data: {dataYear} · {source.label}
            {stale ? ' (latest available)' : ''}
          </a>
        )}
      </div>
    </div>
  )
}
