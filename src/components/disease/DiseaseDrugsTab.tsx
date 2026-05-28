import { useNavigate } from 'react-router-dom'
import { Pill, ChevronRight, FlaskConical, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react'
import type { Disease } from '@/types/app.types'
import { useDrugTargets } from '@/hooks/useDrugTargets'

interface DrugEntry {
  name: string
  role: string
  pubchemId: number
  status: 'first-line' | 'second-line' | 'supportive' | 'experimental' | 'vaccine'
}

const DISEASE_DRUGS: Record<string, DrugEntry[]> = {
  malaria: [
    {
      name: 'Artemisinin',
      role: 'First-line treatment (ACT component)',
      pubchemId: 68827,
      status: 'first-line',
    },
    {
      name: 'Chloroquine',
      role: 'Historical first-line — now largely resistant',
      pubchemId: 2719,
      status: 'second-line',
    },
    {
      name: 'Quinine',
      role: 'Severe malaria — IV treatment',
      pubchemId: 3034034,
      status: 'second-line',
    },
  ],
  tuberculosis: [
    {
      name: 'Isoniazid',
      role: 'First-line TB drug — 6 month course',
      pubchemId: 3767,
      status: 'first-line',
    },
    {
      name: 'Rifampicin',
      role: 'First-line TB drug — bactericidal',
      pubchemId: 5360416,
      status: 'first-line',
    },
    {
      name: 'Pyrazinamide',
      role: 'First-line TB drug — sterilising activity',
      pubchemId: 1046,
      status: 'first-line',
    },
  ],
  hiv: [
    {
      name: 'Tenofovir',
      role: 'Antiretroviral — nucleotide reverse transcriptase inhibitor',
      pubchemId: 464205,
      status: 'first-line',
    },
    {
      name: 'Dolutegravir',
      role: 'Antiretroviral — integrase strand transfer inhibitor',
      pubchemId: 54726191,
      status: 'first-line',
    },
    {
      name: 'Efavirenz',
      role: 'Antiretroviral — non-nucleoside reverse transcriptase inhibitor',
      pubchemId: 64139,
      status: 'second-line',
    },
  ],
  cholera: [
    {
      name: 'Doxycycline',
      role: 'First-line antibiotic — shortens duration by 50%',
      pubchemId: 54671203,
      status: 'first-line',
    },
    {
      name: 'Azithromycin',
      role: 'Alternative antibiotic — preferred in pregnancy and children',
      pubchemId: 447043,
      status: 'second-line',
    },
    {
      name: 'Ciprofloxacin',
      role: 'Alternative antibiotic — single-dose regimen',
      pubchemId: 2764,
      status: 'second-line',
    },
  ],
  polio: [
    {
      name: 'Acetaminophen',
      role: 'Symptomatic relief — fever and pain management',
      pubchemId: 1983,
      status: 'supportive',
    },
  ],
  dengue: [
    {
      name: 'Acetaminophen',
      role: 'First-line symptom management — reduces fever and pain',
      pubchemId: 1983,
      status: 'supportive',
    },
    {
      name: 'Oseltamivir',
      role: 'Studied experimentally in dengue — not yet standard of care',
      pubchemId: 65028,
      status: 'experimental',
    },
  ],
  covid19: [
    {
      name: 'Dexamethasone',
      role: 'Reduces mortality in severe hospitalised cases',
      pubchemId: 5743,
      status: 'first-line',
    },
    {
      name: 'Remdesivir',
      role: 'Antiviral — hospitalised patients within 7 days of symptom onset',
      pubchemId: 121304016,
      status: 'first-line',
    },
    {
      name: 'Nirmatrelvir',
      role: 'Oral antiviral (Paxlovid) — early treatment within 5 days',
      pubchemId: 145996610,
      status: 'first-line',
    },
  ],
  ebola: [
    {
      name: 'Remdesivir',
      role: 'Studied in Ebola trials — broad-spectrum antiviral',
      pubchemId: 121304016,
      status: 'experimental',
    },
  ],
}

const STATUS_CONFIG: Record<
  DrugEntry['status'],
  { label: string; className: string; icon: React.ReactNode }
> = {
  'first-line': {
    label: 'First-line',
    className: 'bg-green-900/40 text-green-400 border-green-800',
    icon: <ShieldCheck className="h-3 w-3" aria-hidden="true" />,
  },
  'second-line': {
    label: 'Second-line',
    className: 'bg-blue-900/40 text-blue-400 border-blue-800',
    icon: <Pill className="h-3 w-3" aria-hidden="true" />,
  },
  supportive: {
    label: 'Supportive',
    className: 'bg-slate-800/60 text-slate-400 border-slate-700',
    icon: <Pill className="h-3 w-3" aria-hidden="true" />,
  },
  experimental: {
    label: 'Experimental',
    className: 'bg-amber-900/30 text-amber-400 border-amber-800',
    icon: <FlaskConical className="h-3 w-3" aria-hidden="true" />,
  },
  vaccine: {
    label: 'Vaccine',
    className: 'bg-purple-900/40 text-purple-400 border-purple-800',
    icon: <ShieldCheck className="h-3 w-3" aria-hidden="true" />,
  },
}

const NO_CURE_DISEASES: Record<string, string> = {
  polio:
    'There is no cure for polio once infected — treatment is purely supportive (pain relief, physical therapy). Prevention is via the IPV or OPV vaccine.',
  dengue:
    'No specific antiviral treatment is approved for dengue. Management is supportive: fluids and fever control. Avoid NSAIDs like ibuprofen — they increase bleeding risk.',
  ebola:
    'Ebola treatment is primarily supportive. Two monoclonal antibody therapies (INMAZEB, Ebanga) were approved in 2020 but have no PubChem small-molecule records as they are biological therapies.',
}

// ChEMBL live drug search as a supplement when curated data is limited
function LiveDrugSearch({ diseaseName }: { diseaseName: string }) {
  const { molecule, isLoading } = useDrugTargets(diseaseName)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        Searching ChEMBL for {diseaseName} treatments…
      </div>
    )
  }
  if (!molecule) return null

  return (
    <div className="rounded border border-slate-700/50 bg-slate-900/40 p-2.5">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Live — ChEMBL
      </p>
      <p className="text-xs font-semibold text-slate-300">
        {molecule.pref_name ?? molecule.molecule_chembl_id}
      </p>
      <p className="mt-0.5 text-[10px] text-slate-500">
        Phase {molecule.max_phase ?? '?'} · {molecule.molecule_type ?? 'Unknown type'}
      </p>
    </div>
  )
}

