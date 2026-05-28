import { Activity, Zap, Shield, FlaskConical, Target, Heart } from 'lucide-react'
import { useDrugTargets } from '@/hooks/useDrugTargets'
import { getDrugMechanismSteps } from '@/lib/drug-intelligence'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'

const ICON_MAP = {
  activity: Activity,
  zap: Zap,
  shield: Shield,
  flask: FlaskConical,
  target: Target,
  heart: Heart,
} as const

interface DrugMechanismTabProps {
  drugName: string
}

export function DrugMechanismTab({ drugName }: DrugMechanismTabProps) {
  const steps = getDrugMechanismSteps(drugName)
  const { activities, isLoading } = useDrugTargets(drugName)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          How {drugName} works — step by step
        </h3>
        {steps.length === 0 ? (
          <EmptyState
            message="Detailed mechanism steps are not yet curated for this drug."
            suggestion="Check the Overview tab for the FDA mechanism of action description."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {steps.map((step) => {
              const Icon = ICON_MAP[step.icon]
              return (
                <div
                  key={step.step}
                  className="flex gap-3 rounded border border-stone-300 bg-stone-200/40 p-3"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-950/50">
                    <Icon className="h-3.5 w-3.5 text-gray-700" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      Step {step.step} of {steps.length} — {step.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-400">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {isLoading ? (
        <LoadingSkeleton label="Loading protein targets from ChEMBL..." rows={2} />
      ) : (
        activities.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Known protein targets (ChEMBL)
            </h3>
            <p className="mb-2 text-xs text-gray-400">
              Proteins in the body or pathogen that this drug interacts with. A target is like a
              lock — the drug is the key.
            </p>
            <ul className="flex flex-col gap-1.5">
              {activities.slice(0, 8).map((a) => (
                <li
                  key={a.activity_id}
                  className="flex items-start gap-2 rounded bg-stone-200/40 px-3 py-2"
                >
                  <Target
                    className="mt-0.5 h-3 w-3 flex-shrink-0 text-purple-700"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-medium text-gray-700">
                      {a.target_pref_name ?? 'Unknown target'}
                    </p>
                    {a.standard_type && a.standard_value && (
                      <p className="text-xs text-gray-400">
                        {a.standard_type}: {a.standard_value} {a.standard_units ?? ''}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-400">
              Source: ChEMBL bioactivity database · European Bioinformatics Institute
            </p>
          </div>
        )
      )}
    </div>
  )
}
