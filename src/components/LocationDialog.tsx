import { useMemo, useState } from 'react'
import { LocateFixed, MapPin, Search } from 'lucide-react'
import { useGeocoding } from '../hooks/useGeocoding'
import { formatCoordinates } from '../lib/format'
import { addRecentLocation, getRecentLocations } from '../lib/recentLocations'
import type { Location } from '../types'
import { Dialog } from './ui/Dialog'
import { Button } from './ui/Button'
import { LocationMap } from './LocationMap'

interface LocationDialogProps {
  open: boolean
  onClose: () => void
  location: Location
  onSelect: (location: Location) => void
}

export function LocationDialog({
  open,
  onClose,
  location,
  onSelect,
}: LocationDialogProps) {
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<Location>(location)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [recent, setRecent] = useState<Location[]>(() => getRecentLocations())
  const { results, loading, error } = useGeocoding(query)

  const recentWithoutCurrent = useMemo(
    () =>
      recent.filter(
        (item) =>
          Math.abs(item.latitude - location.latitude) > 0.0001 ||
          Math.abs(item.longitude - location.longitude) > 0.0001,
      ),
    [recent, location],
  )

  function locateMe() {
    if (!navigator.geolocation) {
      setGeoError('Géolocalisation non disponible dans ce navigateur.')
      return
    }
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDraft({
          name: 'Ma position',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => setGeoError('Impossible d’obtenir votre position.'),
      { enableHighAccuracy: false, timeout: 10_000 },
    )
  }

  function apply() {
    const next = { ...draft }
    setRecent(addRecentLocation(next))
    onSelect(next)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Choisir une localisation"
      description="Recherchez une ville, utilisez votre position ou cliquez directement sur la carte."
      wide
      variant="sheet"
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={apply}>
            Utiliser ce point
          </Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="min-w-0">
          <label className="eyebrow mb-1.5 block" htmlFor="location-search">
            Recherche
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-faint" />
            <input
              id="location-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ville, code postal, lieu…"
              className="field pl-9"
              autoComplete="off"
            />
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <Button onClick={locateMe}>
              <LocateFixed className="h-3.5 w-3.5" />
              Ma position
            </Button>
          </div>

          {geoError && (
            <p className="mt-2 text-xs text-error">{geoError}</p>
          )}

          {query.trim().length >= 2 ? (
            <div className="mt-3 border-t border-line pt-3">
              {loading && <p className="text-xs text-muted">Recherche…</p>}
              {error && <p className="text-xs text-error">{error}</p>}
              {!loading && !error && results.length === 0 && (
                <p className="text-xs text-muted">Aucun résultat.</p>
              )}
              <ul className="divide-y divide-line">
                {results.map((result) => (
                  <li key={`${result.id ?? result.latitude}-${result.longitude}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(result)
                        setQuery('')
                      }}
                      className="flex w-full items-start gap-2 py-2 text-left transition hover:bg-surface-2"
                    >
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {result.name}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {[result.admin1, result.country]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                      {result.countryCode && (
                        <span className="data ml-auto text-[10px] text-faint">
                          {result.countryCode}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-3 border-t border-line pt-3">
              <p className="eyebrow mb-1.5">Récent</p>
              {recentWithoutCurrent.length === 0 ? (
                <p className="text-xs text-muted">
                  Vos dernières localisations apparaîtront ici.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {recentWithoutCurrent.map((item) => (
                    <li key={`${item.latitude}-${item.longitude}`}>
                      <button
                        type="button"
                        onClick={() => setDraft(item)}
                        className="flex w-full items-center justify-between gap-2 py-2 text-left transition hover:bg-surface-2"
                      >
                        <span className="truncate text-sm">{item.name}</span>
                        <span className="data shrink-0 text-[10px] text-faint">
                          {formatCoordinates(item.latitude, item.longitude)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-4 border-t border-line pt-3">
            <p className="eyebrow mb-1">Point sélectionné</p>
            <p className="text-sm font-medium">{draft.name}</p>
            <p className="data mt-0.5 text-[11px] text-muted">
              {formatCoordinates(draft.latitude, draft.longitude)}
            </p>
            {draft.countryCode && (
              <p className="data text-[11px] text-faint">{draft.countryCode}</p>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <p className="eyebrow mb-1.5">Carte</p>
          <LocationMap
            location={draft}
            onPick={(latitude, longitude) =>
              setDraft({ name: 'Point sélectionné', latitude, longitude })
            }
            className="h-[320px] w-full sm:h-[420px]"
          />
          <p className="mt-2 text-[11px] text-muted">
            Cliquez sur la carte pour déplacer le point.
          </p>
        </div>
      </div>
    </Dialog>
  )
}
