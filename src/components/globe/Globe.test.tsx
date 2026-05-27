import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { Globe } from './Globe'

vi.mock('react-globe.gl', () => ({
  default: ({ onPointClick }: { onPointClick?: () => void }) =>
    createElement('div', { 'data-testid': 'globe-mock', onClick: onPointClick }, 'Globe'),
}))

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    children,
  )

describe('Globe', () => {
  it('renders the globe canvas', () => {
    render(createElement(Globe, null), { wrapper })
    expect(screen.getByTestId('globe-mock')).toBeInTheDocument()
  })
  it('renders the globe legend', () => {
    render(createElement(Globe, null), { wrapper })
    expect(screen.getByRole('generic', { name: /map colour legend/i })).toBeInTheDocument()
  })
})
