import { useQuery } from '@tanstack/react-query'
import { getIndicator, WB_INDICATORS } from '@/services/worldbank.service'

export function usePopulation(iso2: string) {
  return useQuery({
    queryKey: ['worldbank', iso2, WB_INDICATORS.population],
    queryFn: () => getIndicator(iso2, WB_INDICATORS.population),
    staleTime: 6048e5,
    enabled: !!iso2,
  })
}

export function useHospitalBeds(iso2: string) {
  return useQuery({
    queryKey: ['worldbank', iso2, WB_INDICATORS.hospitalBeds],
    queryFn: () => getIndicator(iso2, WB_INDICATORS.hospitalBeds),
    staleTime: 6048e5,
    enabled: !!iso2,
  })
}

export function useLifeExpectancy(iso2: string) {
  return useQuery({
    queryKey: ['worldbank', iso2, WB_INDICATORS.lifeExpectancy],
    queryFn: () => getIndicator(iso2, WB_INDICATORS.lifeExpectancy),
    staleTime: 6048e5,
    enabled: !!iso2,
  })
}

export function useGdpPerCapita(iso2: string) {
  return useQuery({
    queryKey: ['worldbank', iso2, WB_INDICATORS.gdpPerCapita],
    queryFn: () => getIndicator(iso2, WB_INDICATORS.gdpPerCapita),
    staleTime: 6048e5,
    enabled: !!iso2,
  })
}
