import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { createElement } from 'react'
import { DrugIntelligencePanel } from './DrugIntelligencePanel'

vi.mock('@/hooks/useDrugLabel', () => ({
  useDrugLabel: () => ({ data: null, isLoading: false, isError: false }),
  useAdverseEvents: () => ({ data: [], isLoading: false }),
}))
vi.mock('@/hooks/useDrugMolecule', () => ({
  useDrugMolecule: () => ({ data: null, isLoading: false, isError: false }),
  useDrug2DImageUrl: () => null,
  useDrug3DUrl: () => null,
}))
vi.mock('@/hooks/useDrugInteractions', () => ({
  useDrugInteractions: () => ({ interactions: [], isLoading: false, isError: false }),
}))
vi.mock('@/hooks/useDrugTargets', () => ({
  useDrugTargets: () => ({ activities: [], isLoading: false, isError: false }),
}))

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    createElement(MemoryRouter, null, children),
  )

describe('DrugIntelligencePanel', () => {
  it('renders four tab buttons', () => {
    render(createElement(DrugIntelligencePanel, { drugName: 'Artemisinin', pubchemId: 68827 }), {
      wrapper,
    })
    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /mechanism/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /efficacy/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /interactions/i })).toBeInTheDocument()
  })
  it('shows plain english block before tabs', () => {
    render(createElement(DrugIntelligencePanel, { drugName: 'Artemisinin', pubchemId: 68827 }), {
      wrapper,
    })
    expect(screen.getByText(/what is artemisinin/i)).toBeInTheDocument()
  })
  it('switches tabs on click', async () => {
    const user = userEvent.setup()
    render(createElement(DrugIntelligencePanel, { drugName: 'Artemisinin', pubchemId: 68827 }), {
      wrapper,
    })
    await user.click(screen.getByRole('tab', { name: /mechanism/i }))
    expect(screen.getByRole('tab', { name: /mechanism/i })).toHaveAttribute('aria-selected', 'true')
  })
})
