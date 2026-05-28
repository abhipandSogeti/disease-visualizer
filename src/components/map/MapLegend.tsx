interface MapLegendProps {
  diseaseName: string
  unit: string
}

const LEVELS = [
  { label: 'No data', colour: 'rgba(209,213,219,0.4)', border: true },
  { label: 'Very low', colour: 'rgba(254,229,217,0.72)' },
  { label: 'Low', colour: 'rgba(252,174,145,0.72)' },
  { label: 'Medium', colour: 'rgba(251,106,74,0.72)' },
  { label: 'High', colour: 'rgba(203,24,29,0.72)' },
  { label: 'Critical', colour: 'rgba(103,0,13,0.72)' },
]

export function MapLegend({ diseaseName, unit }: MapLegendProps) {
  return (
    <div
      className="absolute bottom-4 left-4 rounded border border-stone-300 bg-white/95 p-3 shadow-sm"
      aria-label="Map colour legend"
    >
      <p className="mb-2 text-xs font-semibold text-gray-700">
        {diseaseName} — {unit}
      </p>
      <div className="flex gap-1">
        {LEVELS.map((level) => (
          <div key={level.label} className="flex flex-col items-center gap-1">
            <div
              className="h-3 w-6 rounded-sm"
              style={{ backgroundColor: level.colour }}
              aria-hidden="true"
            />
            <span className="text-[9px] text-gray-600">{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
