import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Globe } from '@/components/globe/Globe'
import { ChoroplethMap } from '@/components/map/ChoroplethMap'
import { DiseasePanel } from '@/components/disease/DiseasePanel'
import { ClinicalPanel } from '@/components/disease/ClinicalPanel'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useAppStore } from '@/stores/app.store'

const DrugPage = lazy(() => import('@/pages/DrugPage'))

function GlobePage() {
  const { selectedCountry, activeDiseases, view, persona } = useAppStore()
  const primaryDisease = activeDiseases[0] ?? null

  let rightPanel: React.ReactNode = undefined
  if (selectedCountry && primaryDisease) {
    rightPanel = <DiseasePanel iso3={selectedCountry} disease={primaryDisease} />
  } else if (persona === 'clinical' && primaryDisease) {
    rightPanel = <ClinicalPanel />
  }

  return (
    <AppShell rightPanel={rightPanel}>{view === 'globe' ? <Globe /> : <ChoroplethMap />}</AppShell>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GlobePage />} />
      <Route
        path="/drug/:pubchemId"
        element={
          <Suspense fallback={<LoadingSkeleton label="Loading drug page..." rows={5} />}>
            <DrugPage />
          </Suspense>
        }
      />
    </Routes>
  )
}
