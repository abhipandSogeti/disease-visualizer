import { AlertOctagon, AlertTriangle, Info } from 'lucide-react'
import { useDrugInteractions } from '@/hooks/useDrugInteractions'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'

const SEVERITY_CONFIG = {
  high: {
    label: 'Severe — Avoid combining',
    Icon: AlertOctagon,
    colour: 'text-red-400',
    bg: 'bg-red-950/30 border-red-900/50',
    textBg: 'bg-red-950/20',
  },
  medium: {
    label: 'Moderate — Use with caution',
    Icon: AlertTriangle,
    colour: 'text-amber-400',
    bg: 'bg-amber-950/30 border-amber-900/50',
    textBg: 'bg-amber-950/20',
  },
  low: {
    label: 'Mild — Monitor',
    Icon: Info,
    colour: 'text-slate-400',
    bg: 'bg-slate-800/60 border-slate-700/50',
    textBg: 'bg-slate-800/40',
  },
} as const

type SeverityKey = keyof typeof SEVERITY_CONFIG

function normaliseSeverity(raw: string | undefined): SeverityKey {
  const s = (raw ?? '').toLowerCase()
  if (s.includes('high') || s.includes('major')) return 'high'
  if (s.includes('medium') || s.includes('moderate')) return 'medium'
  return 'low'
}

interface DrugInteractionsTabProps {
  drugName: string
}

export function DrugInteractionsTab({ drugName }: DrugInteractionsTabProps) {
  const { interactions, isLoading, isError } = useDrugInteractions(drugName)

  if (isLoading)
    return <LoadingSkeleton label="Checking drug interactions via RxNorm..." rows={3} />
  if (isError)
    return (
      <EmptyState
        message="Could not load interaction data."
        suggestion="RxNorm (NIH) may be temporarily unavailable."
      />
    )

  const allPairs = interactions.flatMap((interaction) =>
    interaction.interactionPair.map((pair) => ({
      severity: normaliseSeverity(pair.severity),
      name: pair.interactionConcept[1]?.minConceptItem.name ?? 'Unknown drug',
      description:
        pair.description ??
        pair.interactionConcept[1]?.sourceConceptItem.description ??
        'Potential interaction — consult a healthcare professional.',
    })),
  )

  if (allPairs.length === 0) {
    return (
      <EmptyState
        message={`No significant drug interactions found for ${drugName}.`}
        suggestion="Always consult a healthcare professional before combining medications."
      />
    )
  }

  const grouped = {
    high: allPairs.filter((p) => p.severity === 'high'),
    medium: allPairs.filter((p) => p.severity === 'medium'),
    low: allPairs.filter((p) => p.severity === 'low'),
  } satisfies Record<SeverityKey, typeof allPairs>

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-500">
        Drug interactions sourced from NIH RxNorm database. Always consult a healthcare professional
        before combining medications.
      </p>
      {(Object.entries(grouped) as [SeverityKey, typeof allPairs][])
        .filter(([, pairs]) => pairs.length > 0)
        .map(([severity, pairs]) => {
          const { label, Icon, colour, bg, textBg } = SEVERITY_CONFIG[severity]
          return (
            <div key={severity}>
              <div className={`mb-2 flex items-center gap-2 rounded border p-2 ${bg}`}>
                <Icon className={`h-4 w-4 ${colour}`} aria-hidden="true" />
                <span className={`text-xs font-semibold ${colour}`}>{label}</span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {pairs.map((pair, i) => (
                  <li key={i} className={`rounded p-2.5 text-xs ${textBg}`}>
                    <p className="font-semibold text-slate-200">{pair.name}</p>
                    <p className="mt-0.5 leading-relaxed text-slate-500">{pair.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
    </div>
  )
}
