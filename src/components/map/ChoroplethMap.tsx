import { useState, useMemo } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { useAppStore } from '@/stores/app.store'
import { useGlobalDisease } from '@/hooks/useCountryDisease'
import { getBurdenColour } from '@/lib/colour-scale'
import { formatCount } from '@/lib/format'
import { MapLegend } from './MapLegend'

const GEO_URL = '/geo/countries-110m.json'

interface GeoFeature {
  rsmKey: string
  properties: { iso_a3?: string; name?: string }
}

export function ChoroplethMap() {
  const { activeDiseases, selectedYear, setCountry, setCompareCountry } = useAppStore()
  const primaryDisease = activeDiseases[0]
  const [tooltip, setTooltip] = useState<{
    name: string
    value: number | null
    x: number
    y: number
  } | null>(null)
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

  return (
    <div className="relative h-full w-full bg-navy-950">
      <ComposableMap
        projectionConfig={{ scale: 147, center: [0, 20] }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              (geographies as unknown as GeoFeature[]).map((geo) => {
                const props = geo.properties
                const iso3 = props.iso_a3 ?? ''
                const value = burdenMap.get(iso3) ?? null
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getBurdenColour(value, maxValue)}
                    stroke="#6b7280"
                    strokeWidth={0.8}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', opacity: 0.8, cursor: 'pointer' },
                      pressed: { outline: 'none' },
                    }}
                    onClick={() => setCountry(iso3)}
                    onContextMenu={(e: React.MouseEvent) => {
                      e.preventDefault()
                      setCompareCountry(iso3)
                    }}
                    onMouseEnter={(e: React.MouseEvent) => {
                      setTooltip({
                        name: props.name ?? '',
                        value,
                        x: e.clientX,
                        y: e.clientY,
                      })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    aria-label={`${props.name ?? ''}: ${formatCount(value)}`}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {tooltip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-50 rounded border border-stone-300 bg-gray-900/95 p-2.5 shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 8 }}
        >
          <p className="text-xs font-semibold text-white">{tooltip.name}</p>
          <p className="mt-1 text-sm font-bold text-white">{formatCount(tooltip.value)}</p>
        </div>
      )}
      <MapLegend diseaseName={primaryDisease?.name ?? 'Disease burden'} unit="Cases" />
    </div>
  )
}
