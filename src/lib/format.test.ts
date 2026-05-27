import { describe, it, expect } from 'vitest'
import { formatCount, formatRate, formatPercent, getTrendDirection } from './format'

describe('formatCount', () => {
  it('formats millions', () => {
    expect(formatCount(68400000)).toBe('68.4 Million')
  })
  it('formats billions', () => {
    expect(formatCount(1200000000)).toBe('1.2 Billion')
  })
  it('formats thousands', () => {
    expect(formatCount(143000)).toBe('143,000')
  })
  it('formats small numbers', () => {
    expect(formatCount(42)).toBe('42')
  })
  it('returns no data for null', () => {
    expect(formatCount(null)).toBe('No data available')
  })
})

describe('formatRate', () => {
  it('converts decimal to per-1000 rate', () => {
    expect(formatRate(0.0034)).toBe('3.4 per 1,000 people')
  })
  it('handles zero', () => {
    expect(formatRate(0)).toBe('0.0 per 1,000 people')
  })
})

describe('formatPercent', () => {
  it('formats decimal as percentage', () => {
    expect(formatPercent(0.78)).toBe('78.0%')
  })
  it('formats small percentage', () => {
    expect(formatPercent(0.0021)).toBe('0.2%')
  })
})

describe('getTrendDirection', () => {
  it('returns increasing for positive change', () => {
    expect(getTrendDirection(100, 112)).toBe('increasing')
  })
  it('returns decreasing for negative change', () => {
    expect(getTrendDirection(100, 92)).toBe('decreasing')
  })
  it('returns stable for small change', () => {
    expect(getTrendDirection(100, 100.5)).toBe('stable')
  })
})
