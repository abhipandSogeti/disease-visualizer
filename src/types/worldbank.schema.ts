import { z } from 'zod'

export const WorldBankIndicatorValueSchema = z.object({
  indicator: z.object({ id: z.string(), value: z.string() }),
  country: z.object({ id: z.string(), value: z.string() }),
  date: z.string(),
  value: z.number().nullable(),
})

export const WorldBankResponseSchema = z.tuple([
  z.object({ page: z.number(), total: z.number() }),
  z.array(WorldBankIndicatorValueSchema),
])

export type WorldBankIndicatorValue = z.infer<typeof WorldBankIndicatorValueSchema>
export type WorldBankResponse = z.infer<typeof WorldBankResponseSchema>