interface DiseaseDrugsTabProps {
  disease: Disease
}

export function DiseaseDrugsTab({ disease }: DiseaseDrugsTabProps) {
  const navigate = useNavigate()
  const drugs = DISEASE_DRUGS[disease.id] ?? []
  const noCureNote = NO_CURE_DISEASES[disease.id]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs leading-relaxed text-slate-400">
        Treatment options for <span className="font-medium text-slate-300">{disease.name}</span>.
        Click any drug card to open the full molecular visualiser — 3D structure, mechanism of
        action, and drug interaction data.
      </p>

      {noCureNote && (
        <div className="flex gap-2 rounded border border-amber-800/50 bg-amber-900/20 p-2.5">
          <AlertTriangle
            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-400"
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed text-amber-300/80">{noCureNote}</p>
        </div>
      )}

      {drugs.length > 0 && (
        <ul className="flex flex-col gap-2" role="list">
          {drugs.map((drug) => {
            const statusCfg = STATUS_CONFIG[drug.status]
            return (
              <li key={drug.name}>
                <button
                  onClick={() => navigate(`/drug/${drug.pubchemId}`)}
                  className="group flex w-full items-center justify-between rounded border border-slate-800 bg-slate-900/60 p-3 text-left transition-colors hover:border-violet-700 hover:bg-slate-800 focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-500"
                  aria-label={`Open ${drug.name} drug visualiser`}
                >
                  <div className="flex items-center gap-3">
                    <Pill
                      className="h-4 w-4 flex-shrink-0 text-blue-400 group-hover:text-blue-300"
                      aria-hidden="true"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-white">
                          {drug.name}
                        </p>
                        <span
                          className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium ${statusCfg.className}`}
                        >
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{drug.role}</p>
                    </div>
                  </div>
                  <ChevronRight
                    className="h-3.5 w-3.5 flex-shrink-0 text-slate-600 group-hover:text-slate-400"
                    aria-hidden="true"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {drugs.length === 0 && !noCureNote && <LiveDrugSearch diseaseName={disease.name} />}
    </div>
  )
}
