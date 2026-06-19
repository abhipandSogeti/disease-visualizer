import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricCard } from './MetricCard'
import { TrendBadge } from './TrendBadge'

describe('MetricCard', () => {
  it('renders the label and formatted value', () => {
    render(
      <MetricCard label="Total Cases" value={68400000} context="Highest burden country globally" />,
    )
    expect(screen.getByText('Total Cases')).toBeInTheDocument()
    expect(screen.getByText('68.4 Million')).toBeInTheDocument()
    expect(screen.getByText('Highest burden country globally')).toBeInTheDocument()
  })
  it('renders no data state gracefully', () => {
    render(<MetricCard label="Deaths" value={null} context="" />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })
})

describe('TrendBadge', () => {
  it('shows increasing trend with correct label', () => {
    render(<TrendBadge previous={100} current={112} />)
    expect(screen.getByText(/\+12\.0% from last year/i)).toBeInTheDocument()
  })
  it('shows decreasing trend with correct label', () => {
    render(<TrendBadge previous={100} current={92} />)
    expect(screen.getByText(/-8\.0% from last year/i)).toBeInTheDocument()
  })
  it('shows stable trend', () => {
    render(<TrendBadge previous={100} current={100.5} />)
    expect(screen.getByText(/stable/i)).toBeInTheDocument()
  })
})
