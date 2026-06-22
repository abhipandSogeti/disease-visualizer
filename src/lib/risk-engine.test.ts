import { describe, it, expect } from 'vitest'
import { assessRisk } from './risk-engine'
import type { ClimateWindow, DailyWeather } from '@/types/climate.schema'

function makeHistory(
  days: number,
  tempC: number,
  rainMm: number,
  humidityPct: number,
): DailyWeather[] {
  return Array.from({ length: days }, (_, i) => ({
    date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
    tempC,
    humidityPct,
    rainMm,
  }))
}

function window(current: ClimateWindow['current'], history: DailyWeather[]): ClimateWindow {
  return { current, history }
}

describe('assessRisk — dengue', () => {
  it('returns HIGH for optimal temp, heavy lagged rain, high humidity', () => {
    // 56 days, ~7mm/day → window 2-6 weeks cumulative well over 150mm
    const w = window({ tempC: 29, humidityPct: 80, rainMm: 5 }, makeHistory(56, 29, 7, 80))
    const r = assessRisk(w, 'dengue')
    expect(r.level).toBe('high')
    expect(r.drivers.some((d) => d.factor === 'temperature')).toBe(true)
    expect(r.confidence).toBe('moderate')
  })

  it('returns LOW when temperature is unsuitable regardless of rain', () => {
    const w = window({ tempC: 10, humidityPct: 90, rainMm: 20 }, makeHistory(56, 10, 30, 90))
    const r = assessRisk(w, 'dengue')
    expect(r.level).toBe('low')
    expect(r.score).toBe(0)
  })

  it('downgrades confidence to low with sparse history', () => {
    const w = window({ tempC: 29, humidityPct: 80, rainMm: 5 }, makeHistory(10, 29, 7, 80))
    const r = assessRisk(w, 'dengue')
    expect(r.confidence).toBe('low')
  })

  it('is dry-season MODERATE/LOW: optimal temp but little rain', () => {
    const w = window({ tempC: 29, humidityPct: 55, rainMm: 0 }, makeHistory(56, 29, 0, 55))
    const r = assessRisk(w, 'dengue')
    expect(['low', 'moderate']).toContain(r.level)
  })
})

describe('assessRisk — cholera', () => {
  it('returns elevated risk after heavy recent rain in warm conditions', () => {
    const w = window({ tempC: 30, humidityPct: 80, rainMm: 10 }, makeHistory(56, 30, 12, 80))
    const r = assessRisk(w, 'cholera')
    expect(['moderate', 'high']).toContain(r.level)
  })

  it('always reports a sanitation data gap and caps confidence at moderate', () => {
    const w = window({ tempC: 30, humidityPct: 80, rainMm: 10 }, makeHistory(56, 30, 12, 80))
    const r = assessRisk(w, 'cholera')
    expect(r.confidence).toBe('moderate')
    expect(r.dataGaps.join(' ')).toMatch(/sanitation/i)
  })

  it('returns low risk in dry conditions', () => {
    const w = window({ tempC: 22, humidityPct: 40, rainMm: 0 }, makeHistory(56, 22, 0, 40))
    const r = assessRisk(w, 'cholera')
    expect(r.level).toBe('low')
  })
})
