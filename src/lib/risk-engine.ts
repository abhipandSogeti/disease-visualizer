import type { ClimateWindow } from '@/types/climate.schema'
import type {
  Driver,
  RiskAssessment,
  RiskConfidence,
  RiskDiseaseId,
  RiskLevel,
} from '@/types/risk.types'

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n))

function levelFromScore(score: number): RiskLevel {
  if (score < 0.25) return 'low'
  if (score < 0.55) return 'moderate'
  return 'high'
}

// Cumulative rain over a lag window measured in days-ago [fromAgo, toAgo] (inclusive),
// counting from the end of history (most recent day = 0 days ago).
function cumulativeRain(window: ClimateWindow, fromAgo: number, toAgo: number): number {
  const h = window.history
  const n = h.length
  let sum = 0
  for (let ago = fromAgo; ago <= toAgo; ago++) {
    const idx = n - 1 - ago
    if (idx >= 0) sum += h[idx].rainMm
  }
  return sum
}

// Triangular thermal suitability for Aedes aegypti (Mordecai et al. 2017).
function dengueTempSuitability(tempC: number): number {
  const TMIN = 17.8
  const TOPT = 29.1
  const TMAX = 34.5
  if (tempC <= TMIN || tempC >= TMAX) return 0
  return tempC <= TOPT ? (tempC - TMIN) / (TOPT - TMIN) : (TMAX - tempC) / (TMAX - TOPT)
}

function assessDengue(w: ClimateWindow): RiskAssessment {
  const tempScore = clamp01(dengueTempSuitability(w.current.tempC))
  const laggedRain = cumulativeRain(w, 14, 42) // weeks 2–6
  const rainScore = clamp01((laggedRain - 20) / (150 - 20))
  const humidityScore = clamp01((w.current.humidityPct - 50) / (80 - 50))
  const envScore = 0.6 * rainScore + 0.4 * humidityScore
  const score = tempScore * envScore

  const drivers: Driver[] = [
    {
      factor: 'temperature',
      value: w.current.tempC,
      contribution: tempScore,
      note:
        tempScore === 0
          ? `${w.current.tempC}°C — outside mosquito transmission range`
          : `${w.current.tempC}°C — favourable for transmission`,
    },
    {
      factor: 'rainfall',
      value: Math.round(laggedRain),
      contribution: rainScore,
      note: `${Math.round(laggedRain)}mm over the past 2–6 weeks (breeding lag)`,
    },
    {
      factor: 'humidity',
      value: w.current.humidityPct,
      contribution: humidityScore,
      note: `${w.current.humidityPct}% relative humidity`,
    },
  ]

  const confidence: RiskConfidence = w.history.length >= 42 ? 'moderate' : 'low'
  const dataGaps =
    w.history.length >= 42 ? [] : ['Limited weather history — risk estimate is less certain.']

  return { diseaseId: 'dengue', level: levelFromScore(score), score, drivers, confidence, dataGaps }
}

export function assessRisk(climate: ClimateWindow, diseaseId: RiskDiseaseId): RiskAssessment {
  switch (diseaseId) {
    case 'dengue':
      return assessDengue(climate)
    case 'cholera':
      throw new Error('cholera model not implemented yet')
  }
}
