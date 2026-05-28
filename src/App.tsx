import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Globe } from '@/components/globe/Globe'
import { ChoroplethMap } from '@/components/map/ChoroplethMap'
import { DiseasePanel } from '@/components/disease/DiseasePanel'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useAppStore } from '@/stores/app.store'

const DrugPage = lazy(() => import('@/pages/DrugPage'))

function GlobePage() {
  const { selectedCountry, activeDiseases, view } = useAppStore()
  const primaryDisease = activeDiseases[0] ?? null

  return (
    <AppShell
      rightPanel={
        selectedCountry && primaryDisease ? (
          <DiseasePanel iso3={selectedCountry} disease={primaryDisease} />
        ) : undefined
      }
    >
      {view === 'globe' ? <Globe /> : <ChoroplethMap />}
    </AppShell>
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
