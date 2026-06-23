import type { TrendSummary, TrendDirection } from '@/types/risk.types'

const DIRECTION_CONFIG: Record<
  TrendDirection,
  { label: string; arrow: string; className: string }
> = {
  rising: { label: 'Rising', arrow: '↑', className: 'text-amber-600' },
  falling: { label: 'Falling', arrow: '↓', className: 'text-green-600' },
  stable: { label: 'Stable', arrow: '→', className: 'text-gray-500' },
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function TrendBadge({ summary }: { summary: TrendSummary }) {
  const { label, arrow, className } = DIRECTION_CONFIG[summary.direction]
  const peakFormatted = formatDate(summary.peakDate)

  let text: string
  if (summary.direction === 'rising') {
    text = `${label} ${arrow} — peak risk ${peakFormatted}`
  } else if (summary.direction === 'falling') {
    text = `${label} ${arrow} — improving after ${peakFormatted}`
  } else {
    text = `${label} — ${summary.peakLevel} risk through ${peakFormatted}`
  }

  return <p className={`text-[11px] ${className}`}>{text}</p>
}
