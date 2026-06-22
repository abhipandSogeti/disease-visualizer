import { AlertTriangle } from 'lucide-react'

export function SafetyBanner() {
  return (
    <div
      role="note"
      className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <p>
        <span className="font-semibold">Experimental — not medical advice.</span> Risk is estimated
        from weather only. Guidance is relayed from public-health authorities. In an emergency, seek
        a health facility.
      </p>
    </div>
  )
}
