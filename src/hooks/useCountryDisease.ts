import { useQuery } from '@tanstack/react-query'
import { getDiseaseByCountry, getDiseaseTimeSeries, getDiseaseGlobal } from '@/services/who.service'

export function useCountryDisease(iso3: string, indicator: string) {
  return useQuery({
    queryKey: ['who', 'country', iso3, indicator],
    queryFn: () => getDiseaseByCountry(iso3, indicator),
    staleTime: 864e5,
    enabled: !!iso3 && !!indicator,
  })
}

export function useCountryDiseaseTimeSeries(iso3: string, indicator: string) {
  return useQuery({
    queryKey: ['who', 'timeseries', iso3, indicator],
    queryFn: () => getDiseaseTimeSeries(iso3, indicator),
    staleTime: 864e5,
    enabled: !!iso3 && !!indicator,
  })
}

export function useGlobalDisease(indicator: string, year: number) {
  return useQuery({
    queryKey: ['who', 'global', indicator, year],
    queryFn: () => getDiseaseGlobal(indicator, year),
    staleTime: 864e5,
    enabled: !!indicator && !!year,
  })
}
