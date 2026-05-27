import { API_BASE } from './api.config'
import { OpenFDALabelResponseSchema, type OpenFDADrugLabel } from '@/types/openfda.schema'

export async function getDrugLabel(genericName: string): Promise<OpenFDADrugLabel | null> {
  const url = `${API_BASE.openfda}/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(genericName)}"&limit=1`
  const res = await fetch(url)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`OpenFDA API error: ${res.status}`)
  const raw = (await res.json()) as unknown
  const parsed = OpenFDALabelResponseSchema.parse(raw)
  return parsed.results[0] ?? null
}

export async function getAdverseEventCounts(
  drugName: string,
  limit = 100,
): Promise<{ reaction: string; count: number }[]> {
  const url = `${API_BASE.openfda}/drug/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(drugName)}"&count=patient.reaction.reactionmeddrapt.exact&limit=${limit}`
  const res = await fetch(url)
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`OpenFDA API error: ${res.status}`)
  const raw = (await res.json()) as { results?: { term: string; count: number }[] }
  return (raw.results ?? []).map((r) => ({ reaction: r.term, count: r.count }))
}
