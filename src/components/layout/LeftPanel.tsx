import { Plus, X, Circle } from 'lucide-react'
import { useAppStore } from '@/stores/app.store'
import { DISEASE_COLOURS } from '@/lib/colour-scale'

export function LeftPanel() {
  const { activeDiseases, removeDisease } = useAppStore()
  return (
    <aside
      className="flex w-52 flex-col gap-4 overflow-y-auto border-r border-slate-800 bg-navy-900 p-3"
      aria-label="Active diseases"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Active Diseases
        </span>
        <button
          aria-label="Add disease"
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
      <ul className="flex flex-col gap-1" role="list">
        {activeDiseases.map((disease) => (
          <li
            key={disease.id}
            className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-slate-800"
          >
            <div className="flex items-center gap-2">
              <Circle
                className="h-2.5 w-2.5 flex-shrink-0"
                style={{ color: DISEASE_COLOURS[disease.category] }}
                aria-hidden="true"
              />
              <span className="text-xs text-slate-300">{disease.name}</span>
            </div>
            <button
              onClick={() => removeDisease(disease.id)}
              aria-label={`Remove ${disease.name}`}
              className="rounded p-0.5 text-slate-600 hover:text-slate-300"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      {activeDiseases.length === 0 && (
        <p className="text-xs text-slate-500">
          No diseases selected. Use the + button to add diseases to the map.
        </p>
      )}
    </aside>
  )
}
