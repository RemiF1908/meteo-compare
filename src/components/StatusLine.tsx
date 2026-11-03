import { Loader2 } from 'lucide-react'
import { formatCoordinates, formatFetchedAt } from '../lib/format'
import type { Location, ModelSeries, TimeMode } from '../types'

interface StatusLineProps {
  location: Location
  days: number
  mode: TimeMode
  series: ModelSeries[]
  fetchedAt: number | null
  loading: boolean
}

export function StatusLine({
  location,
  days,
  mode,
  series,
  fetchedAt,
  loading,
}: StatusLineProps) {
  const available = series.filter((item) => item.status === 'ok').length
  const total = series.length

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-line py-2 text-[11px] text-muted">
      <span className="data font-medium text-ink">{location.name}</span>
      <span className="data hidden sm:inline">
        {formatCoordinates(location.latitude, location.longitude)}
      </span>
      <span className="hidden h-3 w-px bg-line sm:block" />
      <span className="data">
        {days} jour{days > 1 ? 's' : ''} · {mode === 'hourly' ? 'horaire' : 'journalier'}
      </span>
      <span className="hidden h-3 w-px bg-line sm:block" />
      <span className="data">
        {available}/{total} modèle{total > 1 ? 's' : ''} disponible
        {available > 1 ? 's' : ''}
      </span>
      <span className="ml-auto flex items-center gap-1.5">
        {loading ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-accent" />
            <span>actualisation…</span>
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            <span>maj {formatFetchedAt(fetchedAt)}</span>
          </>
        )}
      </span>
    </div>
  )
}
