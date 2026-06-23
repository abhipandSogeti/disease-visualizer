import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrendBadge } from './TrendBadge'
import type { TrendSummary } from '@/types/risk.types'

const risingSummary: TrendSummary = {
  direction: 'rising',
  peakDate: '2026-06-30',
  peakLevel: 'high',
  todayScore: 0.3,
  peakScore: 0.8,
}

const fallingSummary: TrendSummary = {
  direction: 'falling',
  peakDate: '2026-06-22',
  peakLevel: 'moderate',
  todayScore: 0.6,
  peakScore: 0.6,
}

const stableSummary: TrendSummary = {
  direction: 'stable',
  peakDate: '2026-06-28',
  peakLevel: 'moderate',
  todayScore: 0.4,
  peakScore: 0.45,
}

describe('TrendBadge', () => {
  it('shows rising arrow and peak date', () => {
    render(<TrendBadge summary={risingSummary} />)
    expect(screen.getByText(/rising/i)).toBeInTheDocument()
    expect(screen.getByText(/jun 30/i)).toBeInTheDocument()
  })

  it('shows falling arrow', () => {
    render(<TrendBadge summary={fallingSummary} />)
    expect(screen.getByText(/falling/i)).toBeInTheDocument()
  })

  it('shows stable text', () => {
    render(<TrendBadge summary={stableSummary} />)
    expect(screen.getByText(/stable/i)).toBeInTheDocument()
  })

  it('uses amber colour class for rising', () => {
    const { container } = render(<TrendBadge summary={risingSummary} />)
    expect(container.querySelector('.text-amber-600')).toBeTruthy()
  })

  it('uses green colour class for falling', () => {
    const { container } = render(<TrendBadge summary={fallingSummary} />)
    expect(container.querySelector('.text-green-600')).toBeTruthy()
  })
})
