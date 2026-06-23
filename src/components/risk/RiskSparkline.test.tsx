import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RiskSparkline } from './RiskSparkline'
import type { DayRisk } from '@/types/risk.types'

const timeline: DayRisk[] = Array.from({ length: 14 }, (_, i) => ({
  date: `2026-06-${String(i + 1).padStart(2, '0')}`,
  score: 0.3 + i * 0.03,
  level: i < 5 ? 'low' : i < 10 ? 'moderate' : 'high',
}))

describe('RiskSparkline', () => {
  it('renders without crashing', () => {
    const { container } = render(<RiskSparkline timeline={timeline} disease="dengue" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('has an accessible aria-label mentioning the disease', () => {
    render(<RiskSparkline timeline={timeline} disease="dengue" />)
    expect(screen.getByRole('img', { name: /dengue/i })).toBeInTheDocument()
  })

  it('renders a cholera variant without crashing', () => {
    const { container } = render(<RiskSparkline timeline={timeline} disease="cholera" />)
    expect(container.firstChild).toBeTruthy()
  })
})
