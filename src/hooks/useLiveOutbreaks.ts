import { useQuery } from '@tanstack/react-query'
import { getLiveOutbreaks, getLiveHistorical } from '@/services/disease.service'

export function useLiveOutbreaks() {
  return useQuery({
    queryKey: ['disease.sh', 'outbreaks'],
    queryFn: getLiveOutbreaks,
    staleTime: 6e5,
    refetchInterval: 6e5,
  })
}

export function useLiveHistorical(iso2: string) {
  return useQuery({
    queryKey: ['disease.sh', 'historical', iso2],
    queryFn: () => getLiveHistorical(iso2),
    staleTime: 36e5,
    enabled: !!iso2,
  })
}
