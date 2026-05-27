import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EpidemicCurveChart } from './EpidemicCurveChart'

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const mockData = [
  { year: 2018, value: 55000000 },
  { year: 2019, value: 60000000 },
  { year: 2020, value: 58000000 },
  { year: 2021, value: 63000000 },
  { year: 2022, value: 68400000 },
]

describe('EpidemicCurveChart', () => {
  it('renders the chart container', () => {
    render(<EpidemicCurveChart data={mockData} diseaseName="Malaria" colour="#22c55e" />)
    expect(screen.getByRole('img', { name: /malaria cases over time/i })).toBeInTheDocument()
  })
  it('renders no data state when data is empty', () => {
    render(<EpidemicCurveChart data={[]} diseaseName="Malaria" colour="#22c55e" />)
    expect(screen.getByText(/no historical data/i)).toBeInTheDocument()
  })
})
