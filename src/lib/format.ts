export function formatCount(value: number | null | undefined): string {
  if (value == null) return 'No data available'
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} Billion`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} Million`
  if (value >= 1_000) return value.toLocaleString('en-US')
  return String(Math.round(value))
}

export function formatRate(value: number): string {
  return `${(value * 1000).toFixed(1)} per 1,000 people`
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function formatYear(year: number): string {
  return String(year)
}

export type TrendDirection = 'increasing' | 'decreasing' | 'stable'

export function getTrendDirection(previous: number, current: number): TrendDirection {
  const pct = ((current - previous) / previous) * 100
  if (pct > 1) return 'increasing'
  if (pct < -1) return 'decreasing'
  return 'stable'
}

export function formatTrend(previous: number | null, current: number | null): string {
  if (previous == null || current == null) return 'No comparison data'
  const pct = ((current - previous) / previous) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% from last year`
}

export function formatMagnitudeContext(value: number, label: string): string {
  if (value >= 1_000_000) {
    const cities = Math.round(value / 500_000)
    if (cities >= 2)
      return `Equivalent to ${cities} mid-sized cities losing their entire population`
  }
  return `${formatCount(value)} ${label}`
}
