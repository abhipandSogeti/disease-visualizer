import { z } from 'zod'

export const CareLadderSchema = z.object({
  diseaseId: z.enum(['dengue', 'cholera']),
  source: z.string().min(1),
  updated: z.string().min(1),
  firstLine: z.string().min(1),
  ifUnavailable: z.array(z.string()),
  supportiveNoMedicine: z.array(z.string()),
  avoid: z.array(z.string()),
  redFlags: z.array(z.string()).min(1), // escalation is mandatory
  populationNotes: z.string().optional(),
})

export type CareLadder = z.infer<typeof CareLadderSchema>
