import {
  getDrugEfficacyData,
  getDrugResistanceNote,
  getDrugCombinationNote,
} from '@/lib/drug-intelligence'
import { EmptyState } from '@/components/ui/EmptyState'
import { AlertTriangle, Info } from 'lucide-react'

interface DrugEfficacyTabProps {
  drugName: string
}

export function DrugEfficacyTab({ drugName }: DrugEfficacyTabProps) {
  const efficacyData = getDrugEfficacyData(drugName)
  const resistanceNote = getDrugResistanceNote(drugName)
  const combinationNote = getDrugCombinationNote(drugName)

  if (efficacyData.length === 0) {
    return (
      <EmptyState
        message="Efficacy data not yet curated for this drug."
        suggestion="Check clinical trial databases such as ClinicalTrials.gov for the latest evidence."
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
          Clinical cure rates
        </h3>
        <p className="mb-3 text-xs text-gray-600">
          These percentages show how often the drug works in clinical trials for each condition.
          Higher is better.
        </p>
        <div className="flex flex-col gap-3">
          {efficacyData.map((entry) => (
            <div key={entry.condition}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">{entry.condition}</span>
                <span className="text-xs font-bold text-gray-800">{entry.efficacyPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-700"
                  style={{ width: `${entry.efficacyPercent}%` }}
                  role="progressbar"
                  aria-valuenow={entry.efficacyPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${entry.condition}: ${entry.efficacyPercent}% efficacy`}
                />
              </div>
              <p className="mt-0.5 text-xs text-gray-600">{entry.note}</p>
            </div>
          ))}
        </div>
      </div>
      {resistanceNote && (
        <div className="flex items-start gap-2 rounded border border-amber-900/40 bg-amber-950/20 p-3">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs font-semibold text-amber-300">Drug Resistance</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">{resistanceNote}</p>
          </div>
        </div>
      )}
      {combinationNote && (
        <div className="flex items-start gap-2 rounded border border-blue-900/40 bg-blue-950/20 p-3">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-700" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-blue-300">Combination Therapy</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">{combinationNote}</p>
          </div>
        </div>
      )}
    </div>
  )
}
