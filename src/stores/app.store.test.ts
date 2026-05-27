import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './app.store'
import { DEFAULT_DISEASES } from '@/types/app.types'

beforeEach(() => {
  useAppStore.setState({
    activeDiseases: DEFAULT_DISEASES,
    selectedYear: new Date().getFullYear(),
    persona: 'analyst',
    selectedCountry: null,
    compareCountry: null,
    theme: 'dark',
  })
})

describe('useAppStore', () => {
  it('initialises with default diseases', () => {
    const { activeDiseases } = useAppStore.getState()
    expect(activeDiseases.length).toBeGreaterThan(0)
    expect(activeDiseases.some((d) => d.id === 'malaria')).toBe(true)
  })
  it('removes a disease by id', () => {
    useAppStore.getState().removeDisease('malaria')
    expect(useAppStore.getState().activeDiseases.some((d) => d.id === 'malaria')).toBe(false)
  })
  it('adds a disease without duplicates', () => {
    const malaria = DEFAULT_DISEASES.find((d) => d.id === 'malaria')!
    useAppStore.getState().addDisease(malaria)
    useAppStore.getState().addDisease(malaria)
    expect(useAppStore.getState().activeDiseases.filter((d) => d.id === 'malaria')).toHaveLength(1)
  })
  it('sets selected country', () => {
    useAppStore.getState().setCountry('NGA')
    expect(useAppStore.getState().selectedCountry).toBe('NGA')
  })
  it('sets persona', () => {
    useAppStore.getState().setPersona('clinical')
    expect(useAppStore.getState().persona).toBe('clinical')
  })
  it('sets year', () => {
    useAppStore.getState().setYear(2000)
    expect(useAppStore.getState().selectedYear).toBe(2000)
  })
})
