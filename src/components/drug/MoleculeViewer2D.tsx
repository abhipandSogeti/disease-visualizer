import { useState } from 'react'
import { Download, Info } from 'lucide-react'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { get2DImageUrl } from '@/services/pubchem.service'

interface MoleculeViewer2DProps {
  cid: number | null
  drugName: string
}

export function MoleculeViewer2D({ cid, drugName }: MoleculeViewer2DProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  if (!cid) {
    return (
      <EmptyState
        message="2D structure not available."
        suggestion="PubChem does not have a 2D structure for this compound."
      />
    )
  }

  const imageUrl = get2DImageUrl(cid, 600)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
          2D Structure
        </span>
        <a
          href={imageUrl}
          download={`${drugName}-2d.png`}
          aria-label={`Download 2D structure of ${drugName}`}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-600 hover:bg-stone-200 hover:text-gray-700"
        >
          <Download className="h-3 w-3" aria-hidden="true" />
          Download
        </a>
      </div>
      <div className="relative flex items-center justify-center rounded border border-stone-300 bg-white p-2">
        {!loaded && !errored && (
          <div className="absolute inset-0 flex items-center justify-center rounded bg-stone-100">
            <LoadingSkeleton label="Loading 2D structure..." rows={2} />
          </div>
        )}
        {errored ? (
          <EmptyState
            message="Could not load 2D structure image."
            suggestion="PubChem may be temporarily unavailable."
          />
        ) : (
          <img
            src={imageUrl}
            alt={`2D chemical structure of ${drugName}`}
            className="h-64 w-64 object-contain"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        )}
      </div>
      <div className="flex items-start gap-1.5 rounded bg-stone-200/40 p-2">
        <Info className="mt-0.5 h-3 w-3 flex-shrink-0 text-gray-600" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-gray-600">
          This is a flat map of the molecule — like a floor plan of its chemical structure. Each
          letter represents an atom; lines represent the bonds holding atoms together.
        </p>
      </div>
    </div>
  )
}
