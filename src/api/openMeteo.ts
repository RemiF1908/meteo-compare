import { buildForecastUrl } from '../lib/forecastUrl'
import type {
  Location,
  ModelSeries,
  ModelStatus,
  TimeMode,
  UnitSettings,
} from '../types'

interface ForecastResponse {
  error?: boolean
  reason?: string
  hourly?: Record<string, unknown>
  daily?: Record<string, unknown>
  hourly_units?: Record<string, string>
  daily_units?: Record<string, string>
}

const PARAMETER_VALUE_SCALE: Record<string, number> = {
  snow_depth: 100,
}

const PARAMETER_UNIT_OVERRIDES: Record<string, string> = {
  snow_depth: 'cm',
}

export interface FetchModelForecastOptions {
  location: Location
  modelId: string
  parameterIds: string[]
  mode: TimeMode
  days: number
  units: UnitSettings
  signal?: AbortSignal
}

function errorSeries(
  modelId: string,
  status: ModelStatus,
  error: string,
): ModelSeries {
  return {
    modelId,
    status,
    times: [],
    data: {},
    units: {},
    error,
  }
}

export async function fetchModelForecast(
  options: FetchModelForecastOptions,
): Promise<ModelSeries> {
  const url = buildForecastUrl({
    latitude: options.location.latitude,
    longitude: options.location.longitude,
    modelId: options.modelId,
    parameterIds: options.parameterIds,
    mode: options.mode,
    days: options.days,
    units: options.units,
  })

  let response: Response
  try {
    response = await fetch(url, { signal: options.signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    return errorSeries(options.modelId, 'error', 'Erreur réseau')
  }

  let payload: ForecastResponse | null = null
  try {
    payload = (await response.json()) as ForecastResponse
  } catch {
    payload = null
  }

  if (!response.ok || payload?.error) {
    const reason = payload?.reason ?? `Erreur HTTP ${response.status}`
    const status: ModelStatus = /no data is available/i.test(reason)
      ? 'out-of-domain'
      : 'error'
    return errorSeries(options.modelId, status, reason)
  }

  const block = options.mode === 'hourly' ? payload?.hourly : payload?.daily
  const unitBlock =
    options.mode === 'hourly' ? payload?.hourly_units : payload?.daily_units

  const times = Array.isArray(block?.time) ? (block.time as string[]) : []
  const data: Record<string, (number | null)[]> = {}
  const units: Record<string, string> = {}

  for (const parameterId of options.parameterIds) {
    const suffixedKey = `${parameterId}_${options.modelId}`
    const raw = (block?.[suffixedKey] ?? block?.[parameterId]) as
      | (number | null)[]
      | undefined
    const scale = PARAMETER_VALUE_SCALE[parameterId] ?? 1
    data[parameterId] = Array.isArray(raw)
      ? raw.map((value) =>
          value === null || !Number.isFinite(value) ? null : value * scale,
        )
      : times.map(() => null)
    units[parameterId] =
      PARAMETER_UNIT_OVERRIDES[parameterId] ??
      unitBlock?.[suffixedKey] ??
      unitBlock?.[parameterId] ??
      ''
  }

  const hasValue = Object.values(data).some((values) =>
    values.some((value) => value !== null && Number.isFinite(value)),
  )

  return {
    modelId: options.modelId,
    status: hasValue ? 'ok' : 'no-data',
    times,
    data,
    units,
    error: hasValue ? undefined : 'Aucune donnée disponible',
  }
}
