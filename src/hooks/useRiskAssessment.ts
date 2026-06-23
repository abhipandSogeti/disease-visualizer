import { useQuery } from '@tanstack/react-query'
import { getClimateWindow } from '@/services/climate.service'
import { assessRisk, assessRiskTimeline, summarizeTrend } from '@/lib/risk-engine'
import { getCareLadder } from '@/lib/care-ladder'
import {
  RISK_DISEASE_IDS,
  type RiskAssessment,
  type DayRisk,
  type TrendSummary,
} from '@/types/risk.types'
import type { CareLadder } from '@/types/care-ladder.schema'

export interface RiskResult {
  assessment: RiskAssessment
  ladder: CareLadder | undefined
  timeline: DayRisk[]
  trend: TrendSummary
}

export interface UseRiskAssessment {
  results: RiskResult[]
  isLoading: boolean
  isError: boolean
}

export function useRiskAssessment(lat: number | null, lng: number | null): UseRiskAssessment {
  const enabled = lat !== null && lng !== null
  const query = useQuery({
    queryKey: ['climate', lat, lng],
    queryFn: () => getClimateWindow(lat as number, lng as number),
    enabled,
    staleTime: 36e5,
  })

  const results: RiskResult[] = query.data
    ? RISK_DISEASE_IDS.map((id) => {
        const timeline = assessRiskTimeline(query.data, id)
        return {
          assessment: assessRisk(query.data, id),
          ladder: getCareLadder(id),
          timeline,
          trend: summarizeTrend(timeline),
        }
      })
    : []

  return { results, isLoading: enabled && query.isLoading, isError: query.isError }
}
