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
type PointDatum = { lat: number; lng: number; iso3: string }
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

export function Globe() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Permanent lock: true while a country is selected — hover alone cannot resume rotation
  const isLockedRef = useRef(false)

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

  // ── Arc: compare connection ───────────────────────────────────────────────
  const arcsData = useMemo((): ArcDatum[] => {
    if (!selectedCountry || !compareCountry) return []
    const s = centroidMap.get(selectedCountry)
    const e = centroidMap.get(compareCountry)
    if (!s || !e) return []
    return [{ startLat: s.lat, startLng: s.lng, endLat: e.lat, endLng: e.lng }]
  }, [selectedCountry, compareCountry, centroidMap])

  // ── Points: glowing markers at selected + compare ─────────────────────────
  const comparePointsData = useMemo((): PointDatum[] => {
    const pts: PointDatum[] = []
    const add = (iso3: string) => {
      const c = centroidMap.get(iso3)
      if (c) pts.push({ ...c, iso3 })
    }
    if (selectedCountry) add(selectedCountry)
    if (compareCountry) add(compareCountry)
    return pts
  }, [selectedCountry, compareCountry, centroidMap])

  // ── Rings: top-burden (red) + compare endpoints (cyan) ───────────────────
  const ringsData = useMemo((): RingDatum[] => {
    const burden: RingDatum[] =
      burdenMap.size > 0
        ? Array.from(burdenMap.entries())
            .filter(([, v]) => v !== null && v > 0)
            .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
            .slice(0, 5)
            .flatMap(([iso3], rank) => {
              const c = centroidMap.get(iso3)
              return c ? [{ lat: c.lat, lng: c.lng, iso3, kind: 'burden' as const, rank }] : []
            })
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
      .slice(0, 8)
      .flatMap(([iso3]) => {
        const c = centroidMap.get(iso3)
        const feature = countries.find((f) => f.properties.iso_a3 === iso3)
        if (!c || !feature) return []
        return [{ lat: c.lat, lng: c.lng, name: feature.properties.name }]
      })
  }, [burdenMap, centroidMap, countries])

  // ── Event handlers ────────────────────────────────────────────────────────
  const handleHover = useCallback(
    (d: object | null) => {
      if (!d) {
        setHoveredIso3(null)
        setTooltip((t) => ({ ...t, visible: false }))
        scheduleResume()
        return
      }
      const f = d as GeoFeature
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

  const handleClick = useCallback(
    (d: object, _e: MouseEvent, coords: { lat: number; lng: number }) => {
      const f = d as GeoFeature
      setCountry(f.properties.iso_a3)
      globeRef.current?.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 1.5 }, 800)
    },
    [setCountry],
  )

  const handleRightClick = useCallback(
    (d: object) => {
      setCompareCountry((d as GeoFeature).properties.iso_a3)
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
        // ── Polygons ────────────────────────────────────────────────────────
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
          const iso = f.properties.iso_a3
          if (iso === hoveredIso3) return 0.06
          if (iso === selectedCountry || iso === compareCountry) return 0.03
          return 0.01
        }}
        polygonsTransitionDuration={200}
        atmosphereColor="rgba(59,130,246,0.3)"
        atmosphereAltitude={0.1}
        // ── Arc — vivid cyan flow between compared countries ─────────────
        arcsData={arcsData}
        arcColor={() => '#00e5ff'}
        arcStroke={2}
        arcDashLength={0.5}
        arcDashGap={0.2}
        arcDashAnimateTime={1200}
        arcAltitude={0.35}
        arcsTransitionDuration={400}
        // ── Points — glowing markers at selected + compare ───────────────
        pointsData={comparePointsData}
        pointLat={(d: object) => (d as PointDatum).lat}
        pointLng={(d: object) => (d as PointDatum).lng}
        pointAltitude={0.1}
        pointRadius={0.55}
        pointColor={() => 'rgba(0,229,255,0.9)'}
        pointsMerge={false}
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
          if (r.kind === 'compare') return 5
          return 8 - r.rank * 0.8 // rank 0→8, rank 4→4.8
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
        htmlAltitude={0.09}
        htmlElement={(d: object) => {
          const r = d as RingDatum
          const hue = r.rank * 16
          const el = document.createElement('div')
          el.style.cssText = [
            'width:28px;height:28px;border-radius:50%',
            `background:hsla(${hue},100%,50%,0.92)`,
            'border:2px solid rgba(255,255,255,0.85)',
            `box-shadow:0 0 10px hsla(${hue},100%,60%,0.7),0 0 22px hsla(${hue},100%,50%,0.35)`,
            'display:flex;align-items:center;justify-content:center',
            'color:#fff;font-family:system-ui,sans-serif;font-size:13px;font-weight:800',
            'pointer-events:none;user-select:none;letter-spacing:-0.5px',
          ].join(';')
          el.textContent = String(r.rank + 1)
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
