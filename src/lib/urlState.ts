import { defaultModelIdsForLocation, MODEL_BY_ID } from '../data/models'
import { DEFAULT_PARAMETER_IDS, PARAMETER_MAP } from '../data/parameters'
import type { Location, TimeMode, UnitSettings } from '../types'

export const DEFAULT_LOCATION: Location = {
  name: 'Paris',
  latitude: 48.8566,
  longitude: 2.3522,
  country: 'France',
  countryCode: 'FR',
  admin1: 'Île-de-France',
  timezone: 'Europe/Paris',
}

export interface AppConfig {
  location: Location
  modelIds: string[]
  parameterIds: string[]
  mode: TimeMode
  days: number
  units: UnitSettings
  view?: 'chart' | 'table'
  activeParameterId?: string
}

export const DEFAULT_UNITS: UnitSettings = {
  temperature: 'celsius',
  wind: 'kmh',
  precipitation: 'mm',
}

export function defaultConfig(): AppConfig {
  return {
    location: DEFAULT_LOCATION,
    modelIds: defaultModelIdsForLocation(DEFAULT_LOCATION.countryCode),
    parameterIds: [...DEFAULT_PARAMETER_IDS.hourly],
    mode: 'hourly',
    days: 7,
    units: { ...DEFAULT_UNITS },
  }
}

function parseNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseMode(value: string | null): TimeMode {
  return value === 'daily' ? 'daily' : 'hourly'
}

function parseUnits(params: URLSearchParams): UnitSettings {
  const temperature = params.get('tu')
  const wind = params.get('wu')
  const precipitation = params.get('pu')

  return {
    temperature: temperature === 'fahrenheit' ? 'fahrenheit' : 'celsius',
    wind: wind === 'ms' || wind === 'mph' || wind === 'kn' ? wind : 'kmh',
    precipitation: precipitation === 'inch' ? 'inch' : 'mm',
  }
}

export function readConfigFromUrl(): AppConfig {
  const params = new URLSearchParams(window.location.search)
  const latitude = parseNumber(params.get('lat'))
  const longitude = parseNumber(params.get('lon'))
  const hasCoordinates = latitude !== undefined && longitude !== undefined

  const location: Location = hasCoordinates
    ? {
        name: params.get('name') ?? 'Point sélectionné',
        latitude,
        longitude,
        elevation: parseNumber(params.get('elev')),
        country: params.get('country') ?? undefined,
        countryCode: params.get('cc') ?? undefined,
        admin1: params.get('admin1') ?? undefined,
        timezone: params.get('tz') ?? undefined,
      }
    : { ...DEFAULT_LOCATION }

  const mode = parseMode(params.get('mode'))
  const days = Math.min(16, Math.max(1, parseNumber(params.get('days')) ?? 7))

  const modelParam = params.get('models')
  const requestedModels = modelParam
    ? modelParam.split(',').map((model) => model.trim()).filter(Boolean)
    : []
  const validModels = requestedModels.filter((model) => MODEL_BY_ID.has(model))
  const modelIds =
    validModels.length > 0 ? validModels : defaultModelIdsForLocation(location.countryCode)

  const parameterParam = params.get('params')
  const requestedParameters = parameterParam
    ? parameterParam.split(',').map((parameter) => parameter.trim()).filter(Boolean)
    : []
  const validParameters = requestedParameters.filter((parameter) =>
    PARAMETER_MAP[mode].has(parameter),
  )
  const parameterIds = (
    validParameters.length > 0 ? validParameters : [...DEFAULT_PARAMETER_IDS[mode]]
  ).slice(0, 6)

  const activeParameterParam = params.get('active')
  const activeParameterId =
    activeParameterParam && parameterIds.includes(activeParameterParam)
      ? activeParameterParam
      : parameterIds[0]

  return {
    location,
    modelIds,
    parameterIds,
    mode,
    days,
    units: parseUnits(params),
    view: params.get('view') === 'table' ? 'table' : 'chart',
    activeParameterId,
  }
}

export function writeConfigToUrl(config: AppConfig): void {
  const params = new URLSearchParams()
  const { location, modelIds, parameterIds, mode, days, units } = config

  params.set('lat', location.latitude.toFixed(4))
  params.set('lon', location.longitude.toFixed(4))
  params.set('name', location.name)
  if (location.countryCode) params.set('cc', location.countryCode)
  if (location.country) params.set('country', location.country)
  if (location.admin1) params.set('admin1', location.admin1)
  if (location.elevation !== undefined) params.set('elev', String(location.elevation))
  if (location.timezone) params.set('tz', location.timezone)
  params.set('models', modelIds.join(','))
  params.set('params', parameterIds.join(','))
  params.set('mode', mode)
  params.set('days', String(days))
  params.set('tu', units.temperature)
  params.set('wu', units.wind)
  params.set('pu', units.precipitation)
  if (config.view) params.set('view', config.view)
  if (config.activeParameterId) params.set('active', config.activeParameterId)

  const url = `${window.location.pathname}?${params.toString()}`
  window.history.replaceState(null, '', url)
}
