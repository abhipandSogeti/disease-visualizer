import { Info } from 'lucide-react'

interface EmptyStateProps {
  message: string
  suggestion?: string
}

export function EmptyState({ message, suggestion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded border border-stone-300 bg-stone-100/50 p-4 text-center">
      <Info className="h-5 w-5 text-gray-600" aria-hidden="true" />
      <p className="text-sm text-gray-600">{message}</p>
      {suggestion && <p className="text-xs text-gray-600">{suggestion}</p>}
    </div>
  )
}
