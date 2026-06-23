import type { ClimateWindow, DailyWeather } from '@/types/climate.schema'
import type {
  DayRisk,
  Driver,
  RiskAssessment,
  RiskConfidence,
  RiskDiseaseId,
  RiskLevel,
  TrendSummary,
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

// Composite scoring — single source of truth shared by the point-in-time
// assessment (assessRisk) and the forward timeline (assessRiskTimeline).

interface DengueScore {
  score: number
  tempScore: number
  rainScore: number
  humidScore: number
}

function scoreDengue(tempC: number, humidityPct: number, laggedRainMm: number): DengueScore {
  const tempScore = clamp01(dengueTempSuitability(tempC))
  const rainScore = clamp01((laggedRainMm - 20) / (150 - 20))
  const humidScore = clamp01((humidityPct - 50) / (80 - 50))
  const score = tempScore * (0.6 * rainScore + 0.4 * humidScore)
  return { score, tempScore, rainScore, humidScore }
}

interface CholeraScore {
  score: number
  rainScore: number
  tempScore: number
}

function scoreCholera(tempC: number, laggedRainMm: number): CholeraScore {
  const rainScore = clamp01((laggedRainMm - 30) / (200 - 30))
  const tempScore = clamp01((tempC - 20) / (30 - 20))
  const score = 0.7 * rainScore + 0.3 * tempScore
  return { score, rainScore, tempScore }
}

function assessDengue(w: ClimateWindow): RiskAssessment {
  const laggedRain = cumulativeRain(w, 14, 42) // weeks 2–6
  const { score, tempScore, rainScore, humidScore } = scoreDengue(
    w.current.tempC,
    w.current.humidityPct,
    laggedRain,
  )

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
      contribution: humidScore,
      note: `${w.current.humidityPct}% relative humidity`,
    },
  ]

  const confidence: RiskConfidence = w.history.length >= 42 ? 'moderate' : 'low'
  const dataGaps =
    w.history.length >= 42 ? [] : ['Limited weather history — risk estimate is less certain.']

  return { diseaseId: 'dengue', level: levelFromScore(score), score, drivers, confidence, dataGaps }
}

function assessCholera(w: ClimateWindow): RiskAssessment {
  const recentRain = cumulativeRain(w, 7, 28) // weeks 1–4
  const { score, rainScore, tempScore } = scoreCholera(w.current.tempC, recentRain)

  const drivers: Driver[] = [
    {
      factor: 'rainfall',
      value: Math.round(recentRain),
      contribution: rainScore,
      note: `${Math.round(recentRain)}mm over the past 1–4 weeks (flood/contamination risk)`,
    },
    {
      factor: 'temperature',
      value: w.current.tempC,
      contribution: tempScore,
      note: `${w.current.tempC}°C — warmth aids bacterial growth`,
    },
  ]

  const dataGaps = [
    'Climate signal only — actual cholera risk depends on local water & sanitation, which is not measured here.',
  ]
  if (w.history.length < 28) dataGaps.push('Limited weather history — estimate is less certain.')

  return {
    diseaseId: 'cholera',
    level: levelFromScore(score),
    score,
    drivers,
    confidence: 'moderate',
    dataGaps,
  }
}

export function assessRisk(climate: ClimateWindow, diseaseId: RiskDiseaseId): RiskAssessment {
  switch (diseaseId) {
    case 'dengue':
      return assessDengue(climate)
    case 'cholera':
      return assessCholera(climate)
  }
}

// Sum rain from a flat series array over [i - toAgo, i - fromAgo] (inclusive both ends).
function seriesRain(series: DailyWeather[], i: number, fromAgo: number, toAgo: number): number {
  let sum = 0
  for (let ago = fromAgo; ago <= toAgo; ago++) {
    const idx = i - ago
    if (idx >= 0 && idx < series.length) sum += series[idx].rainMm
  }
  return sum
}

export function assessRiskTimeline(window: ClimateWindow, diseaseId: RiskDiseaseId): DayRisk[] {
  const series: DailyWeather[] = [...window.history, ...window.forecast]
  const forecastStart = window.history.length

  return window.forecast.map((day, d) => {
    const i = forecastStart + d
    let score: number
    if (diseaseId === 'dengue') {
      const laggedRain = seriesRain(series, i, 14, 42)
      score = scoreDengue(day.tempC, day.humidityPct, laggedRain).score
    } else {
      const laggedRain = seriesRain(series, i, 7, 28)
      score = scoreCholera(day.tempC, laggedRain).score
    }
    return { date: day.date, score, level: levelFromScore(score) }
  })
}

export function summarizeTrend(timeline: DayRisk[]): TrendSummary {
  if (timeline.length === 0) {
    return {
      direction: 'stable',
      peakDate: '',
      peakLevel: 'low',
      todayScore: 0,
      peakScore: 0,
    }
  }

  const avg = (arr: DayRisk[]) => arr.reduce((s, d) => s + d.score, 0) / arr.length

  const early = avg(timeline.slice(0, 4))
  const late = avg(timeline.slice(10, 14))
  const delta = late - early

  const direction = delta > 0.08 ? 'rising' : delta < -0.08 ? 'falling' : 'stable'

  let peakIdx = 0
  for (let i = 1; i < timeline.length; i++) {
    if (timeline[i].score > timeline[peakIdx].score) peakIdx = i
  }

  return {
    direction,
    peakDate: timeline[peakIdx].date,
    peakLevel: timeline[peakIdx].level,
    todayScore: timeline[0].score,
    peakScore: timeline[peakIdx].score,
  }
}
