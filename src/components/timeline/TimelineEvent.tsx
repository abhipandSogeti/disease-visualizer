import { Zap, Shield, FlaskConical, Flag, AlertTriangle } from 'lucide-react'
import type { LandmarkEvent } from '@/lib/disease-catalogue'

interface TimelineEventProps {
  event: LandmarkEvent
  isLast: boolean
}

const TYPE_CONFIG = {
  outbreak: { Icon: Zap, colour: 'text-red-600', bg: 'bg-red-950/40', label: 'Outbreak' },
  intervention: {
    Icon: Shield,
    colour: 'text-gray-700',
    bg: 'bg-blue-950/40',
    label: 'Intervention',
  },
  discovery: {
    Icon: FlaskConical,
    colour: 'text-purple-700',
    bg: 'bg-purple-950/40',
    label: 'Discovery',
  },
  milestone: { Icon: Flag, colour: 'text-green-700', bg: 'bg-green-950/40', label: 'Milestone' },
  warning: {
    Icon: AlertTriangle,
    colour: 'text-amber-700',
    bg: 'bg-amber-950/40',
    label: 'Warning',
  },
} as const

export function TimelineEvent({ event, isLast }: TimelineEventProps) {
  const { Icon, colour, bg, label } = TYPE_CONFIG[event.type]
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${bg}`}
        >
          <Icon className={`h-3.5 w-3.5 ${colour}`} aria-hidden="true" />
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-stone-200" aria-hidden="true" />}
      </div>
      <div className="pb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700">{event.year}</span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${colour} ${bg}`}>
            {label}
          </span>
        </div>
        <p className="mt-0.5 text-xs font-semibold text-gray-800">{event.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-400">{event.description}</p>
      </div>
    </div>
  )
}
