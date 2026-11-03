import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { ParameterKind, TimeMode } from '../types'

const WEATHER_CODES: Record<number, string> = {
  0: 'Ciel dégagé',
  1: 'Principalement dégagé',
  2: 'Partiellement nuageux',
  3: 'Couvert',
  45: 'Brouillard',
  48: 'Brouillard givrant',
  51: 'Bruine légère',
  53: 'Bruine modérée',
  55: 'Bruine dense',
  56: 'Bruine verglaçante légère',
  57: 'Bruine verglaçante dense',
  61: 'Pluie faible',
  63: 'Pluie modérée',
  65: 'Pluie forte',
  66: 'Pluie verglaçante légère',
  67: 'Pluie verglaçante forte',
  71: 'Neige faible',
  73: 'Neige modérée',
  75: 'Neige forte',
  77: 'Grains de neige',
  80: 'Averses faibles',
  81: 'Averses modérées',
  82: 'Averses violentes',
  85: 'Averses de neige faibles',
  86: 'Averses de neige fortes',
  95: 'Orage',
  96: 'Orage avec grêle légère',
  99: 'Orage avec grêle forte',
}

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']

export function weatherCodeLabel(code: number | null): string {
  if (code === null) return '—'
  return WEATHER_CODES[code] ?? `Code ${code}`
}

export function cardinalDirection(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360
  return CARDINALS[Math.round(normalized / 45) % 8]
}

export function directionArrow(degrees: number): string {
  const arrows = ['↓', '↙', '←', '↖', '↑', '↗', '→', '↘']
  const normalized = ((degrees % 360) + 360) % 360
  return arrows[Math.round(normalized / 45) % 8]
}

function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60)
  if (totalMinutes < 60) return `${totalMinutes} min`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`
}

export function formatValue(
  value: number | null,
  unit: string,
  kind: ParameterKind = 'line',
): string {
  if (value === null || !Number.isFinite(value)) return '—'
  if (kind === 'code') return weatherCodeLabel(value)
  if (kind === 'direction') {
    return `${Math.round(value)}° ${cardinalDirection(value)}`
  }

  switch (unit) {
    case '°C':
    case '°F':
      return `${value.toFixed(1)} ${unit}`
    case 'mm':
    case 'cm':
      return `${value.toFixed(1)} ${unit}`
    case 'inch':
      return `${value.toFixed(2)} in`
    case '%':
      return `${Math.round(value)} %`
    case 'hPa':
      return `${Math.round(value)} hPa`
    case 'W/m²':
      return `${Math.round(value)} W/m²`
    case 'MJ/m²':
      return `${value.toFixed(1)} MJ/m²`
    case 'J/kg':
      return `${Math.round(value)} J/kg`
    case 'kPa':
      return `${value.toFixed(2)} kPa`
    case 'm':
      return value >= 1000 ? `${(value / 1000).toFixed(1)} km` : `${Math.round(value)} m`
    case 's':
      return formatDuration(value)
    case 'km/h':
    case 'm/s':
    case 'mph':
    case 'kn':
      return `${Math.round(value)} ${unit}`
    default:
      return unit ? `${value.toFixed(1)} ${unit}` : value.toFixed(1)
  }
}

export function formatAxisLabel(iso: string, mode: TimeMode): string {
  try {
    const date = parseISO(iso)
    return mode === 'hourly'
      ? format(date, 'HH:mm', { locale: fr })
      : format(date, 'EEE d MMM', { locale: fr })
  } catch {
    return iso
  }
}

export function formatTickLabel(iso: string, mode: TimeMode): string {
  try {
    const date = parseISO(iso)
    if (mode === 'daily') return format(date, 'd MMM', { locale: fr })
    if (date.getHours() === 0) return format(date, 'EEE d', { locale: fr })
    return format(date, 'HH:mm', { locale: fr })
  } catch {
    return iso
  }
}

export function formatFullDate(iso: string, mode: TimeMode): string {
  try {
    const date = parseISO(iso)
    return mode === 'hourly'
      ? format(date, 'EEEE d MMMM yyyy, HH:mm', { locale: fr })
      : format(date, 'EEEE d MMMM yyyy', { locale: fr })
  } catch {
    return iso
  }
}

export function formatShortDate(iso: string, mode: TimeMode): string {
  try {
    const date = parseISO(iso)
    return mode === 'hourly'
      ? format(date, 'dd/MM HH:mm', { locale: fr })
      : format(date, 'dd/MM/yyyy', { locale: fr })
  } catch {
    return iso
  }
}

export function formatFetchedAt(timestamp: number | null): string {
  if (!timestamp) return '—'
  return format(new Date(timestamp), 'HH:mm:ss', { locale: fr })
}

export function formatCoordinates(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude).toFixed(3)}° ${latitude >= 0 ? 'N' : 'S'}`
  const lon = `${Math.abs(longitude).toFixed(3)}° ${longitude >= 0 ? 'E' : 'O'}`
  return `${lat}, ${lon}`
}

export function flagEmoji(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌍'
  const base = 127397
  return String.fromCodePoint(
    ...countryCode
      .toUpperCase()
      .split('')
      .map((letter) => letter.charCodeAt(0) + base),
  )
}
