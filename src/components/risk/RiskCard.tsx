import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { RiskResult } from '@/hooks/useRiskAssessment'
import { CareLadderPanel } from './CareLadderPanel'
import { TrendBadge } from './TrendBadge'
import { RiskSparkline } from './RiskSparkline'

const LEVEL_STYLE: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  moderate: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
}
const LABEL: Record<string, string> = { dengue: 'Dengue', cholera: 'Cholera' }

export function RiskCard({ result }: { result: RiskResult }) {
  const [open, setOpen] = useState(false)
  const { assessment, ladder, timeline, trend } = result
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{LABEL[assessment.diseaseId]}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${LEVEL_STYLE[assessment.level]}`}
        >
          {assessment.level}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-gray-500">Confidence: {assessment.confidence}</p>
      <ul className="mt-2 space-y-0.5 text-xs text-gray-700">
        {assessment.drivers.map((d) => (
          <li key={d.factor}>· {d.note}</li>
        ))}
      </ul>
      {assessment.dataGaps.map((g) => (
        <p key={g} className="mt-1 text-[11px] italic text-gray-500">
          {g}
        </p>
      ))}
      {timeline.length > 0 && (
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <TrendBadge summary={trend} />
          </div>
          <RiskSparkline timeline={timeline} disease={assessment.diseaseId} />
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
        {open ? 'Hide' : 'What to do'}
      </button>
      {open && ladder && (
        <div className="mt-2">
          <CareLadderPanel ladder={ladder} />
        </div>
      )}
    </div>
  )
}
