import { describe, it, expect } from 'vitest'
import { DISEASE_CATEGORIES, DEFAULT_DISEASES } from './app.types'

describe('app.types', () => {
  it('exports 5 disease categories', () => {
    expect(DISEASE_CATEGORIES).toHaveLength(5)
  })

  it('default diseases list contains Malaria', () => {
    expect(DEFAULT_DISEASES.some((d) => d.id === 'malaria')).toBe(true)
  })

  it('every default disease has required fields', () => {
    DEFAULT_DISEASES.forEach((d) => {
      expect(d).toHaveProperty('id')
      expect(d).toHaveProperty('name')
      expect(d).toHaveProperty('category')
      expect(d).toHaveProperty('whoIndicator')
      expect(d).toHaveProperty('colour')
    })
  })
})
