import { useQuery } from '@tanstack/react-query'
import { getRxCui, getDrugInteractions } from '@/services/rxnorm.service'

export function useDrugInteractions(drugName: string) {
  const rxcuiQuery = useQuery({
    queryKey: ['rxnorm', 'rxcui', drugName],
    queryFn: () => getRxCui(drugName),
    staleTime: 36e5,
    enabled: !!drugName,
  })
  const interactionsQuery = useQuery({
    queryKey: ['rxnorm', 'interactions', rxcuiQuery.data],
    queryFn: () => getDrugInteractions(rxcuiQuery.data!),
    staleTime: 36e5,
    enabled: !!rxcuiQuery.data,
  })
  return {
    rxcui: rxcuiQuery.data,
    interactions: interactionsQuery.data ?? [],
    isLoading: rxcuiQuery.isLoading || interactionsQuery.isLoading,
    isError: rxcuiQuery.isError || interactionsQuery.isError,
  }
}
