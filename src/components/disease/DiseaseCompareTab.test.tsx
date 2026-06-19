import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { DiseaseCompareTab } from './DiseaseCompareTab'
import * as hooks from '@/hooks/useCountryDisease'

vi.mock('@/hooks/useCountryDisease')

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    children,
  )

const disease = {
  id: 'malaria',
  name: 'Malaria',
  category: 'parasitic' as const,
  whoIndicator: 'MALARIA_CASES',
  colour: 'disease-parasitic',
  description: '',
}

describe('DiseaseCompareTab', () => {
  it('shows prompt when no compare country is selected', () => {
    render(createElement(DiseaseCompareTab, { iso3Primary: 'NGA', iso3Compare: null, disease }), {
      wrapper,
    })
    expect(screen.getByText(/pick a country to compare against/i)).toBeInTheDocument()
  })
  it('renders two country columns when compare country is set', () => {
    vi.mocked(hooks.useCountryDisease).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof hooks.useCountryDisease>)
    vi.mocked(hooks.useCountryDiseaseTimeSeries).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof hooks.useCountryDiseaseTimeSeries>)
    render(createElement(DiseaseCompareTab, { iso3Primary: 'NGA', iso3Compare: 'IND', disease }), {
      wrapper,
    })
    expect(screen.getByText('NGA')).toBeInTheDocument()
    expect(screen.getByText('IND')).toBeInTheDocument()
  })
})
