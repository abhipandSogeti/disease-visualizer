import { describe, it, expect } from 'vitest'
import { CareLadderSchema } from './care-ladder.schema'

describe('CareLadderSchema', () => {
  it('parses a complete ladder record', () => {
    const raw = {
      diseaseId: 'dengue',
      source: 'WHO Dengue Guidelines',
      updated: '2024-01-01',
      firstLine: 'Supportive care; paracetamol for fever.',
      ifUnavailable: ['Tepid sponging'],
      supportiveNoMedicine: ['Oral hydration'],
      avoid: ['NSAIDs'],
      redFlags: ['Severe abdominal pain'],
    }
    expect(() => CareLadderSchema.parse(raw)).not.toThrow()
  })

  it('rejects a record with no redFlags', () => {
    const raw = {
      diseaseId: 'dengue',
      source: 'WHO',
      updated: '2024-01-01',
      firstLine: 'x',
      ifUnavailable: [],
      supportiveNoMedicine: [],
      avoid: [],
      redFlags: [],
    }
    expect(() => CareLadderSchema.parse(raw)).toThrow()
  })
})
