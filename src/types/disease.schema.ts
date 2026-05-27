import { z } from 'zod'

export const DiseaseShCountrySchema = z.object({
  country: z.string(),
  countryInfo: z.object({
    iso2: z.string().nullable(),
    iso3: z.string().nullable(),
    lat: z.number(),
    long: z.number(),
  }),
  cases: z.number(),
  todayCases: z.number(),
  deaths: z.number(),
  todayDeaths: z.number(),
  recovered: z.number(),
  active: z.number(),
  critical: z.number(),
  updated: z.number(),
})

export const DiseaseShResponseSchema = z.array(DiseaseShCountrySchema)

export type DiseaseShCountry = z.infer<typeof DiseaseShCountrySchema>
export type DiseaseShResponse = z.infer<typeof DiseaseShResponseSchema>
