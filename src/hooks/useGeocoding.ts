import { useEffect, useState } from 'react'
import { searchLocations } from '../api/geocoding'
import type { Location } from '../types'

interface GeocodingState {
  results: Location[]
  loading: boolean
  error: string | null
}

export function useGeocoding(query: string): GeocodingState {
  const [state, setState] = useState<GeocodingState>({
    results: [],
    loading: false,
    error: null,
  })

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) return

    const controller = new AbortController()
    let active = true

    const timer = window.setTimeout(async () => {
      setState((previous) => ({ ...previous, loading: true, error: null }))
      try {
        const results = await searchLocations(trimmed, controller.signal)
        if (active) setState({ results, loading: false, error: null })
      } catch (error) {
        if (!active || controller.signal.aborted) return
        setState({
          results: [],
          loading: false,
          error:
            error instanceof Error ? error.message : 'Recherche impossible',
        })
      }
    }, 300)

    return () => {
      active = false
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  const isActive = query.trim().length >= 2
  return {
    results: isActive ? state.results : [],
    loading: isActive ? state.loading : false,
    error: isActive ? state.error : null,
  }
}
