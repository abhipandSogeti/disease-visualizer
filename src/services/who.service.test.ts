import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getDiseaseByCountry, getDiseaseTimeSeries } from './who.service'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

describe('getDiseaseByCountry', () => {
  it('returns parsed WHO records for a country', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          value: [
            {
              Id: 1,
              IndicatorCode: 'MALARIA_CASES',
              SpatialDim: 'NGA',
              TimeDim: 2022,
              NumericValue: 68400000,
              Low: null,
              High: null,
              Dim1Type: null,
              Dim1: null,
              Dim2Type: null,
              Dim2: null,
            },
          ],
        }),
    })

    const records = await getDiseaseByCountry('NGA', 'MALARIA_CASES')
    expect(records).toHaveLength(1)
    expect(records[0].SpatialDim).toBe('NGA')
    expect(records[0].NumericValue).toBe(68400000)
  })

  it('throws when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
    await expect(getDiseaseByCountry('NGA', 'MALARIA_CASES')).rejects.toThrow('WHO API error: 500')
  })
})

describe('getDiseaseTimeSeries', () => {
  it('returns records sorted by TimeDim ascending', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          value: [
            {
              Id: 2,
              IndicatorCode: 'MALARIA_CASES',
              SpatialDim: 'NGA',
              TimeDim: 2020,
              NumericValue: 60000000,
              Low: null,
              High: null,
              Dim1Type: null,
              Dim1: null,
              Dim2Type: null,
              Dim2: null,
            },
            {
              Id: 1,
              IndicatorCode: 'MALARIA_CASES',
              SpatialDim: 'NGA',
              TimeDim: 2019,
              NumericValue: 55000000,
              Low: null,
              High: null,
              Dim1Type: null,
              Dim1: null,
              Dim2Type: null,
              Dim2: null,
            },
          ],
        }),
    })

    const records = await getDiseaseTimeSeries('NGA', 'MALARIA_CASES')
    expect(records[0].TimeDim).toBe(2019)
    expect(records[1].TimeDim).toBe(2020)
  })
})
