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
    increasing: { icon: TrendingUp, color: 'text-red-700', bg: 'bg-red-50 border border-red-200' },
    decreasing: {
      icon: TrendingDown,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border border-emerald-200',
    },
    stable: { icon: Minus, color: 'text-gray-600', bg: 'bg-stone-100 border border-stone-300' },
  }[direction]

  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color} ${config.bg}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {direction === 'stable' ? 'Stable' : label}
    </span>
  )
}
