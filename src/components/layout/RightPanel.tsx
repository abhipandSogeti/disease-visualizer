import { X } from 'lucide-react'
import { useAppStore } from '@/stores/app.store'
import type { ReactNode } from 'react'

interface RightPanelProps {
  title: string
  subtitle?: string
  children: ReactNode
  accentColor?: string
}

export function RightPanel({ title, subtitle, children, accentColor }: RightPanelProps) {
  const { setCountry } = useAppStore()
  return (
    <div className="flex h-full flex-col">
      {accentColor && (
        <div className="h-1 w-full flex-shrink-0" style={{ background: accentColor }} />
      )}
      <div className="flex items-start justify-between border-b border-black/[0.08] px-4 py-3.5">
        <div>
          <h2 className="text-base font-bold tracking-tight text-gray-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <button
          onClick={() => setCountry(null)}
          aria-label="Close panel"
          className="ml-2 mt-0.5 rounded-full p-1.5 text-gray-400 hover:bg-black/[0.05] hover:text-gray-700"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  )
}
