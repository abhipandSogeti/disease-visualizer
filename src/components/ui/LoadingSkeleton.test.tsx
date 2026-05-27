import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSkeleton } from './LoadingSkeleton'
import { ErrorState } from './ErrorState'
import { EmptyState } from './EmptyState'

describe('LoadingSkeleton', () => {
  it('renders with accessible label', () => {
    render(<LoadingSkeleton label="Fetching WHO data" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/fetching who data/i)).toBeInTheDocument()
  })
})

describe('ErrorState', () => {
  it('renders error message and retry button', () => {
    render(<ErrorState message="Could not reach WHO servers" onRetry={() => undefined} />)
    expect(screen.getByText(/could not reach who servers/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })
})

describe('EmptyState', () => {
  it('renders empty message and suggestion', () => {
    render(<EmptyState message="No data for Iceland" suggestion="Try a tropical region" />)
    expect(screen.getByText(/no data for iceland/i)).toBeInTheDocument()
    expect(screen.getByText(/try a tropical region/i)).toBeInTheDocument()
  })
})
