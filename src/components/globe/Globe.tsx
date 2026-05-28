import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import GlobeGL, { type GlobeMethods } from 'react-globe.gl'
import { useAppStore } from '@/stores/app.store'
import { useGlobalDisease } from '@/hooks/useCountryDisease'
import { getBurdenColour } from '@/lib/colour-scale'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { GlobeLegend } from './GlobeLegend'
import { GlobeTooltip } from './GlobeTooltip'
import { GlobeControls } from './GlobeControls'

interface TooltipState {
  visible: boolean
  countryName: string
  value: number | null
  x: number
  y: number
}

export function Globe() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const { activeDiseases, selectedYear, setCountry } = useAppStore()
  const prefersReducedMotion = useReducedMotion()
  const [countries, setCountries] = useState<object[]>([])
  const [size, setSize] = useState({ width: 800, height: 600 })
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    countryName: '',
    value: null,
    x: 0,
    y: 0,
  })

  // Track container size so the canvas fills exactly the available space
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width: Math.floor(width), height: Math.floor(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    fetch('/geo/countries-110m.json')
      .then((r) => r.json())
      .then((d: { features: object[] }) => setCountries(d.features))
      .catch(console.error)
  }, [])

  const primaryDisease = activeDiseases[0]
  const { data: diseaseData } = useGlobalDisease(primaryDisease?.whoIndicator ?? '', selectedYear)

  const burdenMap = useMemo(() => {
    const map = new Map<string, number | null>()
    diseaseData?.forEach((r) => {
      if (r.SpatialDim) map.set(r.SpatialDim, r.NumericValue)
    })
    return map
  }, [diseaseData])

  const maxValue = useMemo(() => {
    const values = Array.from(burdenMap.values()).filter((v): v is number => v !== null)
    return Math.max(...values, 1)
  }, [burdenMap])

  const handleHover = useCallback(
    (d: object | null, _prev: object | null) => {
      if (!d) {
        setTooltip((t) => ({ ...t, visible: false }))
        return
      }
      const feature = d as { properties: { name: string; iso_a3: string } }
      setTooltip((t) => ({
        ...t,
        visible: true,
        countryName: feature.properties.name,
        value: burdenMap.get(feature.properties.iso_a3) ?? null,
      }))
    },
    [burdenMap],
  )

  const handleClick = useCallback(
    (d: object, _event: MouseEvent, _coords: { lat: number; lng: number; altitude: number }) => {
      const feature = d as { properties: { iso_a3: string } }
      setCountry(feature.properties.iso_a3)
    },
    [setCountry],
  )

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltip((t) => (t.visible ? { ...t, x: e.clientX, y: e.clientY } : t))
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-navy-950"
      onMouseMove={handleMouseMove}
    >
      <GlobeGL
        ref={globeRef}
        width={size.width}
        height={size.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        animateIn={!prefersReducedMotion}
        polygonsData={countries}
        polygonCapColor={(d: object) => {
          const f = d as { properties: { iso_a3: string } }
          return getBurdenColour(burdenMap.get(f.properties.iso_a3) ?? null, maxValue)
        }}
        polygonSideColor={() => 'rgba(0,0,0,0.1)'}
        polygonStrokeColor={() => 'rgba(148,163,184,0.3)'}
        polygonLabel={() => ''}
        onPolygonHover={handleHover}
        onPolygonClick={handleClick}
        polygonAltitude={0.006}
        atmosphereColor="rgba(59,130,246,0.3)"
        atmosphereAltitude={0.1}
      />
      {tooltip.visible && (
        <GlobeTooltip
          countryName={tooltip.countryName}
          value={tooltip.value}
          unit={primaryDisease?.name ?? 'Disease burden'}
          year={selectedYear}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}
      <GlobeLegend diseaseName={primaryDisease?.name ?? 'Disease burden'} unit="Cases" />
      <GlobeControls globeRef={globeRef} />
    </div>
  )
}
