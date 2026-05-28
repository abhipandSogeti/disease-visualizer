import { formatCount } from '@/lib/format'

interface GlobeTooltipProps {
  countryName: string
  value: number | null
  unit: string
  year: number
  x: number
  y: number
}

export function GlobeTooltip({ countryName, value, unit, year, x, y }: GlobeTooltipProps) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-50 rounded border border-stone-300 bg-gray-900/95 p-2.5 shadow-xl backdrop-blur"
      style={{ left: x + 12, top: y - 8 }}
    >
      <p className="text-xs font-semibold text-white">{countryName}</p>
      <p className="mt-0.5 text-xs text-gray-400">
        {unit} — {year}
      </p>
      <p className="mt-1 text-sm font-bold text-white">
        {value !== null ? formatCount(value) : 'No data available'}
      </p>
    </div>
  )
}
