import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { createElement } from 'react'
import { DiseasePanel } from './DiseasePanel'

vi.mock('@/hooks/useCountryDisease', () => ({
  useCountryDisease: () => ({ data: [], isLoading: false, isError: false }),
  useCountryDiseaseTimeSeries: () => ({ data: [], isLoading: false, isError: false }),
  useGlobalDisease: () => ({ data: [], isLoading: false, isError: false }),
}))
vi.mock('@/hooks/useWorldBank', () => ({
  usePopulation: () => ({ data: [] }),
  useHospitalBeds: () => ({ data: [] }),
}))

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    createElement(MemoryRouter, null, children),
  )

const disease = {
  id: 'malaria',
  name: 'Malaria',
  category: 'parasitic' as const,
  whoIndicator: 'MALARIA_CASES',
  colour: 'disease-parasitic',
  description: '',
}

describe('DiseasePanel', () => {
  it('renders the four tab buttons', () => {
    render(createElement(DiseasePanel, { iso3: 'NGA', disease }), { wrapper })
    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /history/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /compare/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /drugs/i })).toBeInTheDocument()
  })
  it('switches to history tab on click', async () => {
    const user = userEvent.setup()
    render(createElement(DiseasePanel, { iso3: 'NGA', disease }), { wrapper })
    await user.click(screen.getByRole('tab', { name: /history/i }))
    expect(screen.getByRole('tab', { name: /history/i })).toHaveAttribute('aria-selected', 'true')
  })
})
