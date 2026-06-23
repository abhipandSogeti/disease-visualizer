import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RiskCard } from './RiskCard'
import type { RiskResult } from '@/hooks/useRiskAssessment'
import { getCareLadder } from '@/lib/care-ladder'
import type { DayRisk } from '@/types/risk.types'

const timeline: DayRisk[] = Array.from({ length: 14 }, (_, i) => ({
  date: `2026-06-${String(i + 1).padStart(2, '0')}`,
  score: 0.5 + i * 0.02,
  level: 'moderate' as const,
}))

const result: RiskResult = {
  assessment: {
    diseaseId: 'dengue',
    level: 'high',
    score: 0.8,
    drivers: [{ factor: 'temperature', value: 29, contribution: 1, note: '29°C — favourable' }],
    confidence: 'moderate',
    dataGaps: [],
  },
  ladder: getCareLadder('dengue'),
  timeline,
  trend: {
    direction: 'rising',
    peakDate: '2026-06-14',
    peakLevel: 'high',
    todayScore: 0.5,
    peakScore: 0.76,
  },
}

describe('RiskCard', () => {
  it('shows disease, level, and driver reasoning', () => {
    render(<RiskCard result={result} />)
    expect(screen.getByText('Dengue')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.getByText(/29°C — favourable/)).toBeInTheDocument()
  })

  it('reveals the care ladder on expand, including the NSAID warning', async () => {
    const user = userEvent.setup()
    render(<RiskCard result={result} />)
    await user.click(screen.getByRole('button', { name: /what to do/i }))
    expect(screen.getByText(/NSAIDs and aspirin/i)).toBeInTheDocument()
  })
})
