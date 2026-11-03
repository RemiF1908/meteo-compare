import { describe, expect, it } from 'vitest'
import { buildForecastUrl } from './forecastUrl'
import type { UnitSettings } from '../types'

const units: UnitSettings = {
  temperature: 'celsius',
  wind: 'kmh',
  precipitation: 'mm',
}

describe('buildForecastUrl', () => {
  it('construit une URL horaire complète', () => {
    const url = new URL(
      buildForecastUrl({
        latitude: 48.8566,
        longitude: 2.3522,
        modelId: 'ecmwf_ifs',
        parameterIds: ['temperature_2m', 'precipitation'],
        mode: 'hourly',
        days: 7,
        units,
      }),
    )

    expect(url.origin).toBe('https://api.open-meteo.com')
    expect(url.pathname).toBe('/v1/forecast')
    expect(url.searchParams.get('latitude')).toBe('48.8566')
    expect(url.searchParams.get('longitude')).toBe('2.3522')
    expect(url.searchParams.get('hourly')).toBe('temperature_2m,precipitation')
    expect(url.searchParams.get('daily')).toBeNull()
    expect(url.searchParams.get('models')).toBe('ecmwf_ifs')
    expect(url.searchParams.get('forecast_days')).toBe('7')
    expect(url.searchParams.get('timezone')).toBe('auto')
  })

  it('omet le paramètre models pour best_match', () => {
    const url = new URL(
      buildForecastUrl({
        latitude: 0,
        longitude: 0,
        modelId: 'best_match',
        parameterIds: ['temperature_2m'],
        mode: 'hourly',
        days: 1,
        units,
      }),
    )

    expect(url.searchParams.get('models')).toBeNull()
  })

  it('utilise daily et transmet les unités choisies', () => {
    const url = new URL(
      buildForecastUrl({
        latitude: 45.18,
        longitude: 5.72,
        modelId: 'meteofrance_seamless',
        parameterIds: ['temperature_2m_max'],
        mode: 'daily',
        days: 10,
        units: {
          temperature: 'fahrenheit',
          wind: 'mph',
          precipitation: 'inch',
        },
      }),
    )

    expect(url.searchParams.get('daily')).toBe('temperature_2m_max')
    expect(url.searchParams.get('hourly')).toBeNull()
    expect(url.searchParams.get('temperature_unit')).toBe('fahrenheit')
    expect(url.searchParams.get('wind_speed_unit')).toBe('mph')
    expect(url.searchParams.get('precipitation_unit')).toBe('inch')
    expect(url.searchParams.get('forecast_days')).toBe('10')
  })
})
