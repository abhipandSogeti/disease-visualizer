import { TimelineEvent } from './TimelineEvent'
import { EmptyState } from '@/components/ui/EmptyState'
import type { LandmarkEvent } from '@/lib/disease-catalogue'

interface EpidemicTimelineProps {
  events: LandmarkEvent[]
  diseaseName: string
}

export function EpidemicTimeline({ events, diseaseName }: EpidemicTimelineProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        message={`No historical events recorded for ${diseaseName}.`}
        suggestion="Historical landmark data is available for Malaria, TB, HIV, and COVID-19."
      />
    )
  }
  const sorted = [...events].sort((a, b) => a.year - b.year)
  return (
    <div aria-label={`${diseaseName} historical timeline`}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-600">
        {diseaseName} — Historical Timeline
      </h3>
      <div className="flex flex-col">
        {sorted.map((event, i) => (
          <TimelineEvent
            key={`${event.year}-${event.title}`}
            event={event}
            isLast={i === sorted.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
