interface GlobeLegendProps {
  diseaseName: string
  unit: string
}

interface Level {
  label: string
  colour: string
  border?: boolean
}
const LEVELS: Level[] = [
  { label: 'No data', colour: 'transparent', border: true },
  { label: 'Very low', colour: 'rgba(254,229,217,0.72)' },
  { label: 'Low', colour: 'rgba(252,174,145,0.72)' },
  { label: 'Medium', colour: 'rgba(251,106,74,0.72)' },
  { label: 'High', colour: 'rgba(203,24,29,0.72)' },
  { label: 'Critical', colour: 'rgba(103,0,13,0.72)' },
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
              className="h-3 w-6 rounded-sm border border-stone-300"
              style={{
                backgroundColor: level.colour,
                backgroundImage: level.border
                  ? 'repeating-linear-gradient(45deg,#ccc 0,#ccc 1px,transparent 0,transparent 50%)'
                  : undefined,
                backgroundSize: level.border ? '4px 4px' : undefined,
              }}
              aria-hidden="true"
            />
            <span className="text-[9px] text-gray-600">{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
