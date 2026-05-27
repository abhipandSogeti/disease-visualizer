import { describe, it, expect } from 'vitest'
import { formatFreshness } from './useDataFreshness'

describe('formatFreshness', () => {
  it('returns "just now" for recent timestamps', () => {
    const now = Date.now()
    expect(formatFreshness(now - 30_000)).toBe('Updated just now')
  })

  it('returns minutes for timestamps within an hour', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60_000
    expect(formatFreshness(fiveMinutesAgo)).toBe('Updated 5 minutes ago')
  })

  it('returns hours for older timestamps', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60_000
    expect(formatFreshness(twoHoursAgo)).toBe('Updated 2 hours ago')
  })

  it('returns "No data loaded" for zero', () => {
    expect(formatFreshness(0)).toBe('No data loaded yet')
  })
})
