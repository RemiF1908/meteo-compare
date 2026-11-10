import type { TimeMode, UnitSettings } from '../types'

const PREFIX = 'meteo-compare:'
const CACHE_VERSION = 'v3'
const TTL_MS = 10 * 60 * 1000

interface CacheEntry<T> {
  value: T
  expires: number
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (!entry || typeof entry.expires !== 'number' || entry.expires < Date.now()) {
      localStorage.removeItem(PREFIX + key)
      return null
    }
    return entry.value
  } catch {
    return null
  }
}

export function cacheSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(
      PREFIX + key,
      JSON.stringify({ value, expires: Date.now() + TTL_MS } satisfies CacheEntry<T>),
    )
  } catch {
    // Le stockage local peut être indisponible ou plein : on ignore silencieusement.
  }
}

export interface ForecastCacheKeyOptions {
  latitude: number
  longitude: number
  modelId: string
  parameterIds: string[]
  mode: TimeMode
  days: number
  units: UnitSettings
  timeZone: string
  refreshToken?: number
}

export function forecastCacheKey(options: ForecastCacheKeyOptions): string {
  const params = [...options.parameterIds].sort().join(',')
  return [
    CACHE_VERSION,
    options.latitude.toFixed(3),
    options.longitude.toFixed(3),
    options.modelId,
    options.mode,
    options.days,
    params,
    options.units.temperature,
    options.units.wind,
    options.units.precipitation,
    options.timeZone,
    options.refreshToken ?? 0,
  ].join('|')
}
