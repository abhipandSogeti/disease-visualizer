import { z } from 'zod'

export const RxNormDrugSchema = z.object({
  rxcui: z.string(),
  name: z.string(),
  tty: z.string(),
  umlscui: z.string().optional(),
})

export const RxNormDrugsResponseSchema = z.object({
  drugGroup: z.object({
    conceptGroup: z
      .array(
        z.object({
          tty: z.string().optional(),
          conceptProperties: z.array(RxNormDrugSchema).optional(),
        }),
      )
      .optional(),
  }),
})

export const RxNormInteractionSchema = z.object({
  minConceptItem: z.object({
    rxcui: z.string(),
    name: z.string(),
    tty: z.string(),
  }),
  interactionPair: z.array(
    z.object({
      interactionConcept: z.array(
        z.object({
          minConceptItem: z.object({ name: z.string(), rxcui: z.string() }),
          sourceConceptItem: z.object({
            name: z.string(),
            ddi_risk: z.string().optional(),
            description: z.string().optional(),
          }),
        }),
      ),
      severity: z.string().optional(),
      description: z.string().optional(),
    }),
  ),
})

export const RxNormInteractionResponseSchema = z.object({
  interactionTypeGroup: z
    .array(
      z.object({
        interactionType: z.array(RxNormInteractionSchema),
      }),
    )
    .optional(),
})

export type RxNormDrug = z.infer<typeof RxNormDrugSchema>
export type RxNormInteraction = z.infer<typeof RxNormInteractionSchema>
export type RxNormInteractionResponse = z.infer<typeof RxNormInteractionResponseSchema>
