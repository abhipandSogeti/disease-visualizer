import { API_BASE } from './api.config'
import {
  RxNormDrugsResponseSchema,
  RxNormInteractionResponseSchema,
  type RxNormInteraction,
} from '@/types/rxnorm.schema'

export async function getRxCui(drugName: string): Promise<string | null> {
  const url = `${API_BASE.rxnorm}/drugs.json?name=${encodeURIComponent(drugName)}`
  const res = await fetch(url)
  if (!res.ok) return null
  const raw = (await res.json()) as unknown
  const parsed = RxNormDrugsResponseSchema.parse(raw)
  const groups = parsed.drugGroup.conceptGroup ?? []
  for (const group of groups) {
    const props = group.conceptProperties
    if (props && props.length > 0) return props[0].rxcui
  }
  return null
}

export async function getDrugInteractions(rxcui: string): Promise<RxNormInteraction[]> {
  const url = `${API_BASE.rxnorm}/interaction/interaction.json?rxcui=${rxcui}`
  const res = await fetch(url)
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`RxNorm API error: ${res.status}`)
  const raw = (await res.json()) as unknown
  const parsed = RxNormInteractionResponseSchema.parse(raw)
  return (parsed.interactionTypeGroup ?? []).flatMap((g) => g.interactionType)
}
