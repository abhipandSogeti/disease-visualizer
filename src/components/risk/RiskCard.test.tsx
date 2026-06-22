import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RiskCard } from './RiskCard'
import type { RiskResult } from '@/hooks/useRiskAssessment'
import { getCareLadder } from '@/lib/care-ladder'

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
