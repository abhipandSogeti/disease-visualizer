import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useRiskAssessment } from './useRiskAssessment'
import type { ClimateWindow } from '@/types/climate.schema'

vi.mock('@/services/climate.service', () => ({
  getClimateWindow: vi.fn(),
}))
import { getClimateWindow } from '@/services/climate.service'

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    children,
  )

const fullHistory = Array.from({ length: 56 }, (_, i) => ({
  date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
  tempC: 29,
  humidityPct: 80,
  rainMm: 7,
}))
const climate: ClimateWindow = {
  current: { tempC: 29, humidityPct: 80, rainMm: 5 },
  history: fullHistory,
  forecast: [],
}

beforeEach(() => vi.mocked(getClimateWindow).mockReset())

describe('useRiskAssessment', () => {
  it('returns an assessment + ladder for each modelled disease', async () => {
    vi.mocked(getClimateWindow).mockResolvedValue(climate)
    const { result } = renderHook(() => useRiskAssessment(23.7, 90.4), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.results).toHaveLength(2)
    const dengue = result.current.results.find((r) => r.assessment.diseaseId === 'dengue')
    expect(dengue?.assessment.level).toBe('high')
    expect(dengue?.ladder?.avoid.join(' ').toLowerCase()).toMatch(/nsaid/)
  })

  it('does not fetch when coords are null', () => {
    const { result } = renderHook(() => useRiskAssessment(null, null), { wrapper })
    expect(getClimateWindow).not.toHaveBeenCalled()
    expect(result.current.results).toHaveLength(0)
  })
})
