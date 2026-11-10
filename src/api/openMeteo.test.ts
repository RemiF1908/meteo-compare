import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchModelForecast, fetchModelRunInfo } from './openMeteo'

const units = {
  temperature: 'celsius' as const,
  wind: 'kmh' as const,
  precipitation: 'mm' as const,
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchModelForecast', () => {
  it('convertit la hauteur de neige de mètres en centimètres', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          hourly: {
            time: ['2026-11-02T00:00', '2026-11-02T01:00'],
            snow_depth_ecmwf_ifs: [0.2, null],
          },
          hourly_units: {
            snow_depth_ecmwf_ifs: 'm',
          },
        }),
      }),
    )

    const result = await fetchModelForecast({
      location: { name: 'Test', latitude: 60, longitude: 8 },
      modelId: 'ecmwf_ifs',
      parameterIds: ['snow_depth'],
      mode: 'hourly',
      days: 2,
      units,
    })

    expect(result.data.snow_depth).toEqual([20, null])
    expect(result.units.snow_depth).toBe('cm')
  })
})

describe('fetchModelRunInfo', () => {
  it('récupère l’heure de la dernière sortie du modèle', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        last_run_initialisation_time: 1794290400,
        last_run_availability_time: 1794312128,
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchModelRunInfo('ecmwf_ifs')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.open-meteo.com/data/ecmwf_ifs/static/meta.json',
      { signal: undefined },
    )
    expect(result).toEqual({
      initialisationTime: 1794290400,
      availabilityTime: 1794312128,
    })
  })

  it('ignore best_match et les réponses invalides', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    })
    vi.stubGlobal('fetch', fetchMock)

    expect(await fetchModelRunInfo('best_match')).toBeNull()
    expect(await fetchModelRunInfo('ecmwf_ifs')).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
