interface GlobeLegendProps {
  diseaseName: string
  unit: string
}

const LEVELS = [
  { label: 'No data', colour: '#d1d5db' },
  { label: 'Very low', colour: '#fef9c3' },
  { label: 'Low', colour: '#fde68a' },
  { label: 'Medium', colour: '#f97316' },
  { label: 'High', colour: '#dc2626' },
  { label: 'Critical', colour: '#450a0a' },
]

export function GlobeLegend({ diseaseName, unit }: GlobeLegendProps) {
  return (
    <div
      className="absolute bottom-12 left-4 rounded border border-stone-300 bg-white/95 p-3 backdrop-blur"
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
