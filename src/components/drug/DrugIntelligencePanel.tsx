import { useState } from 'react'
import { PlainEnglishBlock } from './PlainEnglishBlock'
import { DrugOverviewTab } from './DrugOverviewTab'
import { DrugMechanismTab } from './DrugMechanismTab'
import { DrugEfficacyTab } from './DrugEfficacyTab'
import { DrugInteractionsTab } from './DrugInteractionsTab'
import { AdverseEventsPanel } from './AdverseEventsPanel'
import { getDrugPlainEnglish } from '@/lib/drug-intelligence'

type Tab = 'overview' | 'mechanism' | 'efficacy' | 'interactions'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'mechanism', label: 'Mechanism' },
  { id: 'efficacy', label: 'Efficacy' },
  { id: 'interactions', label: 'Interactions' },
]

interface DrugIntelligencePanelProps {
  drugName: string
  pubchemId: number
}

export function DrugIntelligencePanel({ drugName, pubchemId }: DrugIntelligencePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const plainText = getDrugPlainEnglish(drugName)

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <PlainEnglishBlock drugName={drugName} text={plainText} />
      <div
        role="tablist"
        aria-label="Drug information sections"
        className="flex gap-1 border-b border-slate-800 pb-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`drug-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`drug-panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'rounded px-3 py-1 text-xs font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`drug-panel-${activeTab}`} aria-labelledby={`drug-tab-${activeTab}`}>
        {activeTab === 'overview' && <DrugOverviewTab drugName={drugName} pubchemId={pubchemId} />}
        {activeTab === 'mechanism' && <DrugMechanismTab drugName={drugName} />}
        {activeTab === 'efficacy' && <DrugEfficacyTab drugName={drugName} />}
        {activeTab === 'interactions' && (
          <div className="flex flex-col gap-6">
            <DrugInteractionsTab drugName={drugName} />
            <AdverseEventsPanel drugName={drugName} />
          </div>
        )}
      </div>
    </div>
  )
}
