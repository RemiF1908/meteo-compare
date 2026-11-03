import { describe, expect, it } from 'vitest'
import {
  bandRangeLabel,
  findTemperatureBand,
  fromCelsius,
  isTemperatureParameter,
  scaleRangeLabel,
  TEMPERATURE_BANDS,
  toCelsius,
} from './temperatureScale'
import type { ParameterInfo } from '../types'

function parameter(overrides: Partial<ParameterInfo>): ParameterInfo {
  return {
    id: 'temperature_2m',
    label: 'Température à 2 m',
    shortLabel: 'Température',
    unit: '°C',
    group: 'Température',
    kind: 'line',
    mode: 'hourly',
    ...overrides,
  }
}

describe('temperatureScale', () => {
  it('associe chaque valeur au bon palier fixe', () => {
    expect(findTemperatureBand(-30).id).toBe('below-20')
    expect(findTemperatureBand(-20).id).toBe('-20--15')
    expect(findTemperatureBand(-14.9).id).toBe('-15--10')
    expect(findTemperatureBand(0).id).toBe('0-5')
    expect(findTemperatureBand(12.3).id).toBe('10-15')
    expect(findTemperatureBand(35).id).toBe('above-35')
    expect(findTemperatureBand(50).id).toBe('above-35')
  })

  it('ne dépend pas des données affichées', () => {
    const cold = findTemperatureBand(7)
    const warm = findTemperatureBand(7)
    expect(cold.id).toBe(warm.id)
    expect(TEMPERATURE_BANDS).toHaveLength(13)
  })

  it('convertit les unités', () => {
    expect(toCelsius(32, '°F')).toBeCloseTo(0)
    expect(toCelsius(12, '°C')).toBe(12)
    expect(fromCelsius(0, '°F')).toBeCloseTo(32)
    expect(fromCelsius(35, '°F')).toBeCloseTo(95)
  })

  it('formate les libellés de plage', () => {
    expect(bandRangeLabel(findTemperatureBand(17), '°C')).toBe('15 – 20 °C')
    expect(bandRangeLabel(findTemperatureBand(-30), '°C')).toBe('≤ -20 °C')
    expect(bandRangeLabel(findTemperatureBand(40), '°C')).toBe('≥ 35 °C')
    expect(scaleRangeLabel('°C')).toBe('-20 °C … 35 °C')
    expect(scaleRangeLabel('°F')).toBe('-4 °F … 95 °F')
  })

  it('détecte les paramètres de température', () => {
    expect(isTemperatureParameter(parameter({}))).toBe(true)
    expect(
      isTemperatureParameter(
        parameter({ group: 'Précipitations', unit: 'mm' }),
      ),
    ).toBe(false)
    expect(isTemperatureParameter(undefined)).toBe(false)
  })
})
