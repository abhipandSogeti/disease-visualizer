import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { ChoroplethMap } from './ChoroplethMap'

vi.mock('react-simple-maps', () => ({
  ComposableMap: ({ children }: { children: React.ReactNode }) =>
    createElement('div', { 'data-testid': 'composable-map' }, children),
  Geographies: ({
    children,
  }: {
    children: (args: { geographies: unknown[] }) => React.ReactNode
  }) => children({ geographies: [] }),
  Geography: () => createElement('div', null),
  ZoomableGroup: ({ children }: { children: React.ReactNode }) =>
    createElement('div', null, children),
}))

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    children,
  )

describe('ChoroplethMap', () => {
  it('renders the map container', () => {
    render(createElement(ChoroplethMap, null), { wrapper })
    expect(screen.getByTestId('composable-map')).toBeInTheDocument()
  })
  it('renders the map legend', () => {
    render(createElement(ChoroplethMap, null), { wrapper })
    expect(screen.getByLabelText(/map colour legend/i)).toBeInTheDocument()
  })
})
