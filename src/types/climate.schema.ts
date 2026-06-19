import { z } from 'zod'

export const DailyWeatherSchema = z.object({
  date: z.string(),
  tempC: z.number(),
  humidityPct: z.number(),
  rainMm: z.number(),
})

export const ClimateWindowSchema = z.object({
  current: z.object({
    tempC: z.number(),
    humidityPct: z.number(),
    rainMm: z.number(),
  }),
  history: z.array(DailyWeatherSchema),
})

export type DailyWeather = z.infer<typeof DailyWeatherSchema>
export type ClimateWindow = z.infer<typeof ClimateWindowSchema>
