import { Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Pill } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { MoleculeViewer3D } from '@/components/drug/MoleculeViewer3D'
import { MoleculeViewer2D } from '@/components/drug/MoleculeViewer2D'
import { DrugIntelligencePanel } from '@/components/drug/DrugIntelligencePanel'
import { useDrugMolecule } from '@/hooks/useDrugMolecule'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'

const PUBCHEM_ID_TO_NAME: Record<string, string> = {
  '68827': 'Artemisinin',
  '2719': 'Chloroquine',
  '3034034': 'Quinine',
  '3767': 'Isoniazid',
  '5360416': 'Rifampicin',
  '1046': 'Pyrazinamide',
  '464205': 'Tenofovir',
  '64139': 'Efavirenz',
  '54726191': 'Dolutegravir',
  '5743': 'Dexamethasone',
  '121304016': 'Remdesivir',
  '145996610': 'Nirmatrelvir',
}

function DrugPageContent() {
  const { pubchemId } = useParams<{ pubchemId: string }>()
  const drugName = PUBCHEM_ID_TO_NAME[pubchemId ?? ''] ?? `Drug ${pubchemId ?? ''}`
  const { data: molecule } = useDrugMolecule(drugName)

  if (!pubchemId) {
    return (
      <EmptyState
        message="No drug selected."
        suggestion="Navigate to a drug from the Disease Panel."
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-3">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to globe
        </Link>
        <span className="text-slate-700" aria-hidden="true">
          /
        </span>
        <div className="flex items-center gap-2">
          <Pill className="h-4 w-4 text-blue-400" aria-hidden="true" />
          <h1 className="text-sm font-semibold text-slate-100">{drugName}</h1>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-72 flex-col gap-4 overflow-y-auto border-r border-slate-800 bg-slate-900 p-4">
          <Suspense fallback={<LoadingSkeleton label="Loading 3D molecule..." rows={3} />}>
            <MoleculeViewer3D cid={molecule?.cid ?? null} drugName={drugName} />
          </Suspense>
          <MoleculeViewer2D cid={molecule?.cid ?? null} drugName={drugName} />
        </aside>
        <main className="flex-1 overflow-hidden">
          <DrugIntelligencePanel drugName={drugName} pubchemId={Number(pubchemId)} />
        </main>
      </div>
    </div>
  )
}

export default function DrugPage() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingSkeleton label="Loading drug visualizer..." rows={5} />}>
        <DrugPageContent />
      </Suspense>
    </AppShell>
  )
}
