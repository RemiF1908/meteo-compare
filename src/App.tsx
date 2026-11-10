import { useEffect, useMemo, useState } from 'react'
import {
  CalendarRange,
  Link2,
  MapPin,
  Moon,
  RefreshCw,
  Sun,
} from 'lucide-react'
import { ErrorBanner } from './components/ErrorBanner'
import { ForecastChart } from './components/ForecastChart'
import { ForecastTable } from './components/ForecastTable'
import { LocationDialog } from './components/LocationDialog'
import {
  ModelDialog,
  ModelRail,
} from './components/ModelPicker'
import { MobileControlBar, type ControlPanel } from './components/MobileControlBar'
import {
  ParameterDialog,
  ParameterTabs,
} from './components/ParameterPicker'
import { PeriodDialog } from './components/PeriodDialog'
import { StatusLine } from './components/StatusLine'
import { Button } from './components/ui/Button'
import { IconButton } from './components/ui/IconButton'
import { SegmentedControl } from './components/ui/SegmentedControl'
import { DEFAULT_PARAMETER_IDS, getParameter } from './data/parameters'
import { useForecast } from './hooks/useForecast'
import { useModelRuns } from './hooks/useModelRuns'
import { buildTimeline } from './lib/mergeSeries'
import {
  readConfigFromUrl,
  writeConfigToUrl,
} from './lib/urlState'
import { clientTimeZone } from './lib/timeZone'
import type {
  Location,
  ModelStatus,
  ParameterInfo,
  TimeMode,
  UnitSettings,
} from './types'

type Theme = 'light' | 'dark'
type View = 'chart' | 'table'

const VIEW_OPTIONS = [
  { value: 'chart' as const, label: 'Graphique' },
  { value: 'table' as const, label: 'Tableau' },
]

