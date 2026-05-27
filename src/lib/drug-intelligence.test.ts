import { describe, it, expect } from 'vitest'
import {
  getDrugPlainEnglish,
  getDrugMechanismSteps,
  getDrugEfficacyData,
  DRUG_INTELLIGENCE,
} from './drug-intelligence'

describe('getDrugPlainEnglish', () => {
  it('returns plain English for artemisinin', () => {
    const text = getDrugPlainEnglish('artemisinin')
    expect(text).toBeTruthy()
    expect(text.length).toBeGreaterThan(50)
  })
  it('returns a fallback for unknown drugs', () => {
    const text = getDrugPlainEnglish('unknownxyz')
    expect(text).toContain('a medicine')
  })
})

describe('getDrugMechanismSteps', () => {
  it('returns at least 2 steps for artemisinin', () => {
    const steps = getDrugMechanismSteps('artemisinin')
    expect(steps.length).toBeGreaterThanOrEqual(2)
    steps.forEach((s) => {
      expect(s).toHaveProperty('step')
      expect(s).toHaveProperty('title')
      expect(s).toHaveProperty('description')
      expect(s).toHaveProperty('icon')
    })
  })
})

describe('getDrugEfficacyData', () => {
  it('returns efficacy entries for artemisinin', () => {
    const data = getDrugEfficacyData('artemisinin')
    expect(data.length).toBeGreaterThan(0)
    data.forEach((d) => {
      expect(d).toHaveProperty('condition')
      expect(d).toHaveProperty('efficacyPercent')
      expect(d.efficacyPercent).toBeGreaterThan(0)
      expect(d.efficacyPercent).toBeLessThanOrEqual(100)
    })
  })
})

describe('DRUG_INTELLIGENCE', () => {
  it('has entries for key drugs', () => {
    expect(DRUG_INTELLIGENCE['artemisinin']).toBeDefined()
    expect(DRUG_INTELLIGENCE['chloroquine']).toBeDefined()
  })
})
