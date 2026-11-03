import { beforeEach, describe, expect, it } from 'vitest'
import { readConfigFromUrl, writeConfigToUrl } from './urlState'

beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

describe('urlState', () => {
  it('lit la vue et le paramètre actif depuis l’URL', () => {
    window.history.replaceState(
      null,
      '',
      '/?lat=48.85&lon=2.35&mode=hourly&params=temperature_2m,precipitation&active=precipitation&view=table',
    )

    const config = readConfigFromUrl()
    expect(config.view).toBe('table')
    expect(config.activeParameterId).toBe('precipitation')
    expect(config.parameterIds).toEqual(['temperature_2m', 'precipitation'])
  })

  it('limite à six paramètres et retombe sur le premier si l’actif est invalide', () => {
    window.history.replaceState(
      null,
      '',
      '/?mode=hourly&params=temperature_2m,apparent_temperature,dew_point_2m,relative_humidity_2m,precipitation,wind_speed_10m,cloud_cover&active=inconnu',
    )

    const config = readConfigFromUrl()
    expect(config.parameterIds).toHaveLength(6)
    expect(config.activeParameterId).toBe('temperature_2m')
  })

  it('écrit la vue et le paramètre actif dans l’URL', () => {
    writeConfigToUrl({
      location: { name: 'Paris', latitude: 48.8566, longitude: 2.3522 },
      modelIds: ['ecmwf_ifs'],
      parameterIds: ['temperature_2m'],
      mode: 'hourly',
      days: 7,
      units: {
        temperature: 'celsius',
        wind: 'kmh',
        precipitation: 'mm',
      },
      view: 'table',
      activeParameterId: 'temperature_2m',
    })

    const params = new URLSearchParams(window.location.search)
    expect(params.get('view')).toBe('table')
    expect(params.get('active')).toBe('temperature_2m')
  })
})