function initialTheme(): Theme {
  const stored = localStorage.getItem('meteo-compare:theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function App() {
  const initial = useMemo(() => readConfigFromUrl(), [])
  const timeZone = useMemo(() => clientTimeZone(), [])

  const [location, setLocation] = useState<Location>(initial.location)
  const [modelIds, setModelIds] = useState<string[]>(initial.modelIds)
  const [parameterIds, setParameterIds] = useState<string[]>(
    initial.parameterIds,
  )
  const [mode, setMode] = useState<TimeMode>(initial.mode)
  const [days, setDays] = useState(initial.days)
  const [units, setUnits] = useState<UnitSettings>(initial.units)
  const [activeParameterId, setActiveParameterId] = useState(
    initial.activeParameterId ??
      initial.parameterIds[0] ??
      DEFAULT_PARAMETER_IDS[initial.mode][0],
  )
  const [view, setView] = useState<View>(initial.view ?? 'chart')
  const [refreshToken, setRefreshToken] = useState(0)
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [panel, setPanel] = useState<ControlPanel | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('meteo-compare:theme', theme)
  }, [theme])

  useEffect(() => {
    writeConfigToUrl({
      location,
      modelIds,
      parameterIds,
      mode,
      days,
      units,
      view,
      activeParameterId,
    })
  }, [
    location,
    modelIds,
    parameterIds,
    mode,
    days,
    units,
    view,
    activeParameterId,
  ])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const forecast = useForecast({
    location,
    modelIds,
    parameterIds,
    mode,
    days,
    units,
    refreshToken,
  })

  const modelRuns = useModelRuns(modelIds, refreshToken)

  const statuses = useMemo(() => {
    const map: Record<string, ModelStatus> = {}
    for (const item of forecast.series) map[item.modelId] = item.status
    return map
  }, [forecast.series])

  const timeline = useMemo(
    () => buildTimeline(forecast.series),
    [forecast.series],
  )

  const parameters = useMemo(
    () =>
      parameterIds
        .map((id) => getParameter(mode, id))
        .filter((parameter): parameter is ParameterInfo => Boolean(parameter)),
    [parameterIds, mode],
  )

  const activeParameter =
    parameters.find((parameter) => parameter.id === activeParameterId) ??
    parameters[0]

  function handleParametersChange(next: string[]) {
    if (next.length === 0) return
    const limited = next.slice(0, 6)
    setParameterIds(limited)
    if (!limited.includes(activeParameterId)) {
      setActiveParameterId(limited[0])
    }
  }

  function handlePeriodApply(
    nextMode: TimeMode,
    nextDays: number,
    nextUnits: UnitSettings,
  ) {
    if (nextMode !== mode) {
      const defaults = DEFAULT_PARAMETER_IDS[nextMode]
      setMode(nextMode)
      setParameterIds(defaults)
      setActiveParameterId(defaults[0])
    }
    setDays(nextDays)
    setUnits(nextUnits)
  }

  function handleModelRemove(modelId: string) {
    setModelIds((current) => current.filter((id) => id !== modelId))
  }

  function refresh() {
    setRefreshToken((token) => token + 1)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setToast('Lien copié dans le presse-papiers')
    } catch {
      setToast('Impossible de copier le lien')
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="font-serif text-xl font-semibold tracking-tight whitespace-nowrap">
              Météo Compare
            </span>
            <span className="hidden truncate text-[11px] text-muted sm:inline">
              Comparateur de modèles Open-Meteo
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="data mr-2 hidden text-[10px] text-faint md:inline">
              Données ouvertes
            </span>
            <IconButton label="Copier le lien" onClick={copyLink}>
              <Link2 className="h-4 w-4" />
            </IconButton>
            <IconButton
              label={
                theme === 'dark'
                  ? 'Passer au thème clair'
                  : 'Passer au thème sombre'
              }
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </IconButton>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 pb-24 sm:px-6 lg:pb-8">
        <div className="flex flex-wrap items-center gap-2 border-b border-line py-3">
          <button
            type="button"
            onClick={() => setPanel('location')}
            className="flex min-w-0 flex-1 items-center gap-2 border border-line bg-surface px-2.5 py-2 text-left transition hover:border-line-strong sm:flex-none"
          >
            <MapPin className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium">
                {location.name}
              </span>
              <span className="data block truncate text-[10px] text-muted">
                {location.countryCode ?? '—'} · {location.latitude.toFixed(2)},{' '}
                {location.longitude.toFixed(2)}
              </span>
            </span>
          </button>

          <Button
            onClick={() => setPanel('period')}
            className="hidden sm:inline-flex"
          >
            <CalendarRange className="h-3.5 w-3.5" />
            {days} j · {mode === 'hourly' ? 'Horaire' : 'Journalier'}
          </Button>

          <Button onClick={() => setPanel('models')} className="hidden lg:inline-flex">
            Modèles
            <span className="data text-[10px] text-muted">{modelIds.length}</span>
          </Button>

          <Button
            onClick={() => setPanel('parameters')}
            className="hidden lg:inline-flex"
          >
            Paramètres
            <span className="data text-[10px] text-muted">
              {parameterIds.length}
            </span>
          </Button>

          <Button onClick={refresh} disabled={forecast.loading}>
            <RefreshCw
              className={`h-3.5 w-3.5 ${forecast.loading ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </div>

        <StatusLine
          location={location}
          days={days}
          mode={mode}
          series={forecast.series}
          fetchedAt={forecast.fetchedAt}
          loading={forecast.loading}
        />

        <div className="mt-5 flex gap-6">
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-[73px] space-y-6">
              <ModelRail
                selected={modelIds}
                statuses={statuses}
                runs={modelRuns}
                loading={forecast.loading}
                onRemove={handleModelRemove}
                onOpen={() => setPanel('models')}
              />
              <div className="border-t border-line pt-4">
                <p className="eyebrow mb-1">Paramètres comparés</p>
                <p className="text-xs text-muted">
                  {parameters.length} paramètre
                  {parameters.length > 1 ? 's' : ''} en onglets au-dessus du
                  graphique.
                </p>
                <Button
                  className="mt-2 w-full"
                  onClick={() => setPanel('parameters')}
                >
                  Configurer les paramètres
                </Button>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
              <ParameterTabs
                parameters={parameters}
                activeParameterId={activeParameter?.id ?? ''}
                onChange={setActiveParameterId}
                onOpen={() => setPanel('parameters')}
              />
              <SegmentedControl
                label="Affichage"
                options={VIEW_OPTIONS}
                value={view}
                onChange={setView}
              />
            </div>

            {forecast.error && (
              <div className="mt-3">
                <ErrorBanner message={forecast.error} onRetry={refresh} />
              </div>
            )}

            <div className="mt-3">
              {view === 'chart' ? (
                <ForecastChart
                  series={forecast.series}
                  timeline={timeline}
                  mode={mode}
                  parameter={activeParameter}
                  loading={forecast.loading}
                  dark={theme === 'dark'}
                  timeZone={timeZone}
                />
              ) : (
                <ForecastTable
                  series={forecast.series}
                  timeline={timeline}
                  mode={mode}
                  parameter={activeParameter}
                  dark={theme === 'dark'}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      <footer className="border-t border-line py-4">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-2 px-4 text-[10px] text-muted sm:px-6">
          <p>
            Données :{' '}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
              className="link-underline"
            >
              Open-Meteo
            </a>{' '}
            · cartographie :{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
              className="link-underline"
            >
              OpenStreetMap
            </a>
          </p>
          <p>Prévisions indicatives, variables selon les modèles.</p>
        </div>
      </footer>

      <MobileControlBar
        modelCount={modelIds.length}
        parameterCount={parameterIds.length}
        days={days}
        onOpen={setPanel}
      />

      {panel === 'location' && (
        <LocationDialog
          open
          onClose={() => setPanel(null)}
          location={location}
          onSelect={setLocation}
        />
      )}

      {panel === 'models' && (
        <ModelDialog
          open
          onClose={() => setPanel(null)}
          selected={modelIds}
          onChange={setModelIds}
          statuses={statuses}
          countryCode={location.countryCode}
        />
      )}

      {panel === 'parameters' && (
        <ParameterDialog
          open
          onClose={() => setPanel(null)}
          mode={mode}
          selected={parameterIds}
          onChange={handleParametersChange}
        />
      )}

      {panel === 'period' && (
        <PeriodDialog
          open
          onClose={() => setPanel(null)}
          mode={mode}
          days={days}
          units={units}
          onApply={handlePeriodApply}
        />
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 border border-line bg-ink px-3 py-2 text-xs text-paper lg:bottom-6"
        >
          {toast}
        </div>
      )}
    </div>
  )
}

export default App
