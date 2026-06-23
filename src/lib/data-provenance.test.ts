import { describe, it, expect } from 'vitest'
import { getDataSource, isStale } from './data-provenance'

describe('getDataSource', () => {
  it('returns a labelled, linked source for a known disease', () => {
    const src = getDataSource('malaria')
    expect(src?.label).toMatch(/malaria/i)
    expect(src?.url).toMatch(/^https:\/\/www\.who\.int/)
  })

  it('returns undefined for an unknown disease', () => {
    expect(getDataSource('not-a-disease')).toBeUndefined()
  })
})

describe('isStale', () => {
  it('flags data 3+ years behind the current year', () => {
    expect(isStale(2016, 2026)).toBe(true)
  })

  it('does not flag recent data', () => {
    expect(isStale(2024, 2026)).toBe(false)
  })

  it('treats exactly the threshold as stale', () => {
    expect(isStale(2023, 2026)).toBe(true)
  })
})
