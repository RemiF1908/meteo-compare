import type { Location } from '../types'

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'

interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  elevation?: number
  country?: string
  country_code?: string
  admin1?: string
  timezone?: string
}

interface GeocodingResponse {
  results?: GeocodingResult[]
  error?: boolean
  reason?: string
}

export async function searchLocations(
  query: string,
  signal?: AbortSignal,
): Promise<Location[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const url = new URL(GEOCODING_ENDPOINT)
  url.searchParams.set('name', trimmed)
  url.searchParams.set('count', '8')
  url.searchParams.set('language', 'fr')
  url.searchParams.set('format', 'json')

  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Recherche impossible (HTTP ${response.status})`)
  }

  const payload = (await response.json()) as GeocodingResponse
  if (payload.error) {
    throw new Error(payload.reason ?? 'Recherche impossible')
  }

  return (payload.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    elevation: result.elevation,
    country: result.country,
    countryCode: result.country_code,
    admin1: result.admin1,
    timezone: result.timezone,
  }))
}
