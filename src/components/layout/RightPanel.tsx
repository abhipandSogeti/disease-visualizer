import { X } from 'lucide-react'
import { useAppStore } from '@/stores/app.store'
import type { ReactNode } from 'react'

interface RightPanelProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function RightPanel({ title, subtitle, children }: RightPanelProps) {
  const { setCountry } = useAppStore()
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b border-slate-800 p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <button
          onClick={() => setCountry(null)}
          aria-label="Close panel"
          className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-100"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  )
}
