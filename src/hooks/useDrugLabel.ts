import { useQuery } from '@tanstack/react-query'
import { getDrugLabel, getAdverseEventCounts } from '@/services/openfda.service'

export function useDrugLabel(genericName: string) {
  return useQuery({
    queryKey: ['openfda', 'label', genericName],
    queryFn: () => getDrugLabel(genericName),
    staleTime: 36e5,
    enabled: !!genericName,
  })
}

export function useAdverseEvents(drugName: string) {
  return useQuery({
    queryKey: ['openfda', 'adverse', drugName],
    queryFn: () => getAdverseEventCounts(drugName),
    staleTime: 36e5,
    enabled: !!drugName,
  })
}
