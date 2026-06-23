import { API_BASE } from './api.config'
import { ClimateWindowSchema, type ClimateWindow } from '@/types/climate.schema'
import { z } from 'zod'

export interface GeoPlace {
  name: string
  country: string
  admin: string
  lat: number
  lng: number
}

const GeocodeResponseSchema = z.object({
  results: z
    .array(
      z.object({
        name: z.string(),
        country: z.string().optional(),
        admin1: z.string().optional(),
        latitude: z.number(),
        longitude: z.number(),
      }),
    )
    .optional(),
})

export async function geocodePlace(query: string): Promise<GeoPlace | null> {
  const url = `${API_BASE.geocode}/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Geocoding error: ${res.status}`)
  const parsed = GeocodeResponseSchema.parse(await res.json())
  const first = parsed.results?.[0]
  if (!first) return null
  return {
    name: first.name,
    country: first.country ?? '',
    admin: first.admin1 ?? '',
    lat: first.latitude,
    lng: first.longitude,
  }
}

const OpenMeteoSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    relative_humidity_2m: z.number(),
    precipitation: z.number(),
  }),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_mean: z.array(z.number().nullable()),
    relative_humidity_2m_mean: z.array(z.number().nullable()),
    precipitation_sum: z.array(z.number().nullable()),
  }),
})

export async function getClimateWindow(lat: number, lng: number): Promise<ClimateWindow> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: 'temperature_2m,relative_humidity_2m,precipitation',
    daily: 'temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum',
    past_days: '56',
    forecast_days: '1',
    timezone: 'auto',
  })
  const res = await fetch(`${API_BASE.openmeteo}/forecast?${params.toString()}`)
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)
  const raw = OpenMeteoSchema.parse(await res.json())
  const history = raw.daily.time.map((date, i) => ({
    date,
    tempC: raw.daily.temperature_2m_mean[i] ?? 0,
    humidityPct: raw.daily.relative_humidity_2m_mean[i] ?? 0,
    rainMm: raw.daily.precipitation_sum[i] ?? 0,
  }))
  return ClimateWindowSchema.parse({
    current: {
      tempC: raw.current.temperature_2m,
      humidityPct: raw.current.relative_humidity_2m,
      rainMm: raw.current.precipitation,
    },
    history,
    forecast: [],
  })
}
