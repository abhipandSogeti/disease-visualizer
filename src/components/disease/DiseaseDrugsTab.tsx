import { useNavigate } from 'react-router-dom'
import { Pill, ChevronRight } from 'lucide-react'
import type { Disease } from '@/types/app.types'

const DISEASE_DRUGS: Record<string, { name: string; role: string; pubchemId: number }[]> = {
  malaria: [
    { name: 'Artemisinin', role: 'First-line treatment (ACT component)', pubchemId: 68827 },
    { name: 'Chloroquine', role: 'Historical first-line (now largely resistant)', pubchemId: 2719 },
    { name: 'Quinine', role: 'Severe malaria — IV treatment', pubchemId: 3034034 },
  ],
  tuberculosis: [
    { name: 'Isoniazid', role: 'First-line TB drug', pubchemId: 3767 },
    { name: 'Rifampicin', role: 'First-line TB drug', pubchemId: 5360416 },
    { name: 'Pyrazinamide', role: 'First-line TB drug', pubchemId: 1046 },
  ],
  hiv: [
    { name: 'Tenofovir', role: 'Antiretroviral — first-line', pubchemId: 464205 },
    { name: 'Efavirenz', role: 'Antiretroviral — first-line', pubchemId: 64139 },
    { name: 'Dolutegravir', role: 'Antiretroviral — preferred', pubchemId: 54726191 },
  ],
  covid19: [
    { name: 'Dexamethasone', role: 'Reduces mortality in severe cases', pubchemId: 5743 },
    { name: 'Remdesivir', role: 'Antiviral — hospitalised patients', pubchemId: 121304016 },
    { name: 'Nirmatrelvir', role: 'Oral antiviral — early treatment', pubchemId: 145996610 },
  ],
}

interface DiseaseDrugsTabProps {
  disease: Disease
}

export function DiseaseDrugsTab({ disease }: DiseaseDrugsTabProps) {
  const navigate = useNavigate()
  const drugs = DISEASE_DRUGS[disease.id] ?? []
  if (drugs.length === 0) {
    return (
      <p className="text-xs text-slate-500">
        No curated drug data available for {disease.name} yet.
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs leading-relaxed text-slate-400">
        The drugs below are used to treat {disease.name}. Click any drug to open the full molecular
        visualizer with 3D structure, mechanism of action, and drug interaction warnings.
      </p>
      <ul className="flex flex-col gap-2" role="list">
        {drugs.map((drug) => (
          <li key={drug.name}>
            <button
              onClick={() => navigate(`/drug/${drug.pubchemId}`)}
              className="flex w-full items-center justify-between rounded border border-slate-800 bg-slate-900/60 p-3 text-left hover:border-blue-700 hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label={`Open ${drug.name} drug visualizer`}
            >
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 flex-shrink-0 text-blue-400" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-slate-200">{drug.name}</p>
                  <p className="text-xs text-slate-500">{drug.role}</p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
