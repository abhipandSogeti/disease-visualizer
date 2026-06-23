import { describe, it, expect } from 'vitest'
import { assessRisk, assessRiskTimeline, summarizeTrend } from './risk-engine'
import type { ClimateWindow, DailyWeather } from '@/types/climate.schema'
import type { DayRisk } from '@/types/risk.types'

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
  return { current, history, forecast: [] }
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

function makeForecast(
  days: number,
  tempC: number,
  rainMm: number,
  humidityPct: number,
): DailyWeather[] {
  return Array.from({ length: days }, (_, i) => ({
    date: `2026-03-${String(i + 1).padStart(2, '0')}`,
    tempC,
    humidityPct,
    rainMm,
  }))
}

describe('assessRiskTimeline — dengue', () => {
  it('returns exactly 14 DayRisk entries', () => {
    const w: ClimateWindow = {
      current: { tempC: 29, humidityPct: 80, rainMm: 5 },
      history: makeHistory(56, 29, 7, 80),
      forecast: makeForecast(14, 29, 5, 78),
    }
    const timeline = assessRiskTimeline(w, 'dengue')
    expect(timeline).toHaveLength(14)
  })

  it('each entry has date, score 0–1, and a valid level', () => {
    const w: ClimateWindow = {
      current: { tempC: 29, humidityPct: 80, rainMm: 5 },
      history: makeHistory(56, 29, 7, 80),
      forecast: makeForecast(14, 29, 5, 78),
    }
    const timeline = assessRiskTimeline(w, 'dengue')
    timeline.forEach((d) => {
      expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(d.score).toBeGreaterThanOrEqual(0)
      expect(d.score).toBeLessThanOrEqual(1)
      expect(['low', 'moderate', 'high']).toContain(d.level)
    })
  })

  it('dengue lag window for day 0 reads history indices 14–42 (weeks 2–6)', () => {
    const dryDays = Array.from({ length: 14 }, (_, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, '0')}`,
      tempC: 29,
      humidityPct: 80,
      rainMm: 0,
    }))
    const wetDays = Array.from({ length: 29 }, (_, i) => ({
      date: `2026-01-${String(i + 15).padStart(2, '0')}`,
      tempC: 29,
      humidityPct: 80,
      rainMm: 4,
    }))
    const dryDays2 = Array.from({ length: 13 }, (_, i) => ({
      date: `2026-02-${String(i + 1).padStart(2, '0')}`,
      tempC: 29,
      humidityPct: 80,
      rainMm: 0,
    }))
    const w: ClimateWindow = {
      current: { tempC: 29, humidityPct: 80, rainMm: 0 },
      history: [...dryDays, ...wetDays, ...dryDays2],
      forecast: makeForecast(14, 29, 0, 80),
    }
    const timeline = assessRiskTimeline(w, 'dengue')
    expect(timeline[0].score).toBeGreaterThan(0)
  })
})

describe('assessRiskTimeline — cholera', () => {
  it('returns 14 entries with valid levels', () => {
    const w: ClimateWindow = {
      current: { tempC: 28, humidityPct: 70, rainMm: 5 },
      history: makeHistory(56, 28, 10, 70),
      forecast: makeForecast(14, 28, 5, 70),
    }
    const timeline = assessRiskTimeline(w, 'cholera')
    expect(timeline).toHaveLength(14)
    timeline.forEach((d) => expect(['low', 'moderate', 'high']).toContain(d.level))
  })
})

describe('summarizeTrend', () => {
  it('detects rising trend when late days are higher than early days', () => {
    const timeline: DayRisk[] = Array.from({ length: 14 }, (_, i) => ({
      date: `2026-06-${String(i + 1).padStart(2, '0')}`,
      score: 0.1 + i * 0.06,
      level: i < 3 ? 'low' : i < 8 ? 'moderate' : 'high',
    }))
    const trend = summarizeTrend(timeline)
    expect(trend.direction).toBe('rising')
    expect(trend.peakScore).toBeGreaterThan(trend.todayScore)
  })

  it('detects falling trend when late days are lower than early days', () => {
    const timeline: DayRisk[] = Array.from({ length: 14 }, (_, i) => ({
      date: `2026-06-${String(i + 1).padStart(2, '0')}`,
      score: 0.9 - i * 0.06,
      level: i < 3 ? 'high' : i < 8 ? 'moderate' : 'low',
    }))
    const trend = summarizeTrend(timeline)
    expect(trend.direction).toBe('falling')
  })

  it('detects stable trend when scores do not move by >0.08', () => {
    const timeline: DayRisk[] = Array.from({ length: 14 }, (_, i) => ({
      date: `2026-06-${String(i + 1).padStart(2, '0')}`,
      score: 0.4 + (i % 3) * 0.01,
      level: 'moderate',
    }))
    const trend = summarizeTrend(timeline)
    expect(trend.direction).toBe('stable')
  })

  it('peakDate matches the highest-score day', () => {
    const timeline: DayRisk[] = Array.from({ length: 14 }, (_, i) => ({
      date: `2026-06-${String(i + 1).padStart(2, '0')}`,
      score: i === 7 ? 0.9 : 0.3,
      level: i === 7 ? 'high' : 'low',
    }))
    const trend = summarizeTrend(timeline)
    expect(trend.peakDate).toBe('2026-06-08')
  })
})
