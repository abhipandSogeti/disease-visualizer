import { z } from 'zod'

export const PubChemPropertySchema = z.object({
  CID: z.number(),
  MolecularFormula: z.string(),
  MolecularWeight: z.string(),
  IsomericSMILES: z.string(),
  IUPACName: z.string().optional(),
  InChIKey: z.string().optional(),
})

export const PubChemPropertyResponseSchema = z.object({
  PropertyTable: z.object({
    Properties: z.array(PubChemPropertySchema),
  }),
})

export const PubChemCompoundSchema = z.object({
  cid: z.number(),
  molecularFormula: z.string(),
  molecularWeight: z.string(),
  isomericSmiles: z.string(),
  iupacName: z.string(),
  inchiKey: z.string(),
})

export type PubChemCompound = z.infer<typeof PubChemCompoundSchema>
