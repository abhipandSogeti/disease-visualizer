import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { DrugOverviewTab } from './DrugOverviewTab'
import * as labelHook from '@/hooks/useDrugLabel'
import * as moleculeHook from '@/hooks/useDrugMolecule'

vi.mock('@/hooks/useDrugLabel')
vi.mock('@/hooks/useDrugMolecule')

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    children,
  )

describe('DrugOverviewTab', () => {
  it('renders drug name heading', () => {
    vi.mocked(labelHook.useDrugLabel).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof labelHook.useDrugLabel>)
    vi.mocked(moleculeHook.useDrugMolecule).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof moleculeHook.useDrugMolecule>)
    render(createElement(DrugOverviewTab, { drugName: 'Artemisinin', pubchemId: 68827 }), {
      wrapper,
    })
    expect(screen.getByText('Artemisinin')).toBeInTheDocument()
  })
  it('renders molecular formula when molecule data available', () => {
    vi.mocked(labelHook.useDrugLabel).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof labelHook.useDrugLabel>)
    vi.mocked(moleculeHook.useDrugMolecule).mockReturnValue({
      data: {
        cid: 68827,
        molecularFormula: 'C15H22O5',
        molecularWeight: '282.33',
        isomericSmiles: 'CC1CCC2CC(=O)OC3OC1(C)C23',
        iupacName: 'artemisinin',
        inchiKey: 'ABC123',
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof moleculeHook.useDrugMolecule>)
    render(createElement(DrugOverviewTab, { drugName: 'Artemisinin', pubchemId: 68827 }), {
      wrapper,
    })
    expect(screen.getByText('C15H22O5')).toBeInTheDocument()
  })
})
