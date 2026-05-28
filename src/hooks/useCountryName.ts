import { useQuery } from '@tanstack/react-query'

type GeoFeature = { properties: { iso_a3: string; name: string } }

export function useCountryName(iso3: string): string {
  const { data } = useQuery({
    queryKey: ['geo', 'countries'],
    queryFn: async () => {
      const r = await fetch('/geo/countries-110m.json')
      const d = (await r.json()) as { features: GeoFeature[] }
      return Object.fromEntries(d.features.map((f) => [f.properties.iso_a3, f.properties.name]))
    },
    staleTime: Infinity,
  })
  return data?.[iso3] ?? iso3
}
