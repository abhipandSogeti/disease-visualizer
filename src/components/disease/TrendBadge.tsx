import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getTrendDirection, formatTrend } from '@/lib/format'

interface TrendBadgeProps {
  previous: number
  current: number
}

export function TrendBadge({ previous, current }: TrendBadgeProps) {
  const direction = getTrendDirection(previous, current)
  const label = formatTrend(previous, current)

  const config = {
    increasing: { icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-950/40' },
    decreasing: { icon: TrendingDown, color: 'text-green-700', bg: 'bg-green-950/40' },
    stable: { icon: Minus, color: 'text-gray-600', bg: 'bg-stone-200/60' },
  }[direction]

  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs ${config.color} ${config.bg}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {direction === 'stable' ? 'Stable — less than 1% change' : label}
    </span>
  )
}
