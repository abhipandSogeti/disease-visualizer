import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { createElement } from 'react'
import { AppShell } from './AppShell'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    createElement(MemoryRouter, null, children),
  )

describe('AppShell', () => {
  it('renders the header with the app title', () => {
    render(createElement(AppShell, { children: null }), { wrapper })
    expect(screen.getByText(/disease visualizer/i)).toBeInTheDocument()
  })
  it('renders persona toggle buttons', () => {
    render(createElement(AppShell, { children: null }), { wrapper })
    expect(screen.getByRole('button', { name: /analyst/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /epidemiologist/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clinical/i })).toBeInTheDocument()
  })
  it('switches persona on button click', async () => {
    const user = userEvent.setup()
    render(createElement(AppShell, { children: null }), { wrapper })
    const clinicalBtn = screen.getByRole('button', { name: /clinical/i })
    await user.click(clinicalBtn)
    expect(clinicalBtn).toHaveAttribute('aria-pressed', 'true')
  })
})
