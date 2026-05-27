import { Database, RefreshCw } from 'lucide-react'

export function BottomBar() {
  const sources = ['WHO GHO', 'disease.sh', 'World Bank', 'OpenFDA', 'PubChem', 'RxNorm', 'ChEMBL']
  return (
    <footer className="flex h-8 items-center justify-between border-t border-slate-800 bg-navy-900 px-4">
      <div className="flex items-center gap-2">
        <Database className="h-3 w-3 text-slate-600" aria-hidden="true" />
        <span className="text-xs text-slate-600">Data: {sources.join(' · ')}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <RefreshCw className="h-3 w-3 text-slate-600" aria-hidden="true" />
        <span className="text-xs text-slate-600">All data sources free and keyless</span>
      </div>
    </footer>
  )
}
