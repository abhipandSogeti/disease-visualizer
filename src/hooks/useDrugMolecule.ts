import { useQuery } from '@tanstack/react-query'
import { getCompoundByName, get2DImageUrl, get3DStructureUrl } from '@/services/pubchem.service'

export function useDrugMolecule(drugName: string) {
  return useQuery({
    queryKey: ['pubchem', 'compound', drugName],
    queryFn: () => getCompoundByName(drugName),
    staleTime: Infinity,
    enabled: !!drugName,
  })
}

export function useDrug2DImageUrl(cid: number | undefined): string | null {
  return cid ? get2DImageUrl(cid) : null
}

export function useDrug3DUrl(cid: number | undefined): string | null {
  return cid ? get3DStructureUrl(cid) : null
}
