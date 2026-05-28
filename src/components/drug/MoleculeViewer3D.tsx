import { useEffect, useRef, useState } from 'react'
import { RotateCcw, Download, Info } from 'lucide-react'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { get3DStructureUrl } from '@/services/pubchem.service'

interface ThreeDMolViewer {
  clear(): void
  spin(axis: string, speed: number): void
  render(): void
  setStyle(sel: object, style: object): void
  addModel(data: string, fmt: string): void
  zoomTo(): void
}

interface MoleculeViewer3DProps {
  cid: number | null
  drugName: string
}

type ViewStyle = 'stick' | 'sphere' | 'line'

export function MoleculeViewer3D({ cid, drugName }: MoleculeViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<ThreeDMolViewer | null>(null)
  const [loading, setLoading] = useState(true)
  const [errored, setErrored] = useState(false)
  const [viewStyle, setViewStyle] = useState<ViewStyle>('stick')
  const [spinning, setSpinning] = useState(true)

  const styleMap: Record<ViewStyle, object> = {
    stick: { stick: {} },
    sphere: { sphere: { radius: 0.5 } },
    line: { line: {} },
  }

  useEffect(() => {
    if (!cid || !containerRef.current) return
    let cancelled = false

    async function loadViewer() {
      try {
        const $3Dmol = (await import('3dmol')) as {
          createViewer: (el: HTMLElement, opts: object) => ThreeDMolViewer
        }
        if (cancelled || !containerRef.current) return
        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: '#020817',
          antialias: true,
        })
        viewerRef.current = viewer
        const sdfUrl = get3DStructureUrl(cid!)
        const res = await fetch(sdfUrl)
        if (!res.ok) throw new Error(`PubChem 3D fetch failed: ${res.status}`)
        const sdfData = await res.text()
        if (cancelled) return
        viewer.addModel(sdfData, 'sdf')
        viewer.setStyle({}, styleMap[viewStyle])
        viewer.zoomTo()
        if (spinning) viewer.spin('y', 1)
        viewer.render()
        setLoading(false)
      } catch {
        if (!cancelled) setErrored(true)
      }
    }

    void loadViewer()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid])

  useEffect(() => {
    if (!viewerRef.current) return
    viewerRef.current.setStyle({}, styleMap[viewStyle])
    viewerRef.current.render()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewStyle])

  useEffect(() => {
    if (!viewerRef.current) return
    viewerRef.current.spin('y', spinning ? 1 : 0)
  }, [spinning])

  if (!cid) {
    return (
      <EmptyState
        message="3D structure not available."
        suggestion="PubChem does not have a 3D conformer for this compound."
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
          3D Molecule
        </span>
        <div className="flex items-center gap-1">
          {(['stick', 'sphere', 'line'] as ViewStyle[]).map((s) => (
            <button
              key={s}
              onClick={() => setViewStyle(s)}
              aria-pressed={viewStyle === s}
              className={[
                'rounded px-2 py-0.5 text-xs transition-colors',
                viewStyle === s
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-stone-200 hover:text-gray-700',
              ].join(' ')}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button
            onClick={() => setSpinning((s) => !s)}
            aria-pressed={spinning}
            aria-label={spinning ? 'Stop rotation' : 'Start rotation'}
            className="ml-1 rounded p-1 text-gray-600 hover:bg-stone-200 hover:text-gray-700"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <a
            href={get3DStructureUrl(cid)}
            download={`${drugName}-3d.sdf`}
            aria-label={`Download 3D structure of ${drugName}`}
            className="rounded p-1 text-gray-600 hover:bg-stone-200 hover:text-gray-700"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="relative h-80 w-full overflow-hidden rounded border border-stone-300 bg-slate-950">
        {loading && !errored && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSkeleton label="Loading 3D molecule..." rows={1} />
          </div>
        )}
        {errored ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              message="Could not load 3D molecule."
              suggestion="PubChem 3D conformer may not be available for this compound."
            />
          </div>
        ) : (
          <div
            ref={containerRef}
            className="h-full w-full"
            aria-label={`3D molecular model of ${drugName}`}
          />
        )}
      </div>
      <div className="flex items-start gap-1.5 rounded bg-stone-200/40 p-2">
        <Info className="mt-0.5 h-3 w-3 flex-shrink-0 text-gray-600" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-gray-600">
          Each sphere is an atom. Sticks connecting them are chemical bonds — the forces holding the
          molecule together. Colours follow the CPK standard: grey = carbon, red = oxygen, blue =
          nitrogen, white = hydrogen.
        </p>
      </div>
    </div>
  )
}
