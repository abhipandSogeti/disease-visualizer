import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDiseaseByCountry, getDiseaseByCountryWithDims } from '@/services/who.service'
import { CFR_INDICATORS } from '@/lib/cfr-catalogue'

// ============================================================================
// useAgeSexBreakdown Hook
// ============================================================================

export interface AgeSexRow {
  ageGroup: string
  male: number
  female: number
}

interface UseAgeSexBreakdownResult {
  data: AgeSexRow[] | null
  isLoading: boolean
  isError: boolean
  hasData: boolean
  year?: number
}

type AgeGroupKey =
  | 'AGEGROUP_YEARSUNDER5'
  | 'AGEGROUP_YEARSLESS15'
  | 'AGEGROUP_YEARS05-14'
  | 'AGEGROUP_YEARS15-24'
  | 'AGEGROUP_YEARS25-34'
  | 'AGEGROUP_YEARS35-44'
  | 'AGEGROUP_YEARS45-54'
  | 'AGEGROUP_YEARS55-64'
  | 'AGEGROUP_YEARS65PLUS'

const AGE_GROUP_ORDER: AgeGroupKey[] = [
  'AGEGROUP_YEARSUNDER5',
  'AGEGROUP_YEARSLESS15',
  'AGEGROUP_YEARS05-14',
  'AGEGROUP_YEARS15-24',
  'AGEGROUP_YEARS25-34',
  'AGEGROUP_YEARS35-44',
  'AGEGROUP_YEARS45-54',
  'AGEGROUP_YEARS55-64',
  'AGEGROUP_YEARS65PLUS',
]

const AGE_GROUP_LABELS: Record<AgeGroupKey, string> = {
  AGEGROUP_YEARSUNDER5: '<5',
  AGEGROUP_YEARSLESS15: '<15',
  'AGEGROUP_YEARS05-14': '5–14',
  'AGEGROUP_YEARS15-24': '15–24',
  'AGEGROUP_YEARS25-34': '25–34',
  'AGEGROUP_YEARS35-44': '35–44',
  'AGEGROUP_YEARS45-54': '45–54',
  'AGEGROUP_YEARS55-64': '55–64',
  AGEGROUP_YEARS65PLUS: '65+',
}

function isAgeGroupKey(key: string): key is AgeGroupKey {
  return AGE_GROUP_ORDER.includes(key as AgeGroupKey)
}

export function useAgeSexBreakdown(iso3: string, diseaseId: string): UseAgeSexBreakdownResult {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['who', 'agesex', iso3, diseaseId],
    queryFn: () => getDiseaseByCountryWithDims(iso3, 'TB_Notification_agesex_num'),
    staleTime: 6048e5,
    enabled: diseaseId === 'tuberculosis' && !!iso3,
  })

  return useMemo<UseAgeSexBreakdownResult>(() => {
    if (diseaseId !== 'tuberculosis') {
      return { data: null, isLoading: false, isError: false, hasData: false }
    }

    if (!data) {
      return { data: null, isLoading, isError, hasData: false }
    }

    // Find latest year in the data
    const latestYear = Math.max(...data.map((d) => d.TimeDim), 0)
    if (!latestYear) {
      return { data: null, isLoading: false, isError: false, hasData: false }
    }

    // Group by age group and sum by sex for the latest year
    const ageGroupMap = new Map<
      AgeGroupKey,
      {
        male: number
        female: number
      }
    >()

    for (const record of data) {
      if (record.TimeDim !== latestYear || !record.Dim2) {
        continue
      }

      const numericValue = record.NumericValue ?? 0
      const isMale = record.Dim1 === 'SEX_MLE'
      const isFemale = record.Dim1 === 'SEX_FMLE'

      if (!isMale && !isFemale) {
        continue
      }

      if (!isAgeGroupKey(record.Dim2)) {
        continue
      }

      const existing = ageGroupMap.get(record.Dim2) ?? { male: 0, female: 0 }

      if (isMale) {
        existing.male += numericValue
      } else if (isFemale) {
        existing.female += numericValue
      }

      ageGroupMap.set(record.Dim2, existing)
    }

    // Build result array and sort by age group order
    const result: AgeSexRow[] = Array.from(ageGroupMap.entries())
      .map(([ageGroupKey, { male, female }]) => ({
        ageGroup: AGE_GROUP_LABELS[ageGroupKey],
        male,
        female,
      }))
      .sort((a, b) => {
        // Map display labels back to keys for sorting
        const keyA = Object.entries(AGE_GROUP_LABELS).find(([, v]) => v === a.ageGroup)?.[0]
        const keyB = Object.entries(AGE_GROUP_LABELS).find(([, v]) => v === b.ageGroup)?.[0]

        if (!keyA || !isAgeGroupKey(keyA)) return 1
        if (!keyB || !isAgeGroupKey(keyB)) return -1

        const indexA = AGE_GROUP_ORDER.indexOf(keyA)
        const indexB = AGE_GROUP_ORDER.indexOf(keyB)

        return indexA - indexB
      })

    return {
      data: result,
      isLoading: false,
      isError: false,
      hasData: true,
      year: latestYear,
    }
  }, [data, isLoading, isError, diseaseId])
}

