import { type RefObject } from 'react'
import { type GlobeMethods } from 'react-globe.gl'
import { RotateCcw } from 'lucide-react'

interface GlobeControlsProps {
  globeRef: RefObject<GlobeMethods | undefined>
}

export function GlobeControls({ globeRef }: GlobeControlsProps) {
  return (
    <div className="absolute right-4 top-4">
      <button
        onClick={() => globeRef.current?.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000)}
        aria-label="Reset globe view"
        className="rounded border border-stone-300 bg-navy-900/90 p-2 text-gray-500 backdrop-blur hover:text-gray-900"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
