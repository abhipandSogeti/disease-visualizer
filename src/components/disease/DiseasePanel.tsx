import { useState } from 'react'
import { useAppStore } from '@/stores/app.store'
import { useCountryName } from '@/hooks/useCountryName'
import { RightPanel } from '@/components/layout/RightPanel'
import { DiseaseOverviewTab } from './DiseaseOverviewTab'
import { DiseaseHistoryTab } from './DiseaseHistoryTab'
import { DiseaseCompareTab } from './DiseaseCompareTab'
import { DiseaseDrugsTab } from './DiseaseDrugsTab'
import { DISEASE_COLOURS } from '@/lib/colour-scale'
import type { Disease } from '@/types/app.types'

type Tab = 'overview' | 'history' | 'compare' | 'drugs'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'history', label: 'History' },
  { id: 'compare', label: 'Compare' },
  { id: 'drugs', label: 'Drugs' },
]

interface DiseasePanelProps {
  iso3: string
  disease: Disease
}

export function DiseasePanel({ iso3, disease }: DiseasePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const { persona, compareCountry } = useAppStore()
  const countryName = useCountryName(iso3)

  return (
    <RightPanel
      title={disease.name}
      subtitle={`${countryName} · ${disease.description}`}
      accentColor={DISEASE_COLOURS[disease.category]}
    >
      <div
        role="tablist"
        aria-label="Disease information sections"
        className="-mt-2 mb-4 flex gap-1 border-b border-black/[0.1] pb-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'rounded px-3 py-1 text-xs font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-black/[0.05] hover:text-gray-800',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'overview' && (
          <DiseaseOverviewTab iso3={iso3} disease={disease} persona={persona} />
        )}
        {activeTab === 'history' && <DiseaseHistoryTab iso3={iso3} disease={disease} />}
        {activeTab === 'compare' && (
          <DiseaseCompareTab iso3Primary={iso3} iso3Compare={compareCountry} disease={disease} />
        )}
        {activeTab === 'drugs' && <DiseaseDrugsTab disease={disease} />}
      </div>
    </RightPanel>
  )
}
