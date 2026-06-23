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
  it('shows a cited data-vintage badge linking to the source', () => {
    render(
      <MetricCard
        label="Most Recent Cases"
        value={1000}
        context=""
        dataYear={2024}
        source={{ label: 'WHO World Malaria Report 2025', url: 'https://www.who.int/x' }}
      />,
    )
    const link = screen.getByRole('link', { name: /WHO World Malaria Report 2025/i })
    expect(link).toHaveAttribute('href', 'https://www.who.int/x')
    expect(link).toHaveTextContent('2024')
  })
  it('flags stale data with a warning marker', () => {
    render(
      <MetricCard
        label="Most Recent Cases"
        value={1000}
        context=""
        dataYear={2016}
        source={{ label: 'WHO GHO — Cholera', url: 'https://www.who.int/y' }}
      />,
    )
    expect(screen.getByRole('link', { name: /cholera/i })).toHaveTextContent(/⚠.*latest available/)
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
