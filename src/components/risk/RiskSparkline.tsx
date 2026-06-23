import { AreaChart, Area, Tooltip, YAxis } from 'recharts'
import type { DayRisk, RiskLevel } from '@/types/risk.types'

const PEAK_COLOUR: Record<RiskLevel, string> = {
  low: '#22c55e',
  moderate: '#f59e0b',
  high: '#ef4444',
}

function peakLevel(timeline: DayRisk[]): RiskLevel {
  return timeline.reduce((best, d) => (d.score > best.score ? d : best)).level
}

export function RiskSparkline({ timeline, disease }: { timeline: DayRisk[]; disease: string }) {
  const colour = PEAK_COLOUR[peakLevel(timeline)]
  const data = timeline.map((d) => ({ date: d.date, score: d.score, level: d.level }))

  return (
    <div role="img" aria-label={`14-day ${disease} risk trend`}>
      <AreaChart
        width={120}
        height={40}
        data={data}
        margin={{ top: 2, bottom: 2, left: 0, right: 0 }}
      >
        <YAxis domain={[0, 1]} hide />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload as { date: string; level: string }
            return (
              <div className="rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-700 shadow">
                {d.date} · {d.level}
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke={colour}
          fill={colour}
          fillOpacity={0.3}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </div>
  )
}
