export type TimeMode = 'hourly' | 'daily'

export type ParameterKind = 'line' | 'direction' | 'code'

export interface Location {
  id?: number
  name: string
  latitude: number
  longitude: number
  elevation?: number
  country?: string
  countryCode?: string
  admin1?: string
  timezone?: string
}

export type ModelRegion =
  | 'global'
  | 'europe'
  | 'france'
  | 'north-america'
  | 'united-kingdom'
  | 'nordic'
  | 'netherlands'
  | 'denmark'
  | 'switzerland'
  | 'austria'
  | 'czechia'
  | 'italy'
  | 'japan'
  | 'korea'
  | 'canada'
  | 'australia'
  | 'china'

export interface ModelInfo {
  id: string
  label: string
  provider: string
  group: string
  region: ModelRegion
  resolution: string
  forecastDays: number
  updateFrequency: string
  color: string
  dash?: number[]
}

export interface ParameterInfo {
  id: string
  label: string
  shortLabel: string
  unit: string
  group: string
  kind: ParameterKind
  mode: TimeMode
}

export type ModelStatus =
  | 'ok'
  | 'no-data'
  | 'out-of-domain'
  | 'error'

export interface ModelRunInfo {
  initialisationTime: number
  availabilityTime: number | null
}

export interface ModelSeries {
  modelId: string
  status: ModelStatus
  times: string[]
  data: Record<string, (number | null)[]>
  units: Record<string, string>
  error?: string
}

export interface UnitSettings {
  temperature: 'celsius' | 'fahrenheit'
  wind: 'kmh' | 'ms' | 'mph' | 'kn'
  precipitation: 'mm' | 'inch'
}

export interface ForecastRequest {
  location: Location
  modelIds: string[]
  parameterIds: string[]
  mode: TimeMode
  days: number
  units: UnitSettings
}

export interface ForecastState {
  series: ModelSeries[]
  loading: boolean
  error: string | null
  fetchedAt: number | null
}
