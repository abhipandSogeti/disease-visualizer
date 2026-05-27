import { useIsFetching } from '@tanstack/react-query'
import { RefreshCw, Database } from 'lucide-react'
import { useDataFreshness } from '@/hooks/useDataFreshness'

export function DataFreshnessBar() {
  const isFetching = useIsFetching()
  const freshness = useDataFreshness()
  const sources = ['WHO GHO', 'disease.sh', 'World Bank', 'OpenFDA', 'PubChem', 'RxNorm', 'ChEMBL']

  return (
    <footer className="flex h-8 items-center justify-between border-t border-slate-800 bg-slate-900 px-4">
      <div className="flex items-center gap-2">
        <Database className="h-3 w-3 text-slate-600" aria-hidden="true" />
        <span className="text-xs text-slate-600">Data: {sources.join(' · ')}</span>
      </div>
      <div className="flex items-center gap-1.5" aria-live="polite" aria-atomic="true">
        <RefreshCw
          className={['h-3 w-3 text-slate-600', isFetching > 0 ? 'animate-spin' : ''].join(' ')}
          aria-hidden="true"
        />
        <span className="text-xs text-slate-600">{freshness}</span>
        {isFetching > 0 && (
          <span className="text-xs text-blue-400">
            Fetching {isFetching} source{isFetching === 1 ? '' : 's'}...
          </span>
        )}
      </div>
    </footer>
  )
}
