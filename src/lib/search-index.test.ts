import { describe, it, expect } from 'vitest'
import { buildSearchIndex, searchIndex } from './search-index'
import { DEFAULT_DISEASES } from '@/types/app.types'

describe('buildSearchIndex', () => {
  it('includes all default diseases', () => {
    const index = buildSearchIndex()
    const ids = index.filter((r) => r.type === 'disease').map((r) => r.id)
    DEFAULT_DISEASES.forEach((d) => {
      expect(ids).toContain(d.id)
    })
  })

  it('includes known countries', () => {
    const index = buildSearchIndex()
    const names = index.filter((r) => r.type === 'country').map((r) => r.label.toLowerCase())
    expect(names).toContain('nigeria')
    expect(names).toContain('india')
  })

  it('includes known drugs', () => {
    const index = buildSearchIndex()
    const names = index.filter((r) => r.type === 'drug').map((r) => r.label.toLowerCase())
    expect(names).toContain('artemisinin')
  })
})

describe('searchIndex', () => {
  it('returns results matching the query', () => {
    const index = buildSearchIndex()
    const results = searchIndex(index, 'malaria')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].label.toLowerCase()).toContain('malaria')
  })

  it('is case-insensitive', () => {
    const index = buildSearchIndex()
    const results = searchIndex(index, 'NIGERIA')
    expect(results.length).toBeGreaterThan(0)
  })

  it('returns empty for no matches', () => {
    const index = buildSearchIndex()
    const results = searchIndex(index, 'xyzzznotarealterm')
    expect(results).toHaveLength(0)
  })

  it('limits results to 8', () => {
    const index = buildSearchIndex()
    const results = searchIndex(index, 'a')
    expect(results.length).toBeLessThanOrEqual(8)
  })
})
