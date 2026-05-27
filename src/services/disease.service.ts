import { API_BASE } from './api.config'
import { DiseaseShResponseSchema, type DiseaseShCountry } from '@/types/disease.schema'

export async function getLiveOutbreaks(): Promise<DiseaseShCountry[]> {
  const url = `${API_BASE.disease}/covid-19/countries`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`disease.sh API error: ${res.status}`)
  const raw = (await res.json()) as unknown
  return DiseaseShResponseSchema.parse(raw)
}

export async function getLiveHistorical(
  iso2: string,
  lastDays: number | 'all' = 'all',
): Promise<Record<string, number>> {
  const url = `${API_BASE.disease}/covid-19/historical/${iso2}?lastdays=${lastDays}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`disease.sh API error: ${res.status}`)
  const raw = (await res.json()) as {
    timeline?: { cases?: Record<string, number> }
  }
  return raw.timeline?.cases ?? {}
}