// ============================================================================
// useCFR Hook
// ============================================================================

export interface CfrRow {
  year: number
  cfr: number
}

interface UseCfrResult {
  data: CfrRow[] | null
  isLoading: boolean
  isError: boolean
  hasData: boolean
}

export function useCFR(iso3: string, diseaseId: string): UseCfrResult {
  const indicators = CFR_INDICATORS[diseaseId]

  const deathsQuery = useQuery({
    queryKey: ['who', 'cfr-deaths', iso3, diseaseId],
    queryFn: () => getDiseaseByCountry(iso3, indicators!.deathsIndicator),
    staleTime: 6048e5,
    enabled: indicators !== null && indicators !== undefined && !!iso3,
  })

  const incidenceQuery = useQuery({
    queryKey: ['who', 'cfr-incidence', iso3, diseaseId],
    queryFn: () => getDiseaseByCountry(iso3, indicators!.incidenceIndicator),
    staleTime: 6048e5,
    enabled: indicators !== null && indicators !== undefined && !!iso3,
  })

  return useMemo<UseCfrResult>(() => {
    if (!indicators) {
      return { data: null, isLoading: false, isError: false, hasData: false }
    }

    if (deathsQuery.isLoading || incidenceQuery.isLoading) {
      return { data: null, isLoading: true, isError: false, hasData: false }
    }

    if (deathsQuery.isError || incidenceQuery.isError) {
      return { data: null, isLoading: false, isError: true, hasData: false }
    }

    if (!deathsQuery.data || !incidenceQuery.data) {
      return { data: null, isLoading: false, isError: false, hasData: false }
    }

    // Create a map of year -> {deaths, incidence}
    const yearMap = new Map<
      number,
      {
        deaths: number | null
        incidence: number | null
      }
    >()

    for (const record of deathsQuery.data) {
      if (!yearMap.has(record.TimeDim)) {
        yearMap.set(record.TimeDim, { deaths: null, incidence: null })
      }
      const entry = yearMap.get(record.TimeDim)!
      entry.deaths = record.NumericValue
    }

    for (const record of incidenceQuery.data) {
      if (!yearMap.has(record.TimeDim)) {
        yearMap.set(record.TimeDim, { deaths: null, incidence: null })
      }
      const entry = yearMap.get(record.TimeDim)!
      entry.incidence = record.NumericValue
    }

    // Build result array, filtering out invalid years
    const result: CfrRow[] = []

    for (const [year, { deaths, incidence }] of yearMap.entries()) {
      if (deaths !== null && incidence !== null && incidence > 0) {
        const cfr = (deaths / incidence) * 100
        result.push({ year, cfr })
      }
    }

    // Sort by year ascending
    result.sort((a, b) => a.year - b.year)

    return {
      data: result,
      isLoading: false,
      isError: false,
      hasData: true,
    }
  }, [
    deathsQuery.data,
    incidenceQuery.data,
    deathsQuery.isLoading,
    incidenceQuery.isLoading,
    deathsQuery.isError,
    incidenceQuery.isError,
    indicators,
  ])
}
