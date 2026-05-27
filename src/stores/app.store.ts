import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_DISEASES, type Disease, type Persona } from '@/types/app.types'

interface AppState {
  activeDiseases: Disease[]
  addDisease: (disease: Disease) => void
  removeDisease: (id: string) => void
  selectedYear: number
  setYear: (year: number) => void
  persona: Persona
  setPersona: (persona: Persona) => void
  selectedCountry: string | null
  setCountry: (iso3: string | null) => void
  compareCountry: string | null
  setCompareCountry: (iso3: string | null) => void
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeDiseases: DEFAULT_DISEASES,
      selectedYear: new Date().getFullYear(),
      persona: 'analyst',
      selectedCountry: null,
      compareCountry: null,
      theme: 'dark',
      addDisease: (disease) => {
        if (get().activeDiseases.some((d) => d.id === disease.id)) return
        set({ activeDiseases: [...get().activeDiseases, disease] })
      },
      removeDisease: (id) =>
        set({ activeDiseases: get().activeDiseases.filter((d) => d.id !== id) }),
      setYear: (year) => set({ selectedYear: year }),
      setPersona: (persona) => set({ persona }),
      setCountry: (iso3) => set({ selectedCountry: iso3 }),
      setCompareCountry: (iso3) => set({ compareCountry: iso3 }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'disease-visualizer-state',
      partialize: (state) => ({
        activeDiseases: state.activeDiseases,
        persona: state.persona,
        theme: state.theme,
      }),
    },
  ),
)
