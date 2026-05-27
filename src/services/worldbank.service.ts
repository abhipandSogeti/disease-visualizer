import { API_BASE } from './api.config'
import { WorldBankResponseSchema, type WorldBankIndicatorValue } from '@/types/worldbank.schema'

export async function getIndicator(
  iso2: string,
  indicator: string,
  perPage = 60,
): Promise<WorldBankIndicatorValue[]> {
  const url = `${API_BASE.worldbank}/country/${iso2}/indicator/${indicator}?format=json&per_page=${perPage}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`World Bank API error: ${res.status}`)
  const raw = (await res.json()) as unknown
  const [, data] = WorldBankResponseSchema.parse(raw)
  return data.filter((d) => d.value !== null)
}

export const WB_INDICATORS = {
  population: 'SP.POP.TOTL',
  hospitalBeds: 'SH.MED.BEDS.ZS',
  infantMortality: 'SP.DYN.IMRT.IN',
  lifeExpectancy: 'SP.DYN.LE00.IN',
  gdpPerCapita: 'NY.GDP.PCAP.CD',
} as const
