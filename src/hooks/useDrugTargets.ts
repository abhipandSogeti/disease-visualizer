import { useQuery } from '@tanstack/react-query'
import { getMoleculeByName, getDrugActivities } from '@/services/chembl.service'

export function useDrugTargets(drugName: string) {
  const moleculeQuery = useQuery({
    queryKey: ['chembl', 'molecule', drugName],
    queryFn: () => getMoleculeByName(drugName),
    staleTime: 864e5,
    enabled: !!drugName,
  })
  const activitiesQuery = useQuery({
    queryKey: ['chembl', 'activities', moleculeQuery.data?.molecule_chembl_id],
    queryFn: () => getDrugActivities(moleculeQuery.data!.molecule_chembl_id),
    staleTime: 864e5,
    enabled: !!moleculeQuery.data?.molecule_chembl_id,
  })
  return {
    molecule: moleculeQuery.data,
    activities: activitiesQuery.data ?? [],
    isLoading: moleculeQuery.isLoading || activitiesQuery.isLoading,
    isError: moleculeQuery.isError || activitiesQuery.isError,
  }
}
