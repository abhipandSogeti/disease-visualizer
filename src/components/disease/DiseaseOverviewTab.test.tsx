import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { DiseaseOverviewTab } from './DiseaseOverviewTab'
import * as hooks from '@/hooks/useCountryDisease'
import type { WHORecord } from '@/types/who.schema'

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.mock('@/hooks/useCountryDisease')
vi.mock('@/hooks/useWorldBank', () => ({
  usePopulation: () => ({ data: [] }),
  useHospitalBeds: () => ({ data: [] }),
}))

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    children,
  )

const makeRecord = (year: number, value: number): WHORecord => ({
  Id: year,
  IndicatorCode: 'MALARIA_CASES',
  SpatialDim: 'NGA',
  TimeDim: year,
  NumericValue: value,
  Low: null,
  High: null,
})

const disease = {
  id: 'malaria',
  name: 'Malaria',
  category: 'parasitic' as const,
  whoIndicator: 'MALARIA_CASES',
  colour: 'disease-parasitic',
  description: '',
}

describe('DiseaseOverviewTab', () => {
  it('renders metric cards when data is available', () => {
    vi.mocked(hooks.useCountryDiseaseTimeSeries).mockReturnValue({
      data: [makeRecord(2021, 60000000), makeRecord(2022, 68400000)],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof hooks.useCountryDiseaseTimeSeries>)
    render(createElement(DiseaseOverviewTab, { iso3: 'NGA', disease, persona: 'analyst' }), {
      wrapper,
    })
    expect(screen.getByText(/most recent cases/i)).toBeInTheDocument()
    expect(screen.getByText('68.4 Million')).toBeInTheDocument()
  })
  it('renders loading state', () => {
    vi.mocked(hooks.useCountryDiseaseTimeSeries).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof hooks.useCountryDiseaseTimeSeries>)
    render(createElement(DiseaseOverviewTab, { iso3: 'NGA', disease, persona: 'analyst' }), {
      wrapper,
    })
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
