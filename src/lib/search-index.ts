import { DEFAULT_DISEASES } from '@/types/app.types'

export type SearchResultType = 'disease' | 'country' | 'drug'

export interface SearchResult {
  id: string
  label: string
  type: SearchResultType
  description: string
  href: string
}

const COUNTRIES: { iso3: string; name: string }[] = [
  { iso3: 'NGA', name: 'Nigeria' },
  { iso3: 'COD', name: 'Democratic Republic of the Congo' },
  { iso3: 'MOZ', name: 'Mozambique' },
  { iso3: 'UGA', name: 'Uganda' },
  { iso3: 'IND', name: 'India' },
  { iso3: 'TZA', name: 'Tanzania' },
  { iso3: 'ETH', name: 'Ethiopia' },
  { iso3: 'ZAF', name: 'South Africa' },
  { iso3: 'GHA', name: 'Ghana' },
  { iso3: 'BFA', name: 'Burkina Faso' },
  { iso3: 'MLI', name: 'Mali' },
  { iso3: 'CMR', name: 'Cameroon' },
  { iso3: 'KEN', name: 'Kenya' },
  { iso3: 'ZMB', name: 'Zambia' },
  { iso3: 'ZWE', name: 'Zimbabwe' },
  { iso3: 'BGD', name: 'Bangladesh' },
  { iso3: 'PAK', name: 'Pakistan' },
  { iso3: 'BRA', name: 'Brazil' },
  { iso3: 'PHL', name: 'Philippines' },
  { iso3: 'IDN', name: 'Indonesia' },
  { iso3: 'USA', name: 'United States' },
  { iso3: 'GBR', name: 'United Kingdom' },
  { iso3: 'FRA', name: 'France' },
  { iso3: 'DEU', name: 'Germany' },
  { iso3: 'CHN', name: 'China' },
  { iso3: 'RUS', name: 'Russia' },
  { iso3: 'MEX', name: 'Mexico' },
  { iso3: 'COL', name: 'Colombia' },
  { iso3: 'VNM', name: 'Vietnam' },
  { iso3: 'THA', name: 'Thailand' },
]

const DRUGS: { name: string; pubchemId: number; disease: string }[] = [
  { name: 'Artemisinin', pubchemId: 68827, disease: 'Malaria' },
  { name: 'Chloroquine', pubchemId: 2719, disease: 'Malaria' },
  { name: 'Quinine', pubchemId: 3034034, disease: 'Malaria' },
  { name: 'Isoniazid', pubchemId: 3767, disease: 'Tuberculosis' },
  { name: 'Rifampicin', pubchemId: 5360416, disease: 'Tuberculosis' },
  { name: 'Pyrazinamide', pubchemId: 1046, disease: 'Tuberculosis' },
  { name: 'Tenofovir', pubchemId: 464205, disease: 'HIV' },
  { name: 'Efavirenz', pubchemId: 64139, disease: 'HIV' },
  { name: 'Dolutegravir', pubchemId: 54726191, disease: 'HIV' },
  { name: 'Dexamethasone', pubchemId: 5743, disease: 'COVID-19' },
  { name: 'Remdesivir', pubchemId: 121304016, disease: 'COVID-19' },
  { name: 'Nirmatrelvir', pubchemId: 145996610, disease: 'COVID-19' },
]

export function buildSearchIndex(): SearchResult[] {
  const diseases: SearchResult[] = DEFAULT_DISEASES.map((d) => ({
    id: d.id,
    label: d.name,
    type: 'disease' as const,
    description: d.description,
    href: `/disease/${d.id}`,
  }))

  const countries: SearchResult[] = COUNTRIES.map((c) => ({
    id: c.iso3,
    label: c.name,
    type: 'country' as const,
    description: `View all diseases for ${c.name}`,
    href: `/region/${c.iso3}`,
  }))

  const drugs: SearchResult[] = DRUGS.map((d) => ({
    id: String(d.pubchemId),
    label: d.name,
    type: 'drug' as const,
    description: `${d.disease} treatment — 3D molecule + clinical data`,
    href: `/drug/${d.pubchemId}`,
  }))

  return [...diseases, ...countries, ...drugs]
}

export function searchIndex(index: SearchResult[], query: string): SearchResult[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return index
    .filter((r) => r.label.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    .slice(0, 8)
}
