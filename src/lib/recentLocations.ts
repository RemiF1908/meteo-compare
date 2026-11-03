import type { Location } from '../types'

const STORAGE_KEY = 'meteo-compare:recent-locations'
const MAX_RECENT = 5

export function getRecentLocations(): Location[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Location[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (location) =>
          typeof location?.name === 'string' &&
          Number.isFinite(location?.latitude) &&
          Number.isFinite(location?.longitude),
      )
      .slice(0, MAX_RECENT)
  } catch {
    return []
  }
}

export function addRecentLocation(location: Location): Location[] {
  const next = [
    location,
    ...getRecentLocations().filter(
      (item) =>
        Math.abs(item.latitude - location.latitude) > 0.0001 ||
        Math.abs(item.longitude - location.longitude) > 0.0001,
    ),
  ].slice(0, MAX_RECENT)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Stockage indisponible : on garde simplement la liste en mémoire.
  }

  return next
}
