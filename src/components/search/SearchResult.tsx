import { Globe, Activity, Pill } from 'lucide-react'
import type { SearchResult } from '@/lib/search-index'

const TYPE_ICON = { country: Globe, disease: Activity, drug: Pill } as const
const TYPE_LABEL = { country: 'Country', disease: 'Disease', drug: 'Drug' } as const

interface SearchResultProps {
  result: SearchResult
  onSelect: (result: SearchResult) => void
  focused: boolean
}

export function SearchResultRow({ result, onSelect, focused }: SearchResultProps) {
  const Icon = TYPE_ICON[result.type]
  return (
    <button
      onClick={() => onSelect(result)}
      className={[
        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
        focused ? 'bg-blue-50' : 'hover:bg-stone-200',
      ].join(' ')}
      aria-label={`${result.label} — ${result.description}`}
    >
      <Icon className="h-4 w-4 flex-shrink-0 text-gray-600" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-gray-800">{result.label}</p>
        <p className="truncate text-xs text-gray-600">{result.description}</p>
      </div>
      <span className="flex-shrink-0 rounded bg-stone-200 px-1.5 py-0.5 text-xs text-gray-600">
        {TYPE_LABEL[result.type]}
      </span>
    </button>
  )
}
