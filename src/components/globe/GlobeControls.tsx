import { type RefObject } from 'react'
import { type GlobeMethods } from 'react-globe.gl'
import { RotateCcw, Map } from 'lucide-react'

interface GlobeControlsProps {
  globeRef: RefObject<GlobeMethods | undefined>
}

export function GlobeControls({ globeRef }: GlobeControlsProps) {
  return (
    <div className="absolute right-4 top-4 flex flex-col gap-2">
      <button
        onClick={() => globeRef.current?.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000)}
        aria-label="Reset globe view"
        className="rounded border border-slate-700 bg-navy-900/90 p-2 text-slate-400 backdrop-blur hover:text-slate-100"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        aria-label="Switch to 2D map view"
        className="rounded border border-slate-700 bg-navy-900/90 p-2 text-slate-400 backdrop-blur hover:text-slate-100"
      >
        <Map className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
