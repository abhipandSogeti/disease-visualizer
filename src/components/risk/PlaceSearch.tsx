import { useState } from 'react'
import { Search } from 'lucide-react'

export function PlaceSearch({ onSearch }: { onSearch: (query: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (value.trim()) onSearch(value.trim())
      }}
      className="flex items-center gap-2"
    >
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2">
        <Search className="h-4 w-4 flex-shrink-0 text-gray-500" aria-hidden="true" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search a city or place…"
          aria-label="Search a city or place"
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Check
      </button>
    </form>
  )
}
