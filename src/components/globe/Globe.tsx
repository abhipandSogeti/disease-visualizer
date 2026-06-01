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

type OrbitControls = { autoRotate: boolean; autoRotateSpeed: number }

type RingDatum = {
  lat: number
  lng: number
  iso3: string
  kind: 'burden' | 'compare'
  rank: number
}
type ArcDatum = { startLat: number; startLng: number; endLat: number; endLng: number }
type LabelDatum = { lat: number; lng: number; name: string }

function featureCentroid(feature: GeoFeature): { lat: number; lng: number } | null {
  const { type, coordinates } = feature.geometry
  let ring: number[][] | null = null
  if (type === 'Polygon') ring = (coordinates as number[][][])[0]
  else if (type === 'MultiPolygon') {
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

// Inject beacon CSS once per page load
let beaconStyleInjected = false
function ensureBeaconStyle() {
  if (beaconStyleInjected) return
  beaconStyleInjected = true
  const s = document.createElement('style')
  s.textContent = `
    @keyframes globe-blink {
      0%,100%{opacity:1;transform:scale(1)}
      50%{opacity:0.25;transform:scale(0.7)}
    }
    @keyframes globe-ring-pulse {
      0%{opacity:0.8;transform:scale(1)}
      100%{opacity:0;transform:scale(2.6)}
    }
    .globe-beacon-dot{
      width:7px;height:7px;border-radius:50%;background:#fff;
      box-shadow:0 0 6px rgba(255,255,255,0.9);
      animation:globe-blink 1.1s ease-in-out infinite;
    }
    .globe-beacon-ring{
      position:absolute;width:7px;height:7px;border-radius:50%;
      border:1.5px solid rgba(255,255,255,0.7);
      animation:globe-ring-pulse 1.1s ease-out infinite;
    }
  `
  document.head.appendChild(s)
}

export function Globe() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLockedRef = useRef(false)
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null)
  // Ref so click handlers always read latest hovered country without stale closures
  const hoveredIso3Ref = useRef<string | null>(null)

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

  const orbitControls = useCallback(
    () => globeRef.current?.controls() as OrbitControls | undefined,
    [],
  )

  // ── Rotation helpers ──────────────────────────────────────────────────────
  const stopRotation = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    const c = orbitControls()
    if (c) c.autoRotate = false
  }, [orbitControls])

  const startRotation = useCallback(() => {
    if (prefersReducedMotion || isLockedRef.current) return
    const c = orbitControls()
    if (c) {
      c.autoRotate = true
      c.autoRotateSpeed = 0.4
    }
  }, [prefersReducedMotion, orbitControls])

  const scheduleResume = useCallback(
    (delayMs = 3000) => {
      if (prefersReducedMotion || isLockedRef.current) return
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
      resumeTimer.current = setTimeout(startRotation, delayMs)
    },
    [prefersReducedMotion, startRotation],
  )

  // Initial auto-rotate — poll until controls are available
  useEffect(() => {
    if (prefersReducedMotion) return
    let raf: number
    const tryStart = () => {
      const c = orbitControls()
      if (!c) {
        raf = requestAnimationFrame(tryStart)
        return
      }
      if (!isLockedRef.current) {
        c.autoRotate = true
        c.autoRotateSpeed = 0.4
      }
    }
    raf = requestAnimationFrame(tryStart)
    return () => cancelAnimationFrame(raf)
  }, [prefersReducedMotion, orbitControls])

  // Permanent lock tied to selectedCountry
  useEffect(() => {
    if (selectedCountry) {
      isLockedRef.current = true
      stopRotation()
    } else {
      isLockedRef.current = false
      scheduleResume(1500)
    }
  }, [selectedCountry, stopRotation, scheduleResume])

  // ── Container resize ──────────────────────────────────────────────────────
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

  // ── GeoJSON ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/geo/countries-110m.json')
      .then((r) => r.json())
      .then((d: { features: GeoFeature[] }) => setCountries(d.features))
      .catch(console.error)
  }, [])

  // ── Disease data ──────────────────────────────────────────────────────────
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
    const vals = Array.from(burdenMap.values()).filter((v): v is number => v !== null)
    return Math.max(...vals, 1)
  }, [burdenMap])

  const centroidMap = useMemo(() => {
    const map = new Map<string, { lat: number; lng: number }>()
    countries.forEach((f) => {
      const c = featureCentroid(f)
      if (c) map.set(f.properties.iso_a3, c)
    })
    return map
  }, [countries])

  const nameMap = useMemo(() => {
    const map = new Map<string, string>()
    countries.forEach((f) => map.set(f.properties.iso_a3, f.properties.name))
    return map
  }, [countries])

  // ── Arc: compare connection ───────────────────────────────────────────────
  const arcsData = useMemo((): ArcDatum[] => {
    if (!selectedCountry || !compareCountry) return []
    const s = centroidMap.get(selectedCountry)
    const e = centroidMap.get(compareCountry)
    if (!s || !e) return []
    return [{ startLat: s.lat, startLng: s.lng, endLat: e.lat, endLng: e.lng }]
  }, [selectedCountry, compareCountry, centroidMap])

  // ── Points: glowing markers at selected + compare ─────────────────────────

  // ── Rings: top-burden (red) + compare endpoints (cyan) ───────────────────
  const ringsData = useMemo((): RingDatum[] => {
    const burden: RingDatum[] =
      burdenMap.size > 0
        ? Array.from(burdenMap.entries())
            .filter(([, v]) => v !== null && v > 0)
            .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
            // Take more candidates so we always get 5 after centroid filtering
            .slice(0, 15)
            .reduce<RingDatum[]>((acc, [iso3]) => {
              if (acc.length >= 5) return acc
              const c = centroidMap.get(iso3)
              if (!c) return acc
              acc.push({ lat: c.lat, lng: c.lng, iso3, kind: 'burden', rank: acc.length })
              return acc
            }, [])
        : []

    const compare: RingDatum[] = []
    const addCompare = (iso3: string) => {
      const c = centroidMap.get(iso3)
      if (c) compare.push({ lat: c.lat, lng: c.lng, iso3, kind: 'compare' as const, rank: 0 })
    }
    if (selectedCountry) addCompare(selectedCountry)
    if (compareCountry) addCompare(compareCountry)

    return [...burden, ...compare]
  }, [burdenMap, centroidMap, selectedCountry, compareCountry])

  // ── Labels: top-burden country names ─────────────────────────────────────
  const labelsData = useMemo((): LabelDatum[] => {
    if (burdenMap.size === 0) return []
    return Array.from(burdenMap.entries())
      .filter(([, v]) => v !== null && v > 0)
      .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
      .slice(0, 20)
      .reduce<LabelDatum[]>((acc, [iso3]) => {
        if (acc.length >= 8) return acc
        const c = centroidMap.get(iso3)
        const name = nameMap.get(iso3)
        if (!c || !name) return acc
        acc.push({ lat: c.lat, lng: c.lng, name })
        return acc
      }, [])
  }, [burdenMap, centroidMap, nameMap])

  // ── Event handlers ────────────────────────────────────────────────────────
  const handleHover = useCallback(
    (d: object | null) => {
      if (!d) {
        hoveredIso3Ref.current = null
        setHoveredIso3(null)
        setTooltip((t) => ({ ...t, visible: false }))
        scheduleResume()
        return
      }
      const f = d as GeoFeature
      hoveredIso3Ref.current = f.properties.iso_a3
      setHoveredIso3(f.properties.iso_a3)
      setTooltip((t) => ({
        ...t,
        visible: true,
        countryName: f.properties.name,
        value: burdenMap.get(f.properties.iso_a3) ?? null,
      }))
      stopRotation()
    },
    [burdenMap, stopRotation, scheduleResume],
  )

  // react-globe.gl's internal clickAfterDrag defaults to false and treats ANY mouse
  // movement while pressed as a drag — making onPolygonClick unreliable on a rotating
  // sphere. We implement click detection ourselves using pointer delta on the container.
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerDownRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const down = pointerDownRef.current
      pointerDownRef.current = null
      if (!down) return
      const dx = e.clientX - down.x
      const dy = e.clientY - down.y
      if (dx * dx + dy * dy > 25) return // >5px movement = drag, not a click
      const iso = hoveredIso3Ref.current
      if (!iso) return
      if (e.button === 0) {
        setCountry(iso)
        const c = centroidMap.get(iso)
        if (c) globeRef.current?.pointOfView({ lat: c.lat, lng: c.lng, altitude: 1.5 }, 800)
      } else if (e.button === 2) {
        setCompareCountry(iso)
      }
    },
    [setCountry, setCompareCountry, centroidMap],
  )

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltip((t) => (t.visible ? { ...t, x: e.clientX, y: e.clientY } : t))
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-navy-950"
      onMouseMove={handleMouseMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
    >
      <GlobeGL
        ref={globeRef}
        width={size.width}
        height={size.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        animateIn={!prefersReducedMotion}
        // ── Polygons ────────────────────────────────────────────────────────
        polygonsData={countries}
        polygonCapColor={(d: object) => {
          const f = d as GeoFeature
          const iso = f.properties.iso_a3
          const base = getBurdenColour(burdenMap.get(iso) ?? null, maxValue)
          // Boost opacity on hover so the cap looks solid and vibrant
          if (iso === hoveredIso3) return base.replace(',0.72)', ',0.98)')
          return base
        }}
        polygonSideColor={(d: object) => {
          const f = d as GeoFeature
          const val = burdenMap.get(f.properties.iso_a3)
          // No-data countries are transparent — hide their sides too
          if (val === undefined || val === null) return 'rgba(0,0,0,0)'
          // Earthy terrain cross-section: sandstone/rock tone
          return 'rgba(140,110,75,0.92)'
        }}
        polygonStrokeColor={(d: object) => {
          const f = d as GeoFeature
          const iso = f.properties.iso_a3
          if (iso === hoveredIso3) return 'rgba(255,255,255,0.9)'
          return 'rgba(60,45,25,0.35)'
        }}
        polygonLabel={() => ''}
        onPolygonHover={handleHover}
        polygonAltitude={(d: object) => {
          const f = d as GeoFeature
          const iso = f.properties.iso_a3
          if (iso === hoveredIso3) return 0.04
          if (iso === selectedCountry || iso === compareCountry) return 0.02
          return 0.005
        }}
        polygonsTransitionDuration={250}
        atmosphereColor="rgba(100,160,255,0.8)"
        atmosphereAltitude={0.22}
        // ── Arc — vivid cyan flow between compared countries ─────────────
        arcsData={arcsData}
        arcColor={() => '#00e5ff'}
        arcStroke={2}
        arcDashLength={0.5}
        arcDashGap={0.2}
        arcDashAnimateTime={1200}
        arcAltitude={0.35}
        arcsTransitionDuration={400}
        // ── Rings — red for burden hotspots, cyan for compare endpoints ──
        ringsData={ringsData}
        ringLat={(d: object) => (d as RingDatum).lat}
        ringLng={(d: object) => (d as RingDatum).lng}
        ringColor={(d: object) => {
          const r = d as RingDatum
          if (r.kind === 'compare') return (t: number) => `rgba(0,229,255,${(1 - t) * 0.9})`
          // Severity gradient: rank 0 = bright red, rank 4 = amber
          const hue = 0 + r.rank * 16 // 0°→64° (red→amber)
          return (t: number) => `hsla(${hue},100%,55%,${(1 - t) * 0.95})`
        }}
        ringMaxRadius={(d: object) => {
          const r = d as RingDatum
          if (r.kind === 'compare') return 3
          return 4 - r.rank * 0.3 // rank 0→4, rank 4→2.8
        }}
        ringPropagationSpeed={(d: object) => {
          const r = d as RingDatum
          if (r.kind === 'compare') return 2.5
          return 3.5 - r.rank * 0.4 // rank 0→3.5, rank 4→1.9
        }}
        ringRepeatPeriod={(d: object) => {
          const r = d as RingDatum
          if (r.kind === 'compare') return 800
          return 700 + r.rank * 150 // rank 0→700ms, rank 4→1300ms
        }}
        ringAltitude={0.012}
        // ── HTML badges — rank numbers float above WebGL at all times ────
        htmlElementsData={ringsData.filter((r) => r.kind === 'burden')}
        htmlLat={(d: object) => (d as RingDatum).lat}
        htmlLng={(d: object) => (d as RingDatum).lng}
        htmlAltitude={0.12}
        htmlElement={(d: object) => {
          ensureBeaconStyle()
          const r = d as RingDatum
          const el = document.createElement('div')
          el.style.cssText =
            'display:flex;flex-direction:column;align-items:center;pointer-events:none;user-select:none'
          el.innerHTML = `
            <div style="background:rgba(10,10,10,0.82);color:#fff;font-family:system-ui,sans-serif;font-size:11px;font-weight:800;padding:2px 8px;border-radius:20px;border:1px solid rgba(255,255,255,0.25);box-shadow:0 2px 12px rgba(0,0,0,0.5);letter-spacing:0.5px;backdrop-filter:blur(4px);white-space:nowrap">
              ${r.rank + 1}
            </div>
            <div style="width:1px;height:18px;background:linear-gradient(to bottom,rgba(255,255,255,0.6),rgba(255,255,255,0.1));margin:1px 0"></div>
            <div style="position:relative;display:flex;align-items:center;justify-content:center;width:14px;height:14px">
              <div class="globe-beacon-ring"></div>
              <div class="globe-beacon-dot"></div>
            </div>
          `
          return el
        }}
        // ── Labels — floating country names on top-burden ────────────────
        labelsData={labelsData}
        labelText={(d: object) => (d as LabelDatum).name}
        labelLat={(d: object) => (d as LabelDatum).lat}
        labelLng={(d: object) => (d as LabelDatum).lng}
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
