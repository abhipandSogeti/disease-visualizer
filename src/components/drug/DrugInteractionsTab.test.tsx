import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { DrugInteractionsTab } from './DrugInteractionsTab'
import * as interactionHook from '@/hooks/useDrugInteractions'

vi.mock('@/hooks/useDrugInteractions')

describe('DrugInteractionsTab', () => {
  it('shows empty state when no interactions', () => {
    vi.mocked(interactionHook.useDrugInteractions).mockReturnValue({
      rxcui: '12345',
      interactions: [],
      isLoading: false,
      isError: false,
    })
    render(createElement(DrugInteractionsTab, { drugName: 'Artemisinin' }))
    expect(screen.getByText(/no significant drug interactions/i)).toBeInTheDocument()
  })
  it('renders interaction drug names', () => {
    vi.mocked(interactionHook.useDrugInteractions).mockReturnValue({
      rxcui: '12345',
      interactions: [
        {
          minConceptItem: { rxcui: '12345', name: 'Artemisinin', tty: 'IN' },
          interactionPair: [
            {
              interactionConcept: [
                {
                  minConceptItem: { name: 'Artemisinin', rxcui: '12345' },
                  sourceConceptItem: {
                    name: 'Artemisinin',
                    ddi_risk: 'high',
                    description: 'interaction',
                  },
                },
                {
                  minConceptItem: { name: 'Halofantrine', rxcui: '99999' },
                  sourceConceptItem: {
                    name: 'Halofantrine',
                    ddi_risk: 'high',
                    description: 'Risk of fatal heart rhythm disorder',
                  },
                },
              ],
              severity: 'high',
              description: 'Avoid combination — QT prolongation risk',
            },
          ],
        },
      ],
      isLoading: false,
      isError: false,
    })
    render(createElement(DrugInteractionsTab, { drugName: 'Artemisinin' }))
    expect(screen.getByText(/halofantrine/i)).toBeInTheDocument()
  })
})
