import { FlaskConical, Weight, CheckCircle, BookOpen } from 'lucide-react'
import { useDrugLabel } from '@/hooks/useDrugLabel'
import { useDrugMolecule } from '@/hooks/useDrugMolecule'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import type { LucideProps } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'

interface DrugOverviewTabProps {
  drugName: string
  pubchemId: number
}

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | null
  icon: LucideIcon
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 border-b border-stone-300 py-2 last:border-0">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  )
}

export function DrugOverviewTab({ drugName, pubchemId }: DrugOverviewTabProps) {
  const { data: label } = useDrugLabel(drugName)
  const { data: molecule, isLoading: molLoading } = useDrugMolecule(drugName)
  if (molLoading) return <LoadingSkeleton label={`Loading ${drugName} information...`} rows={4} />

  const genericName = label?.openfda?.generic_name?.[0] ?? drugName
  const brandNames = label?.openfda?.brand_name?.slice(0, 3).join(', ') ?? null
  const description = label?.description?.[0] ?? null

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{genericName}</h2>
        {brandNames && <p className="mt-0.5 text-xs text-gray-400">Also known as: {brandNames}</p>}
      </div>
      {molecule && (
        <div className="rounded border border-stone-300 bg-stone-200/40">
          <InfoRow
            icon={FlaskConical}
            label="Molecular Formula"
            value={molecule.molecularFormula}
          />
          <InfoRow
            icon={Weight}
            label="Molecular Weight"
            value={`${molecule.molecularWeight} g/mol`}
          />
          <InfoRow icon={CheckCircle} label="IUPAC Name" value={molecule.iupacName} />
        </div>
      )}
      {description && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              FDA Description
            </span>
          </div>
          <p className="text-xs leading-relaxed text-gray-500">
            {description.slice(0, 600)}
            {description.length > 600 ? '…' : ''}
          </p>
        </div>
      )}
      {label?.indications_and_usage?.[0] && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
            What it is used for
          </p>
          <p className="text-xs leading-relaxed text-gray-500">
            {label.indications_and_usage[0].slice(0, 400)}
            {label.indications_and_usage[0].length > 400 ? '…' : ''}
          </p>
        </div>
      )}
      <p className="text-xs text-gray-400">
        Source: FDA Drug Label Database · PubChem Compound ID: {pubchemId}
      </p>
    </div>
  )
}
