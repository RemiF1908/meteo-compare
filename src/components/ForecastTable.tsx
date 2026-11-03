import { useMemo } from 'react'
import { Download, Table2 } from 'lucide-react'
import { MODEL_BY_ID } from '../data/models'
import { alignValues, summarize } from '../lib/mergeSeries'
import {
  directionArrow,
  formatShortDate,
  formatValue,
} from '../lib/format'
import {
  bandColors,
  bandRangeLabel,
  findTemperatureBand,
  isTemperatureParameter,
  scaleRangeLabel,
  TEMPERATURE_BANDS,
  TEMPERATURE_STEP,
  toCelsius,
} from '../lib/temperatureScale'
import type { ModelSeries, ParameterInfo, TimeMode } from '../types'
import { EmptyState } from './ui/EmptyState'
import { Button } from './ui/Button'

interface ForecastTableProps {
  series: ModelSeries[]
  timeline: string[]
  mode: TimeMode
  parameter: ParameterInfo | undefined
  dark: boolean
}

function TemperatureLegend({ unit, dark }: { unit: string; dark: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="eyebrow">Échelle fixe</span>
      <span
        className="flex items-center gap-px"
        role="img"
        aria-label={`Échelle de température fixe de ${scaleRangeLabel(unit)}`}
      >
        {TEMPERATURE_BANDS.map((band) => (
          <span
            key={band.id}
            className="h-3 w-5"
            style={{ backgroundColor: bandColors(band, dark).bg }}
            title={bandRangeLabel(band, unit)}
          />
        ))}
      </span>
      <span className="data text-[10px] text-muted">
        {scaleRangeLabel(unit)} · pas de {TEMPERATURE_STEP} °C
      </span>
    </div>
  )
}

