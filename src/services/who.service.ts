import { API_BASE } from './api.config'
import { WHOResponseSchema, type WHORecord } from '@/types/who.schema'

export async function getDiseaseByCountry(iso3: string, indicator: string): Promise<WHORecord[]> {
  const url = `${API_BASE.who}/${indicator}?$filter=SpatialDim eq '${iso3}'`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`WHO API error: ${res.status}`)
  const raw = (await res.json()) as unknown
  const parsed = WHOResponseSchema.parse(raw)
  return parsed.value
}

export async function getDiseaseByCountryWithDims(
  iso3: string,
  indicator: string,
): Promise<WHORecord[]> {
  const url = `${API_BASE.who}/${indicator}?$filter=SpatialDim eq '${iso3}'`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`WHO API error: ${res.status}`)
  const raw = (await res.json()) as unknown
  const parsed = WHOResponseSchema.parse(raw)
  return parsed.value
}

export async function getDiseaseTimeSeries(iso3: string, indicator: string): Promise<WHORecord[]> {
  const records = await getDiseaseByCountry(iso3, indicator)
  return [...records].sort((a, b) => a.TimeDim - b.TimeDim)
}

export async function getDiseaseGlobal(indicator: string, year: number): Promise<WHORecord[]> {
  const url = `${API_BASE.who}/${indicator}?$filter=TimeDim eq ${year}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`WHO API error: ${res.status}`)
  const raw = (await res.json()) as unknown
  const parsed = WHOResponseSchema.parse(raw)
  return parsed.value
}
