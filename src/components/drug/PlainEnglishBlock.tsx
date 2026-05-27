import { useState } from 'react'
import { BookOpen, ChevronUp, ChevronDown } from 'lucide-react'

interface PlainEnglishBlockProps {
  drugName: string
  text: string
}

export function PlainEnglishBlock({ drugName, text }: PlainEnglishBlockProps) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="rounded border border-blue-900/50 bg-blue-950/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-blue-300">
            What is {drugName} — in plain English
          </h2>
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={
            collapsed ? 'Expand plain English explanation' : 'Collapse plain English explanation'
          }
          className="rounded p-1 text-blue-500 hover:bg-blue-900/30 hover:text-blue-300"
        >
          {collapsed ? (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {!collapsed && <p className="mt-3 text-sm leading-relaxed text-slate-300">{text}</p>}
    </div>
  )
}
