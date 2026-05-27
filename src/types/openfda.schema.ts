import { z } from 'zod'

export const OpenFDADrugLabelSchema = z.object({
  openfda: z.object({
    brand_name: z.array(z.string()).optional(),
    generic_name: z.array(z.string()).optional(),
    manufacturer_name: z.array(z.string()).optional(),
    substance_name: z.array(z.string()).optional(),
  }),
  indications_and_usage: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  contraindications: z.array(z.string()).optional(),
  adverse_reactions: z.array(z.string()).optional(),
  dosage_and_administration: z.array(z.string()).optional(),
  description: z.array(z.string()).optional(),
  mechanism_of_action: z.array(z.string()).optional(),
})

export const OpenFDALabelResponseSchema = z.object({
  results: z.array(OpenFDADrugLabelSchema),
})

export const OpenFDAAdverseEventSchema = z.object({
  patient: z.object({
    reaction: z.array(
      z.object({
        reactionmeddrapt: z.string(),
        reactionoutcome: z.string().optional(),
      }),
    ),
    drug: z.array(
      z.object({
        medicinalproduct: z.string(),
      }),
    ),
  }),
})

export const OpenFDAAdverseResponseSchema = z.object({
  results: z.array(OpenFDAAdverseEventSchema),
  meta: z.object({ results: z.object({ total: z.number() }) }),
})

export type OpenFDADrugLabel = z.infer<typeof OpenFDADrugLabelSchema>
export type OpenFDAAdverseEvent = z.infer<typeof OpenFDAAdverseEventSchema>
export type OpenFDALabelResponse = z.infer<typeof OpenFDALabelResponseSchema>
export type OpenFDAAdverseResponse = z.infer<typeof OpenFDAAdverseResponseSchema>