export function ForecastTable({
  series,
  timeline,
  mode,
  parameter,
  dark,
}: ForecastTableProps) {
  const usableSeries = useMemo(
    () => series.filter((item) => item.status === 'ok'),
    [series],
  )

  const aligned = useMemo(() => {
    if (!parameter) return []
    return usableSeries.map((item) => {
      const values = alignValues(item, parameter.id, timeline)
      return {
        series: item,
        model: MODEL_BY_ID.get(item.modelId),
        values,
        summary: summarize(values),
      }
    })
  }, [usableSeries, parameter, timeline])

  const unit =
    usableSeries.find((item) => item.units[parameter?.id ?? ''] !== undefined)
      ?.units[parameter?.id ?? ''] ??
    parameter?.unit ??
    ''

  const useHeat = useMemo(
    () =>
      isTemperatureParameter(parameter) && (unit === '°C' || unit === '°F'),
    [parameter, unit],
  )

  function heatOf(value: number | null) {
    if (!useHeat || value === null || !Number.isFinite(value)) return null
    const band = findTemperatureBand(toCelsius(value, unit))
    return { band, ...bandColors(band, dark) }
  }

  function exportCsv() {
    if (!parameter) return
    const header = [
      'Echeance',
      ...aligned.map(
        ({ series: item, model }) => model?.label ?? item.modelId,
      ),
    ]
    const rows = timeline.map((time, rowIndex) => [
      formatShortDate(time, mode),
      ...aligned.map(({ values }) => {
        const value = values[rowIndex]
        return value === null || !Number.isFinite(value) ? '' : String(value)
      }),
    ])
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(';'),
      )
      .join('\n')

    const blob = new Blob([`\ufeff${csv}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `meteo-compare-${parameter.id}-${mode}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!parameter || usableSeries.length === 0) {
    return (
      <div className="min-h-56">
        <EmptyState
          icon={Table2}
          title="Aucune donnée tabulaire"
          description="Sélectionnez au moins un modèle et un paramètre."
        />
      </div>
    )
  }

  return (
    <section aria-labelledby="table-title">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="table-title" className="font-serif text-lg">
            Données par échéance
          </h2>
          <p className="data mt-0.5 text-[11px] text-muted">
            {parameter.label}
            {unit ? ` · ${unit}` : ''} · {timeline.length} échéance
            {timeline.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={exportCsv}>
          <Download className="h-3.5 w-3.5" />
          CSV
        </Button>
      </div>

      {useHeat && (
        <div className="mb-2">
          <TemperatureLegend unit={unit} dark={dark} />
        </div>
      )}

      <div className="max-h-[520px] overflow-auto border border-line bg-surface">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-surface-2">
            <tr>
              <th className="sticky left-0 z-20 min-w-28 border-b border-line bg-surface-2 px-3 py-2 text-left font-medium">
                <span className="eyebrow">Échéance</span>
              </th>
              {aligned.map(({ series: item, model }) => (
                <th
                  key={item.modelId}
                  className="min-w-28 border-b border-line px-3 py-2 text-right font-medium whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-[3px]"
                      style={{ backgroundColor: model?.color ?? '#d64a2f' }}
                    />
                    {model?.label ?? item.modelId}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeline.map((time, rowIndex) => (
              <tr
                key={time}
                className="border-b border-line/60 last:border-b-0 hover:bg-surface-2/60"
              >
                <td className="data sticky left-0 z-10 border-r border-line/60 bg-surface px-3 py-1.5 text-[11px] whitespace-nowrap text-muted">
                  {formatShortDate(time, mode)}
                </td>
                {aligned.map(({ series: item, values }) => {
                  const value = values[rowIndex]
                  const heat = heatOf(value)
                  return (
                    <td
                      key={item.modelId}
                      className={`data border-r border-line/40 px-3 py-1.5 text-right text-[11px] whitespace-nowrap last:border-r-0${
                        heat ? ' heat-cell' : ''
                      }`}
                      style={
                        heat
                          ? { backgroundColor: heat.bg, color: heat.ink }
                          : undefined
                      }
                      title={
                        heat ? bandRangeLabel(heat.band, unit) : undefined
                      }
                    >
                      {parameter.kind === 'direction' &&
                      value !== null &&
                      Number.isFinite(value)
                        ? `${directionArrow(value)} ${formatValue(value, unit, parameter.kind)}`
                        : formatValue(value, unit, parameter.kind)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5">
        <h3 className="eyebrow mb-1.5">Synthèse par modèle</h3>
        <div className="overflow-x-auto border border-line bg-surface">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-surface-2">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Modèle</th>
                <th className="px-3 py-2 text-right font-medium">Min</th>
                <th className="px-3 py-2 text-right font-medium">Moyenne</th>
                <th className="px-3 py-2 text-right font-medium">Max</th>
                <th className="px-3 py-2 text-right font-medium">Couverture</th>
              </tr>
            </thead>
            <tbody>
              {aligned.map(({ series: item, model, summary }) => {
                const heatMin = heatOf(summary.min)
                const heatMean = heatOf(summary.mean)
                const heatMax = heatOf(summary.max)
                return (
                  <tr
                    key={item.modelId}
                    className="border-t border-line/60 hover:bg-surface-2/60"
                  >
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-[3px]"
                          style={{ backgroundColor: model?.color ?? '#d64a2f' }}
                        />
                        {model?.label ?? item.modelId}
                      </span>
                    </td>
                    <td
                      className={`data px-3 py-1.5 text-right${heatMin ? ' heat-cell' : ''}`}
                      style={
                        heatMin
                          ? { backgroundColor: heatMin.bg, color: heatMin.ink }
                          : undefined
                      }
                      title={heatMin ? bandRangeLabel(heatMin.band, unit) : undefined}
                    >
                      {parameter.kind === 'code'
                        ? '—'
                        : formatValue(summary.min, unit, parameter.kind)}
                    </td>
                    <td
                      className={`data px-3 py-1.5 text-right${heatMean ? ' heat-cell' : ''}`}
                      style={
                        heatMean
                          ? { backgroundColor: heatMean.bg, color: heatMean.ink }
                          : undefined
                      }
                      title={
                        heatMean ? bandRangeLabel(heatMean.band, unit) : undefined
                      }
                    >
                      {parameter.kind === 'code'
                        ? '—'
                        : formatValue(summary.mean, unit, parameter.kind)}
                    </td>
                    <td
                      className={`data px-3 py-1.5 text-right${heatMax ? ' heat-cell' : ''}`}
                      style={
                        heatMax
                          ? { backgroundColor: heatMax.bg, color: heatMax.ink }
                          : undefined
                      }
                      title={heatMax ? bandRangeLabel(heatMax.band, unit) : undefined}
                    >
                      {parameter.kind === 'code'
                        ? '—'
                        : formatValue(summary.max, unit, parameter.kind)}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <span className="inline-flex items-center justify-end gap-2">
                        <span className="inline-block h-1 w-16 bg-surface-2">
                          <span
                            className="block h-1 bg-accent"
                            style={{
                              width: `${Math.round(summary.coverage * 100)}%`,
                            }}
                          />
                        </span>
                        <span className="data w-9 text-[11px] text-muted">
                          {Math.round(summary.coverage * 100)} %
                        </span>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
