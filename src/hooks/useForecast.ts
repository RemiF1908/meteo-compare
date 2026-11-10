import { useEffect, useState } from 'react'
import { fetchModelForecast } from '../api/openMeteo'
import { mapWithConcurrency } from '../lib/async'
import { cacheGet, cacheSet, forecastCacheKey } from '../lib/cache'
import { clientTimeZone } from '../lib/timeZone'
import type {
  ForecastState,
  Location,
  ModelSeries,
  TimeMode,
  UnitSettings,
} from '../types'

interface UseForecastOptions {
  location: Location
  modelIds: string[]
  parameterIds: string[]
  mode: TimeMode
  days: number
  units: UnitSettings
  refreshToken: number
}

const EMPTY_STATE: ForecastState = {
  series: [],
  loading: false,
  error: null,
  fetchedAt: null,
}

export function useForecast({
  location,
  modelIds,
  parameterIds,
  mode,
  days,
  units,
  refreshToken,
}: UseForecastOptions): ForecastState {
  const [state, setState] = useState<ForecastState>(EMPTY_STATE)

  useEffect(() => {
    if (modelIds.length === 0 || parameterIds.length === 0) return

    const controller = new AbortController()
    let active = true

    // oxlint-disable-next-line react/set-state-in-effect
    setState((previous) => ({ ...previous, loading: true, error: null }))

    const run = async () => {
      try {
        const series = await mapWithConcurrency(
          modelIds,
          6,
          async (modelId) => {
            const cacheKey = forecastCacheKey({
              latitude: location.latitude,
              longitude: location.longitude,
              modelId,
              parameterIds,
              mode,
              days,
              units,
              timeZone: clientTimeZone(),
              refreshToken,
            })

            const cached = cacheGet<ModelSeries>(cacheKey)
            if (cached) return cached

            const result = await fetchModelForecast({
              location,
              modelId,
              parameterIds,
              mode,
              days,
              units,
              signal: controller.signal,
            })

            if (result.status === 'ok') cacheSet(cacheKey, result)
            return result
          },
        )

        if (!active) return

        const available = series.some((item) => item.status === 'ok')
        setState({
          series,
          loading: false,
          error: available
            ? null
            : 'Aucun modèle sélectionné ne fournit de données pour cette localisation.',
          fetchedAt: Date.now(),
        })
      } catch (error) {
        if (
          !active ||
          (error instanceof DOMException && error.name === 'AbortError')
        ) {
          return
        }
        setState({
          series: [],
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Erreur lors du chargement des prévisions.',
          fetchedAt: null,
        })
      }
    }

    void run()

    return () => {
      active = false
      controller.abort()
    }
  }, [
    location,
    modelIds,
    parameterIds,
    mode,
    days,
    units,
    refreshToken,
  ])

  if (modelIds.length === 0 || parameterIds.length === 0) {
    return EMPTY_STATE
  }

  return state
}
