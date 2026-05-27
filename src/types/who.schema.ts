import { z } from 'zod'

export const WHORecordSchema = z.object({
  Id: z.string(),
  IndicatorCode: z.string(),
  SpatialDim: z.string(),
  TimeDim: z.number(),
  NumericValue: z.number().nullable(),
  Low: z.number().nullable(),
  High: z.number().nullable(),
})

export const WHOResponseSchema = z.object({
  value: z.array(WHORecordSchema),
})

export type WHORecord = z.infer<typeof WHORecordSchema>
export type WHOResponse = z.infer<typeof WHOResponseSchema>

// Re-export other schemas for tests
export { DiseaseShCountrySchema } from './disease.schema'
export { WorldBankResponseSchema } from './worldbank.schema'
export { PubChemCompoundSchema } from './pubchem.schema'
export { RxNormInteractionSchema } from './rxnorm.schema'
