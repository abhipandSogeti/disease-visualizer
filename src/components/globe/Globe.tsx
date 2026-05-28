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

interface GeoFeature {
  properties: { iso_a3: string; name: string }
  geometry: { type: string; coordinates: unknown }
}

/** Approximate centroid of a GeoJSON polygon/multipolygon */
function featureCentroid(feature: GeoFeature): { lat: number; lng: number } | null {
  const { type, coordinates } = feature.geometry
  let ring: number[][] | null = null
  if (type === 'Polygon') ring = (coordinates as number[][][])[0]
  else if (type === 'MultiPolygon') {
    // pick the largest ring by point count
    const polys = coordinates as number[][][][]
    ring = polys.reduce(
      (best, poly) => (poly[0].length > (best?.length ?? 0) ? poly[0] : best),
      null as number[][] | null,
    )
  }
  if (!ring || ring.length === 0) return null
  const lng = ring.reduce((s, c) => s + c[0], 0) / ring.length
  const lat = ring.reduce((s, c) => s + c[1], 0) / ring.length
  return { lat, lng }
}

export function Globe() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoRotateTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const {
    activeDiseases,
    selectedYear,
    setCountry,
    setCompareCountry,
    compareCountry,
    selectedCountry,
  } = useAppStore()
  const prefersReducedMotion = useReducedMotion()
  const [countries, setCountries] = useState<GeoFeature[]>([])
  const [size, setSize] = useState({ width: 800, height: 600 })
  const [hoveredIso3, setHoveredIso3] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    countryName: '',
    value: null,
    x: 0,
    y: 0,
  })

  // Container resize tracking
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

  // Load GeoJSON
  useEffect(() => {
    fetch('/geo/countries-110m.json')
      .then((r) => r.json())
      .then((d: { features: GeoFeature[] }) => setCountries(d.features))
      .catch(console.error)
  }, [])

  type OrbitControls = { autoRotate: boolean; autoRotateSpeed: number }
  const orbitControls = () => globeRef.current?.controls() as OrbitControls | undefined

  // Auto-rotation — start once globe is ready, pause on hover, resume 3s after
  useEffect(() => {
    if (prefersReducedMotion) return
    const c = orbitControls()
    if (!c) return
    c.autoRotate = true
    c.autoRotateSpeed = 0.4
  })

  const pauseAutoRotate = useCallback(() => {
    if (prefersReducedMotion) return
    if (autoRotateTimer.current) clearTimeout(autoRotateTimer.current)
    const c = orbitControls()
    if (c) c.autoRotate = false
  }, [prefersReducedMotion])

  const scheduleAutoRotate = useCallback(() => {
    if (prefersReducedMotion) return
    if (autoRotateTimer.current) clearTimeout(autoRotateTimer.current)
    autoRotateTimer.current = setTimeout(() => {
      const c = orbitControls()
      if (c) c.autoRotate = true
    }, 3000)
  }, [prefersReducedMotion])

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

  // Centroid lookup from loaded features
  const centroidMap = useMemo(() => {
    const map = new Map<string, { lat: number; lng: number }>()
    countries.forEach((f) => {
      const c = featureCentroid(f)
      if (c) map.set(f.properties.iso_a3, c)
    })
    return map
  }, [countries])

  // Arc data: animated arc between primary (selected) and compare country
  const arcsData = useMemo(() => {
    if (!selectedCountry || !compareCountry) return []
    const s = centroidMap.get(selectedCountry)
    const e = centroidMap.get(compareCountry)
    if (!s || !e) return []
    return [{ startLat: s.lat, startLng: s.lng, endLat: e.lat, endLng: e.lng }]
  }, [selectedCountry, compareCountry, centroidMap])

  // Rings: top-5 highest-burden countries get pulsing rings
  const ringsData = useMemo(() => {
    if (burdenMap.size === 0) return []
    return Array.from(burdenMap.entries())
      .filter(([, v]) => v !== null && v > 0)
      .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
      .slice(0, 5)
      .flatMap(([iso3]) => {
        const c = centroidMap.get(iso3)
        return c ? [{ lat: c.lat, lng: c.lng, iso3 }] : []
      })
  }, [burdenMap, centroidMap])

  // Labels: top-8 burden countries get floating name labels
  const labelsData = useMemo(() => {
    if (burdenMap.size === 0) return []
    return Array.from(burdenMap.entries())
      .filter(([, v]) => v !== null && v > 0)
      .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
      .slice(0, 8)
      .flatMap(([iso3]) => {
        const c = centroidMap.get(iso3)
        const feature = countries.find((f) => f.properties.iso_a3 === iso3)
        if (!c || !feature) return []
        return [{ lat: c.lat, lng: c.lng, name: feature.properties.name }]
      })
  }, [burdenMap, centroidMap, countries])

  const handleHover = useCallback(
    (d: object | null) => {
      if (!d) {
        setHoveredIso3(null)
        setTooltip((t) => ({ ...t, visible: false }))
        scheduleAutoRotate()
        return
      }
      const feature = d as GeoFeature
      setHoveredIso3(feature.properties.iso_a3)
      setTooltip((t) => ({
        ...t,
        visible: true,
        countryName: feature.properties.name,
        value: burdenMap.get(feature.properties.iso_a3) ?? null,
      }))
      pauseAutoRotate()
    },
    [burdenMap, pauseAutoRotate, scheduleAutoRotate],
  )

  const handleClick = useCallback(
    (d: object, _event: MouseEvent, coords: { lat: number; lng: number; altitude: number }) => {
      const feature = d as GeoFeature
      setCountry(feature.properties.iso_a3)
      globeRef.current?.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 1.5 }, 800)
      pauseAutoRotate()
    },
    [setCountry, pauseAutoRotate],
  )

  const handleRightClick = useCallback(
    (d: object) => {
      const feature = d as GeoFeature
      setCompareCountry(feature.properties.iso_a3)
    },
    [setCompareCountry],
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
        // Polygons
        polygonsData={countries}
        polygonCapColor={(d: object) => {
          const f = d as GeoFeature
          return getBurdenColour(burdenMap.get(f.properties.iso_a3) ?? null, maxValue)
        }}
        polygonSideColor={() => 'rgba(30,30,30,0.6)'}
        polygonStrokeColor={() => '#222222'}
        polygonLabel={() => ''}
        onPolygonHover={handleHover}
        onPolygonClick={handleClick}
        onPolygonRightClick={handleRightClick}
        polygonAltitude={(d: object) => {
          const f = d as GeoFeature
          return f.properties.iso_a3 === hoveredIso3 ? 0.06 : 0.01
        }}
        polygonsTransitionDuration={200}
        atmosphereColor="rgba(59,130,246,0.3)"
        atmosphereAltitude={0.1}
        // Arcs — compare country connection
        arcsData={arcsData}
        arcColor={() => ['rgba(255,255,255,0.1)', 'rgba(255,200,50,0.9)', 'rgba(255,255,255,0.1)']}
        arcDashLength={0.4}
        arcDashGap={0.15}
        arcDashAnimateTime={2000}
        arcStroke={0.8}
        arcAltitude={0.3}
        // Rings — top-burden hotspots
        ringsData={ringsData}
        ringColor={() => (t: number) => `rgba(239,68,68,${1 - t})`}
        ringMaxRadius={3}
        ringPropagationSpeed={1.5}
        ringRepeatPeriod={1200}
        // Labels — top-burden country names
        labelsData={labelsData}
        labelText={(d: object) => (d as { name: string }).name}
        labelSize={0.45}
        labelColor={() => 'rgba(255,255,255,0.85)'}
        labelDotRadius={0.3}
        labelAltitude={0.015}
        labelResolution={3}
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
