import { z } from 'zod'

export const ChEMBLMoleculeSchema = z.object({
  molecule_chembl_id: z.string(),
  pref_name: z.string().nullable(),
  max_phase: z.number().nullable(),
  molecule_type: z.string().nullable(),
  molecule_properties: z
    .object({
      mw_freebase: z.string().nullable(),
      alogp: z.string().nullable(),
      hba: z.number().nullable(),
      hbd: z.number().nullable(),
    })
    .nullable(),
  molecule_structures: z
    .object({
      canonical_smiles: z.string().nullable(),
      molfile: z.string().nullable(),
    })
    .nullable(),
})

export const ChEMBLActivitySchema = z.object({
  activity_id: z.number(),
  assay_description: z.string().nullable(),
  target_pref_name: z.string().nullable(),
  standard_type: z.string().nullable(),
  standard_value: z.string().nullable(),
  standard_units: z.string().nullable(),
})

export const ChEMBLActivityResponseSchema = z.object({
  activities: z.array(ChEMBLActivitySchema),
})

export type ChEMBLMolecule = z.infer<typeof ChEMBLMoleculeSchema>
export type ChEMBLActivity = z.infer<typeof ChEMBLActivitySchema>
export type ChEMBLActivityResponse = z.infer<typeof ChEMBLActivityResponseSchema>
