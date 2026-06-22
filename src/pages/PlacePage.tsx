import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { geocodePlace, type GeoPlace } from '@/services/climate.service'
import { useRiskAssessment } from '@/hooks/useRiskAssessment'
import { SafetyBanner } from '@/components/risk/SafetyBanner'
import { PlaceSearch } from '@/components/risk/PlaceSearch'
import { RiskCard } from '@/components/risk/RiskCard'

export default function PlacePage() {
  const [place, setPlace] = useState<GeoPlace | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [searching, setSearching] = useState(false)
  const { results, isLoading, isError } = useRiskAssessment(place?.lat ?? null, place?.lng ?? null)

  const handleSearch = async (query: string) => {
    setSearching(true)
    setNotFound(false)
    try {
      const found = await geocodePlace(query)
      if (!found) {
        setNotFound(true)
        setPlace(null)
      } else {
        setPlace(found)
      }
    } catch {
      setNotFound(true)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col gap-3 overflow-y-auto p-4">
      <Link to="/" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to map
      </Link>
      <h1 className="text-lg font-bold text-gray-900">Place health check</h1>
      <SafetyBanner />
      <PlaceSearch onSearch={(q) => void handleSearch(q)} />

      {searching && <p className="text-sm text-gray-500">Finding place…</p>}
      {notFound && <p className="text-sm text-gray-500">Place not found. Try another search.</p>}
      {place && (
        <p className="text-sm font-medium text-gray-700">
          {place.name}
          {place.country ? `, ${place.country}` : ''}
        </p>
      )}
      {isLoading && <p className="text-sm text-gray-500">Reading the weather…</p>}
      {isError && <p className="text-sm text-gray-500">Weather data unavailable right now.</p>}
      {results.map((r) => (
        <RiskCard key={r.assessment.diseaseId} result={r} />
      ))}
    </div>
  )
}
