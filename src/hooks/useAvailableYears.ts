import { useQuery } from '@tanstack/react-query'
import { API_BASE } from '@/services/api.config'

export function useAvailableYears(indicator: string) {
  return useQuery({
    queryKey: ['who', 'years', indicator],
    queryFn: async () => {
      const url = `${API_BASE.who}/${indicator}?$select=TimeDim&$orderby=TimeDim%20desc&$top=500`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`WHO years error: ${res.status}`)
      const raw = (await res.json()) as { value: { TimeDim: number }[] }
      return [...new Set(raw.value.map((r) => r.TimeDim))].sort((a, b) => b - a)
    },
    staleTime: 864e5,
    enabled: !!indicator,
  })
}
