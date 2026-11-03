import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchModelForecast } from './openMeteo'

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
