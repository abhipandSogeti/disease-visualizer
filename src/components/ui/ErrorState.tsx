import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  message: string
  detail?: string
  onRetry?: () => void
}

export function ErrorState({ message, detail, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded border border-red-900/50 bg-red-950/20 p-4 text-center">
      <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-red-300">{message}</p>
        {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  )
}
