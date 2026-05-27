import { Info } from 'lucide-react'

interface EmptyStateProps {
  message: string
  suggestion?: string
}

export function EmptyState({ message, suggestion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded border border-slate-800 bg-slate-900/50 p-4 text-center">
      <Info className="h-5 w-5 text-slate-500" aria-hidden="true" />
      <p className="text-sm text-slate-400">{message}</p>
      {suggestion && <p className="text-xs text-slate-600">{suggestion}</p>}
    </div>
  )
}
