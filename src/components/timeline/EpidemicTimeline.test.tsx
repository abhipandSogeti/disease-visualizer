import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EpidemicTimeline } from './EpidemicTimeline'
import type { LandmarkEvent } from '@/lib/disease-catalogue'

const events: LandmarkEvent[] = [
  {
    year: 2000,
    title: 'Roll Back Malaria',
    type: 'intervention',
    description: 'A global partnership to halve malaria by 2010.',
  },
  {
    year: 2021,
    title: 'First vaccine approved',
    type: 'milestone',
    description: 'RTS,S became the first approved malaria vaccine.',
  },
]

describe('EpidemicTimeline', () => {
  it('renders all event titles', () => {
    render(<EpidemicTimeline events={events} diseaseName="Malaria" />)
    expect(screen.getByText('Roll Back Malaria')).toBeInTheDocument()
    expect(screen.getByText('First vaccine approved')).toBeInTheDocument()
  })
  it('renders the disease name in the heading', () => {
    render(<EpidemicTimeline events={events} diseaseName="Malaria" />)
    expect(screen.getByText(/malaria.*historical timeline/i)).toBeInTheDocument()
  })
  it('renders empty state when no events', () => {
    render(<EpidemicTimeline events={[]} diseaseName="Malaria" />)
    expect(screen.getByText(/no historical events/i)).toBeInTheDocument()
  })
})
