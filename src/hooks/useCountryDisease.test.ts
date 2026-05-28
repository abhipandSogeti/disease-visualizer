import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useCountryDisease } from './useCountryDisease'
import * as whoService from '@/services/who.service'

vi.mock('@/services/who.service')

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    children,
  )

describe('useCountryDisease', () => {
  it('returns data when service resolves', async () => {
    vi.mocked(whoService.getDiseaseByCountry).mockResolvedValue([
      {
        Id: 1,
        IndicatorCode: 'MALARIA_CASES',
        SpatialDim: 'NGA',
        TimeDim: 2022,
        NumericValue: 68400000,
        Low: null,
        High: null,
      },
    ])
    const { result } = renderHook(() => useCountryDisease('NGA', 'MALARIA_CASES'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.[0].NumericValue).toBe(68400000)
  })
  it('is disabled when iso3 is empty', () => {
    const { result } = renderHook(() => useCountryDisease('', 'MALARIA_CASES'), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })
})
