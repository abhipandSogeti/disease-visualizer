import { AlertCircle } from 'lucide-react'
import { useAdverseEvents } from '@/hooks/useDrugLabel'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'

interface AdverseEventsPanelProps {
  drugName: string
}

export function AdverseEventsPanel({ drugName }: AdverseEventsPanelProps) {
  const { data, isLoading } = useAdverseEvents(drugName)

  if (isLoading) return <LoadingSkeleton label="Loading adverse events from FDA..." rows={4} />

  const top = (data ?? []).slice(0, 8)
  const maxCount = Math.max(...top.map((e) => e.count), 1)

  if (top.length === 0) {
    return (
      <EmptyState
        message="No adverse event reports found in the FDA database for this drug."
        suggestion="This may mean the drug is new, rarely prescribed, or uses a different name in the FDA system."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-gray-600" aria-hidden="true" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
          Most Reported Side Effects (FDA)
        </h3>
      </div>
      <div className="flex flex-col gap-2">
        {top.map((event) => {
          const pct = Math.round((event.count / maxCount) * 100)
          return (
            <div key={event.reaction}>
              <div className="mb-0.5 flex items-center justify-between">
                <span className="text-xs capitalize text-gray-700">
                  {event.reaction.toLowerCase()}
                </span>
                <span className="text-xs text-gray-600">
                  {event.count.toLocaleString()} reports
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-amber-600/70"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${event.reaction}: ${event.count} reports`}
                />
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs leading-relaxed text-gray-600">
        These events are self-reported by patients and healthcare providers to the FDA. Many may be
        symptoms of the disease being treated rather than caused by the drug itself. Source: FDA
        Adverse Event Reporting System (FAERS).
      </p>
    </div>
  )
}
