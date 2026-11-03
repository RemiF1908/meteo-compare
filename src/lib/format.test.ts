import { describe, expect, it } from 'vitest'
import {
  cardinalDirection,
  flagEmoji,
  formatAxisLabel,
  formatTickLabel,
  formatValue,
  weatherCodeLabel,
} from './format'

describe('format', () => {
  it('formate les valeurs selon l’unité', () => {
    expect(formatValue(12.34, '°C')).toBe('12.3 °C')
    expect(formatValue(55, '%')).toBe('55 %')
    expect(formatValue(1.5, 'mm')).toBe('1.5 mm')
    expect(formatValue(20, 'cm')).toBe('20.0 cm')
    expect(formatValue(1500, 'm')).toBe('1.5 km')
    expect(formatValue(3600, 's')).toBe('1 h')
    expect(formatValue(null, '°C')).toBe('—')
  })

  it('gère les codes météo et les directions', () => {
    expect(weatherCodeLabel(61)).toBe('Pluie faible')
    expect(formatValue(61, '', 'code')).toBe('Pluie faible')
    expect(cardinalDirection(0)).toBe('N')
    expect(cardinalDirection(90)).toBe('E')
    expect(cardinalDirection(180)).toBe('S')
    expect(formatValue(90, '°', 'direction')).toBe('90° E')
  })

  it('formate les dates et les drapeaux', () => {
    expect(formatAxisLabel('2026-11-03T14:00', 'hourly')).toBe('14:00')
    expect(formatAxisLabel('2026-11-03', 'daily')).toMatch(/3 nov/)
    expect(formatTickLabel('2026-11-03T00:00', 'hourly')).toMatch(/3/)
    expect(formatTickLabel('2026-11-03T14:00', 'hourly')).toBe('14:00')
    expect(formatTickLabel('2026-11-03', 'daily')).toMatch(/3 nov/)
    expect(flagEmoji('FR')).toBe('🇫🇷')
    expect(flagEmoji(undefined)).toBe('🌍')
  })
})
