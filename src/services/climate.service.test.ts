import { describe, it, expect, vi, beforeEach } from 'vitest'
import { geocodePlace, getClimateWindow } from './climate.service'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)
beforeEach(() => mockFetch.mockReset())

describe('geocodePlace', () => {
  it('returns the first geocoding match', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              name: 'Dhaka',
              country: 'Bangladesh',
              admin1: 'Dhaka',
              latitude: 23.7,
              longitude: 90.4,
            },
          ],
        }),
    })
    const place = await geocodePlace('Dhaka')
    expect(place).toEqual({
      name: 'Dhaka',
      country: 'Bangladesh',
      admin: 'Dhaka',
      lat: 23.7,
      lng: 90.4,
    })
  })

  it('returns null when there are no matches', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
    expect(await geocodePlace('zzzzz')).toBeNull()
  })
})

describe('getClimateWindow', () => {
  it('maps Open-Meteo current + daily arrays into a ClimateWindow', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          current: { temperature_2m: 28.4, relative_humidity_2m: 75, precipitation: 1.2 },
          daily: {
            time: ['2026-05-01', '2026-05-02'],
            temperature_2m_mean: [27.1, 28.0],
            relative_humidity_2m_mean: [70, 72],
            precipitation_sum: [12.0, 0.0],
          },
        }),
    })
    const w = await getClimateWindow(23.7, 90.4)
    expect(w.current.tempC).toBe(28.4)
    expect(w.history).toHaveLength(2)
    expect(w.history[0]).toEqual({
      date: '2026-05-01',
      tempC: 27.1,
      humidityPct: 70,
      rainMm: 12.0,
    })
  })

  it('throws on a non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 })
    await expect(getClimateWindow(0, 0)).rejects.toThrow('Open-Meteo error: 503')
  })
})
