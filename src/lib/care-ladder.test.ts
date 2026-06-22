import { describe, it, expect } from 'vitest'
import { getCareLadder, CARE_LADDERS } from './care-ladder'
import { CareLadderSchema } from '@/types/care-ladder.schema'
import { RISK_DISEASE_IDS } from '@/types/risk.types'

describe('care-ladder data', () => {
  it('every record passes the schema', () => {
    for (const record of CARE_LADDERS) {
      expect(() => CareLadderSchema.parse(record)).not.toThrow()
    }
  })

  it('covers every modelled disease', () => {
    for (const id of RISK_DISEASE_IDS) {
      expect(getCareLadder(id)).toBeDefined()
    }
  })

  it('dengue ladder warns against NSAIDs (safety regression)', () => {
    const dengue = getCareLadder('dengue')!
    expect(dengue.avoid.join(' ').toLowerCase()).toMatch(/nsaid|ibuprofen|aspirin/)
  })

  it('cholera ladder includes an ORS fallback', () => {
    const cholera = getCareLadder('cholera')!
    const all = [cholera.firstLine, ...cholera.ifUnavailable, ...cholera.supportiveNoMedicine].join(
      ' ',
    )
    expect(all.toLowerCase()).toMatch(/ors|oral rehydration|salt|sugar/)
  })
})
