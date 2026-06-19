export type RiskLevel = 'low' | 'moderate' | 'high'
export type RiskConfidence = 'low' | 'moderate' // never 'high' in v1

// Diseases the v1 climate engine models.
export type RiskDiseaseId = 'dengue' | 'cholera'
export const RISK_DISEASE_IDS: RiskDiseaseId[] = ['dengue', 'cholera']

export interface Driver {
  factor: 'temperature' | 'rainfall' | 'humidity'
  value: number // observed value (°C, mm cumulative, or %RH)
  contribution: number // 0..1 how much this factor pushed risk up
  note: string // human explanation, e.g. "28°C — optimal for transmission"
}

export interface RiskAssessment {
  diseaseId: RiskDiseaseId
  level: RiskLevel
  score: number // 0..1 composite, for ordering/debug
  drivers: Driver[]
  confidence: RiskConfidence
  dataGaps: string[]
}
