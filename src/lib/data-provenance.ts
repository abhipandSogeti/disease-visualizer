// Authoritative source citations per disease, plus a staleness signal so the UI
// can be honest about data vintage. Data year is taken from the actual WHO record
// (TimeDim) at the call site — this map only supplies the source label + link.

export interface DataSource {
  label: string
  url: string
}

const SOURCES: Record<string, DataSource> = {
  malaria: {
    label: 'WHO World Malaria Report 2025',
    url: 'https://www.who.int/teams/global-malaria-programme/reports/world-malaria-report-2025',
  },
  tuberculosis: {
    label: 'WHO Global Tuberculosis Report 2025',
    url: 'https://www.who.int/teams/global-programme-on-tuberculosis-and-lung-health/tb-reports',
  },
  hiv: {
    label: 'WHO Global Health Observatory — HIV/AIDS',
    url: 'https://www.who.int/data/gho/data/themes/hiv-aids',
  },
  cholera: {
    label: 'WHO Global Health Observatory — Cholera',
    url: 'https://www.who.int/data/gho/data/themes/topics/topic-details/GHO/cholera',
  },
  polio: {
    label: 'WHO Global Health Observatory',
    url: 'https://www.who.int/data/gho',
  },
}

export function getDataSource(diseaseId: string): DataSource | undefined {
  return SOURCES[diseaseId]
}

// Data this many years (or more) behind the current year is flagged as stale.
export const STALE_AFTER_YEARS = 3

export function isStale(dataYear: number, now: number = new Date().getFullYear()): boolean {
  return now - dataYear >= STALE_AFTER_YEARS
}
