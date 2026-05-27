interface TimeScrubberProps {
  value: number
  min: number
  max: number
  onChange: (year: number) => void
}

export function TimeScrubber({ value, min, max, onChange }: TimeScrubberProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <span className="w-10 text-right text-xs text-slate-500">{min}</span>
      <div className="relative flex-1">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
              onChange(Math.min(max, value + 1))
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
              onChange(Math.max(min, value - 1))
            }
          }}
          aria-label="Select year"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          className="w-full cursor-pointer appearance-none rounded-full bg-slate-700 h-1.5 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
        />
        <div
          className="pointer-events-none absolute -top-7 -translate-x-1/2 whitespace-nowrap"
          style={{ left: `${((value - min) / (max - min)) * 100}%` }}
          aria-hidden="true"
        >
          <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
            {value}
          </span>
        </div>
      </div>
      <span className="w-10 text-xs text-slate-500">{max}</span>
    </div>
  )
}
