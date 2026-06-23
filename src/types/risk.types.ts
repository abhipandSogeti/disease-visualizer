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

export interface DayRisk {
  date: string // ISO-8601 e.g. "2026-06-23"
  score: number // 0–1 composite
  level: RiskLevel
}

export type TrendDirection = 'rising' | 'falling' | 'stable'

export interface TrendSummary {
  direction: TrendDirection
  peakDate: string // ISO-8601 date of highest score
  peakLevel: RiskLevel
  todayScore: number // timeline[0].score
  peakScore: number
}
