import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { createElement, type ReactNode } from 'react'
import PlacePage from './PlacePage'
import type { ClimateWindow, DailyWeather } from '@/types/climate.schema'

vi.mock('@/services/climate.service', () => ({
  geocodePlace: vi.fn(),
  getClimateWindow: vi.fn(),
}))
import { geocodePlace, getClimateWindow } from '@/services/climate.service'

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    createElement(MemoryRouter, null, children),
  )

const forecast14: DailyWeather[] = Array.from({ length: 14 }, (_, i) => ({
  date: `2026-02-${String(i + 1).padStart(2, '0')}`,
  tempC: 29,
  humidityPct: 78,
  rainMm: 5,
}))

const climate: ClimateWindow = {
  current: { tempC: 29, humidityPct: 80, rainMm: 5 },
  history: Array.from({ length: 56 }, (_, i) => ({
    date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
    tempC: 29,
    humidityPct: 80,
    rainMm: 7,
  })),
  forecast: forecast14,
}

beforeEach(() => {
  vi.mocked(geocodePlace).mockReset()
  vi.mocked(getClimateWindow).mockReset()
})

describe('PlacePage', () => {
  it('shows risk cards after a successful search', async () => {
    vi.mocked(geocodePlace).mockResolvedValue({
      name: 'Dhaka',
      country: 'Bangladesh',
      admin: 'Dhaka',
      lat: 23.7,
      lng: 90.4,
    })
    vi.mocked(getClimateWindow).mockResolvedValue(climate)
    render(<PlacePage />, { wrapper })
    await userEvent.type(screen.getByLabelText(/search a city/i), 'Dhaka')
    await userEvent.click(screen.getByRole('button', { name: /check/i }))
    await waitFor(() => expect(screen.getByText('Dengue')).toBeInTheDocument())
    expect(screen.getByText(/Bangladesh/)).toBeInTheDocument()
  })

  it('shows a not-found message when geocoding returns nothing', async () => {
    vi.mocked(geocodePlace).mockResolvedValue(null)
    render(<PlacePage />, { wrapper })
    await userEvent.type(screen.getByLabelText(/search a city/i), 'zzzz')
    await userEvent.click(screen.getByRole('button', { name: /check/i }))
    await waitFor(() => expect(screen.getByText(/place not found/i)).toBeInTheDocument())
  })
})
