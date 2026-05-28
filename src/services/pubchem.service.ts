import { API_BASE } from './api.config'
import { PubChemPropertyResponseSchema, type PubChemCompound } from '@/types/pubchem.schema'

export async function getCompoundByName(name: string): Promise<PubChemCompound | null> {
  const props = 'MolecularFormula,MolecularWeight,IsomericSMILES,IUPACName,InChIKey'
  const url = `${API_BASE.pubchem}/compound/name/${encodeURIComponent(name)}/property/${props}/JSON`
  const res = await fetch(url)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`PubChem API error: ${res.status}`)
  const raw = (await res.json()) as unknown
  const parsed = PubChemPropertyResponseSchema.parse(raw)
  const p = parsed.PropertyTable.Properties[0]
  if (!p) return null
  return {
    cid: p.CID,
    molecularFormula: p.MolecularFormula,
    molecularWeight: p.MolecularWeight,
    isomericSmiles: p.IsomericSMILES ?? p.SMILES ?? '',
    iupacName: p.IUPACName ?? name,
    inchiKey: p.InChIKey ?? '',
  }
}

export function get3DStructureUrl(cid: number): string {
  return `${API_BASE.pubchem}/compound/cid/${cid}/record/SDF?record_type=3d&response_type=save`
}

export function get2DImageUrl(cid: number, size = 300): string {
  return `${API_BASE.pubchem}/compound/cid/${cid}/PNG?record_type=2d&image_size=${size}x${size}`
}
