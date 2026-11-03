import type { ParameterInfo } from '../types'

export interface TemperatureBand {
  id: string
  min: number
  max: number | null
  light: { bg: string; ink: string }
  dark: { bg: string; ink: string }
}

/**
 * Échelle fixe : les seuils ne dépendent jamais des données affichées,
 * deux tableaux différents utilisent donc les mêmes couleurs.
 */
export const TEMPERATURE_BANDS: TemperatureBand[] = [
  {
    id: 'below-20',
    min: -Infinity,
    max: -20,
    light: { bg: '#4361a6', ink: '#f4f7ff' },
    dark: { bg: '#23345f', ink: '#d6e2fb' },
  },
  {
    id: '-20--15',
    min: -20,
    max: -15,
    light: { bg: '#5d83c9', ink: '#f4f7ff' },
    dark: { bg: '#2d4472', ink: '#dce6fb' },
  },
  {
    id: '-15--10',
    min: -15,
    max: -10,
    light: { bg: '#8aabd9', ink: '#16233d' },
    dark: { bg: '#3a5688', ink: '#e4ecfd' },
  },
  {
    id: '-10--5',
    min: -10,
    max: -5,
    light: { bg: '#b3cdea', ink: '#16233d' },
    dark: { bg: '#47679b', ink: '#ecf1fd' },
  },
  {
    id: '-5-0',
    min: -5,
    max: 0,
    light: { bg: '#d3e6f4', ink: '#16233d' },
    dark: { bg: '#587cae', ink: '#f1f6fe' },
  },
  {
    id: '0-5',
    min: 0,
    max: 5,
    light: { bg: '#d9eee4', ink: '#14332a' },
    dark: { bg: '#2f6b62', ink: '#e2f5ef' },
  },
  {
    id: '5-10',
    min: 5,
    max: 10,
    light: { bg: '#d5efc7', ink: '#1c3312' },
    dark: { bg: '#3d7048', ink: '#e6f6e8' },
  },
  {
    id: '10-15',
    min: 10,
    max: 15,
    light: { bg: '#e9f0b6', ink: '#2a3110' },
    dark: { bg: '#6b7a34', ink: '#f4f7e3' },
  },
  {
    id: '15-20',
    min: 15,
    max: 20,
    light: { bg: '#f6e3a4', ink: '#3a2f0c' },
    dark: { bg: '#86762c', ink: '#faf3da' },
  },
  {
    id: '20-25',
    min: 20,
    max: 25,
    light: { bg: '#f8cf98', ink: '#40280a' },
    dark: { bg: '#8f5d26', ink: '#fcefd9' },
  },
  {
    id: '25-30',
    min: 25,
    max: 30,
    light: { bg: '#f3b184', ink: '#421c05' },
    dark: { bg: '#9c4f24', ink: '#fdeade' },
  },
  {
    id: '30-35',
    min: 30,
    max: 35,
    light: { bg: '#e88f67', ink: '#3d1603' },
    dark: { bg: '#a53c1e', ink: '#fde9e0' },
  },
  {
    id: 'above-35',
    min: 35,
    max: null,
    light: { bg: '#cf4f33', ink: '#fff3ec' },
    dark: { bg: '#b82313', ink: '#ffeae5' },
  },
]

export const TEMPERATURE_SCALE_MIN = -20
export const TEMPERATURE_SCALE_MAX = 35
export const TEMPERATURE_STEP = 5

export function isTemperatureParameter(
  parameter: ParameterInfo | undefined,
): boolean {
  return parameter?.group === 'Température'
}

export function toCelsius(value: number, unit: string): number {
  return unit === '°F' ? ((value - 32) * 5) / 9 : value
}

export function fromCelsius(celsius: number, unit: string): number {
  return unit === '°F' ? (celsius * 9) / 5 + 32 : celsius
}

export function findTemperatureBand(celsius: number): TemperatureBand {
  for (const band of TEMPERATURE_BANDS) {
    if (celsius >= band.min && (band.max === null || celsius < band.max)) {
      return band
    }
  }
  return TEMPERATURE_BANDS[TEMPERATURE_BANDS.length - 1]
}

export function bandColors(band: TemperatureBand, dark: boolean) {
  return dark ? band.dark : band.light
}

function formatScaleValue(value: number, unit: string): string {
  const rounded = Math.round(value)
  return `${rounded} ${unit}`
}

export function bandRangeLabel(band: TemperatureBand, unit: string): string {
  const display = (celsius: number) => Math.round(fromCelsius(celsius, unit))
  if (band.max === null) {
    return `≥ ${display(band.min)} ${unit}`
  }
  if (!Number.isFinite(band.min)) {
    return `≤ ${display(band.max)} ${unit}`
  }
  return `${display(band.min)} – ${display(band.max)} ${unit}`
}

export function scaleRangeLabel(unit: string): string {
  return `${formatScaleValue(
    fromCelsius(TEMPERATURE_SCALE_MIN, unit),
    unit,
  )} … ${formatScaleValue(fromCelsius(TEMPERATURE_SCALE_MAX, unit), unit)}`
}
