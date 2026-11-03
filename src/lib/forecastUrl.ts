import type { TimeMode, UnitSettings } from '../types'

export interface ForecastUrlOptions {
  latitude: number
  longitude: number
  modelId: string
  parameterIds: string[]
  mode: TimeMode
  days: number
  units: UnitSettings
}

const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'

export function buildForecastUrl(options: ForecastUrlOptions): string {
  const url = new URL(FORECAST_ENDPOINT)
  url.searchParams.set('latitude', String(options.latitude))
  url.searchParams.set('longitude', String(options.longitude))
  url.searchParams.set(options.mode, options.parameterIds.join(','))

  if (options.modelId && options.modelId !== 'best_match') {
    url.searchParams.set('models', options.modelId)
  }

  url.searchParams.set('forecast_days', String(options.days))
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('temperature_unit', options.units.temperature)
  url.searchParams.set('wind_speed_unit', options.units.wind)
  url.searchParams.set('precipitation_unit', options.units.precipitation)

  return url.toString()
}
