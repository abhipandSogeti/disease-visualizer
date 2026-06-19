import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { FocusScope } from '@react-aria/focus'
import { buildSearchIndex, searchIndex } from '@/lib/search-index'
import { SearchResultRow } from './SearchResult'
import { useAppStore } from '@/stores/app.store'
import { DEFAULT_DISEASES } from '@/types/app.types'
import type { SearchResult } from '@/lib/search-index'

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { setCountry } = useAppStore()

  const index = useMemo(() => buildSearchIndex(), [])
  const results = useMemo(() => searchIndex(index, query), [index, query])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setFocused(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleSelect = useCallback(
    (result: SearchResult) => {
      // Route by type — only drugs have a dedicated page. Countries and diseases
      // drive the dashboard via the store, so navigate home and apply the selection.
      if (result.type === 'drug') {
        navigate(result.href)
      } else if (result.type === 'country') {
        setCountry(result.id)
        navigate('/')
      } else {
        const disease = DEFAULT_DISEASES.find((d) => d.id === result.id)
        if (disease) {
          const others = useAppStore.getState().activeDiseases.filter((d) => d.id !== disease.id)
          useAppStore.setState({ activeDiseases: [disease, ...others] })
        }
        navigate('/')
      }
      onClose()
    },
    [navigate, setCountry, onClose],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocused((f) => Math.min(f + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocused((f) => Math.max(f - 1, 0))
    } else if (e.key === 'Enter' && results[focused]) {
      handleSelect(results[focused])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <FocusScope contain restoreFocus autoFocus>
        <div
          className="w-full max-w-xl overflow-hidden rounded-xl border border-stone-300 bg-stone-100 shadow-2xl"
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center gap-3 border-b border-stone-300 px-4 py-3">
            <Search className="h-4 w-4 flex-shrink-0 text-gray-600" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setFocused(0)
              }}
              placeholder="Search countries, diseases, drugs..."
              aria-label="Search countries, diseases and drugs"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none"
            />
            <button
              onClick={onClose}
              aria-label="Close search"
              className="rounded p-1 text-gray-600 hover:text-gray-700"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {query && (
            <ul
              role="listbox"
              aria-label="Search results"
              className="max-h-80 overflow-y-auto py-1"
            >
              {results.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-gray-600">
                  No results for &ldquo;{query}&rdquo;
                </li>
              ) : (
                results.map((result, i) => (
                  <li key={result.id} role="option" aria-selected={i === focused}>
                    <SearchResultRow
                      result={result}
                      onSelect={handleSelect}
                      focused={i === focused}
                    />
                  </li>
                ))
              )}
            </ul>
          )}
          {!query && (
            <div className="px-4 py-4 text-xs text-gray-600">
              Type to search across 30+ countries, 8 diseases, and 12 drugs. Use arrow keys to
              navigate, Enter to select, Escape to close.
            </div>
          )}
        </div>
      </FocusScope>
    </div>
  )
}
