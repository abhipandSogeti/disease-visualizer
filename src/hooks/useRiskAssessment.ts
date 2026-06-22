import { useQuery } from '@tanstack/react-query'
import { getClimateWindow } from '@/services/climate.service'
import { assessRisk } from '@/lib/risk-engine'
import { getCareLadder } from '@/lib/care-ladder'
import { RISK_DISEASE_IDS, type RiskAssessment } from '@/types/risk.types'
import type { CareLadder } from '@/types/care-ladder.schema'

export interface RiskResult {
  assessment: RiskAssessment
  ladder: CareLadder | undefined
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
    staleTime: 36e5, // 1h
  })

  const results: RiskResult[] = query.data
    ? RISK_DISEASE_IDS.map((id) => ({
        assessment: assessRisk(query.data, id),
        ladder: getCareLadder(id),
      }))
    : []

  return { results, isLoading: enabled && query.isLoading, isError: query.isError }
}
