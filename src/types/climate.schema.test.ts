import { describe, it, expect } from 'vitest'
import { ClimateWindowSchema } from './climate.schema'

describe('ClimateWindowSchema', () => {
  it('parses a valid climate window', () => {
    const raw = {
      current: { tempC: 28.1, humidityPct: 74, rainMm: 2.3 },
      history: [
        { date: '2026-05-01', tempC: 27.5, humidityPct: 70, rainMm: 12.0 },
        { date: '2026-05-02', tempC: 28.0, humidityPct: 72, rainMm: 0 },
      ],
      forecast: [{ date: '2026-05-03', tempC: 28.4, humidityPct: 73, rainMm: 1.0 }],
    }
    const parsed = ClimateWindowSchema.parse(raw)
    expect(parsed.history).toHaveLength(2)
    expect(parsed.current.tempC).toBe(28.1)
  })

  it('rejects a window missing current', () => {
    expect(() => ClimateWindowSchema.parse({ history: [] })).toThrow()
  })
})
