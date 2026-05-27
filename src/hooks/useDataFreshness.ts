import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

export function formatFreshness(timestamp: number): string {
  if (!timestamp) return 'No data loaded yet'
  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  if (diffMinutes < 1) return 'Updated just now'
  if (diffMinutes < 60) return `Updated ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  return `Updated ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
}

export function useDataFreshness(): string {
  const queryClient = useQueryClient()
  const latestUpdate = useMemo(() => {
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()
    if (queries.length === 0) return 0
    return Math.max(...queries.map((q) => q.state.dataUpdatedAt))
  }, [queryClient])
  return formatFreshness(latestUpdate)
}
