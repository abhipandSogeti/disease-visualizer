import { API_BASE } from './api.config'
import {
  ChEMBLMoleculeSchema,
  ChEMBLActivityResponseSchema,
  type ChEMBLMolecule,
  type ChEMBLActivity,
} from '@/types/chembl.schema'

export async function getMoleculeByName(name: string): Promise<ChEMBLMolecule | null> {
  const url = `${API_BASE.chembl}/molecule.json?pref_name__iexact=${encodeURIComponent(name)}&limit=1`
  const res = await fetch(url)
  if (!res.ok) return null
  const raw = (await res.json()) as { molecules?: unknown[] }
  if (!raw.molecules?.length) return null
  return ChEMBLMoleculeSchema.parse(raw.molecules[0])
}

export async function getDrugActivities(chemblId: string, limit = 20): Promise<ChEMBLActivity[]> {
  const url = `${API_BASE.chembl}/activity.json?molecule_chembl_id=${chemblId}&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) return []
  const raw = (await res.json()) as unknown
  const parsed = ChEMBLActivityResponseSchema.parse(raw)
  return parsed.activities
}
