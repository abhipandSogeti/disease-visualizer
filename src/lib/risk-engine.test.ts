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
