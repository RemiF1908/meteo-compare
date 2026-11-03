import { useMemo } from 'react'
import { parseISO } from 'date-fns'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  type ChartOptions,
  type Plugin,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { BarChart3 } from 'lucide-react'
import { MODEL_BY_ID } from '../data/models'
import { alignValues } from '../lib/mergeSeries'
import { buildChartTickIndices } from '../lib/chartTicks'
import { formatFullDate, formatTickLabel, formatValue } from '../lib/format'
import type { ModelSeries, ParameterInfo, TimeMode } from '../types'
import { EmptyState } from './ui/EmptyState'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

interface ForecastChartProps {
  series: ModelSeries[]
  timeline: string[]
  mode: TimeMode
  parameter: ParameterInfo | undefined
  loading: boolean
  dark: boolean
  timeZone?: string
  heightClass?: string
}

const ZERO_BASED_PARAMETERS = new Set([
  'precipitation',
  'rain',
  'showers',
  'snowfall',
  'precipitation_probability',
  'precipitation_sum',
  'rain_sum',
  'showers_sum',
  'snowfall_sum',
  'precipitation_probability_max',
  'cloud_cover',
  'cloud_cover_low',
  'cloud_cover_mid',
  'cloud_cover_high',
  'cloud_cover_mean',
  'relative_humidity_2m',
  'relative_humidity_2m_mean',
  'shortwave_radiation',
  'direct_radiation',
  'diffuse_radiation',
  'direct_normal_irradiance',
  'sunshine_duration',
  'daylight_duration',
  'cape',
  'cape_max',
  'uv_index',
  'uv_index_max',
  'visibility',
  'visibility_min',
  'is_day',
])

function wallClockNow(timeZone?: string): number {
  if (!timeZone) return Date.now()
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date())
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value ?? '00'
    return new Date(
      `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`,
    ).getTime()
  } catch {
    return Date.now()
  }
}

function annotationPlugin(
  timeline: string[],
  mode: TimeMode,
  dark: boolean,
  timeZone?: string,
): Plugin<'line'> {
  return {
    id: 'meteoAnnotations',
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea, scales } = chart
      if (!chartArea || !scales.x) return

      const x = scales.x
      const lineColor = dark
        ? 'rgba(170,163,150,0.24)'
        : 'rgba(109,103,91,0.22)'
      const nowColor = dark ? '#ff6b4a' : '#d64a2f'

      if (mode === 'hourly') {
        ctx.save()
        ctx.strokeStyle = lineColor
        ctx.setLineDash([2, 3])
        ctx.lineWidth = 1
        timeline.forEach((time, index) => {
          if (index === 0) return
          if (parseISO(time).getHours() !== 0) return
          const px = x.getPixelForValue(index)
          if (px <= chartArea.left || px >= chartArea.right) return
          ctx.beginPath()
          ctx.moveTo(px, chartArea.top)
          ctx.lineTo(px, chartArea.bottom)
          ctx.stroke()
        })
        ctx.restore()

        const now = wallClockNow(timeZone)
        const first = parseISO(timeline[0]).getTime()
        const last = parseISO(timeline[timeline.length - 1]).getTime()
        if (Number.isFinite(first) && Number.isFinite(last) && now >= first && now <= last) {
          const index = Math.max(
            0,
            timeline.findIndex((time) => parseISO(time).getTime() >= now),
          )
          const px = x.getPixelForValue(index)
          ctx.save()
          ctx.strokeStyle = nowColor
          ctx.setLineDash([4, 4])
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(px, chartArea.top)
          ctx.lineTo(px, chartArea.bottom)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = nowColor
          ctx.font = '10px "IBM Plex Mono", monospace'
          ctx.fillText('maintenant', px + 4, chartArea.top + 10)
          ctx.restore()
        }
      }
    },
  }
}

export function ForecastChart({
  series,
  timeline,
  mode,
  parameter,
  loading,
  dark,
  timeZone,
  heightClass = 'h-[360px] lg:h-[500px]',
}: ForecastChartProps) {
  const usableSeries = useMemo(
    () => series.filter((item) => item.status === 'ok'),
    [series],
  )

  const activeParameterKey = parameter?.id ?? ''
  const unit =
    usableSeries.find((item) => item.units[activeParameterKey] !== undefined)
      ?.units[activeParameterKey] ??
    parameter?.unit ??
    ''

  const labels = useMemo(
    () => timeline.map((time) => formatTickLabel(time, mode)),
    [timeline, mode],
  )

  const tickIndices = useMemo(
    () => buildChartTickIndices(timeline, mode),
    [timeline, mode],
  )

  const data = useMemo(() => {
    if (!parameter) return { labels, datasets: [] }
    return {
      labels,
      datasets: usableSeries.map((item) => {
        const model = MODEL_BY_ID.get(item.modelId)
        return {
          label: model?.label ?? item.modelId,
          data: alignValues(item, parameter.id, timeline),
          borderColor: model?.color ?? '#d64a2f',
          backgroundColor: model?.color ?? '#d64a2f',
          borderDash: model?.dash,
          borderWidth: 1.75,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.22,
          spanGaps: false,
        }
      }),
    }
  }, [parameter, usableSeries, timeline, labels])

  const tickColor = dark ? '#aaa396' : '#6d675b'
  const gridColor = dark
    ? 'rgba(170,163,150,0.14)'
    : 'rgba(109,103,91,0.16)'

  const options = useMemo<ChartOptions<'line'>>(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: usableSeries.length > 12 ? false : undefined,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: tickColor,
            usePointStyle: false,
            boxWidth: 18,
            boxHeight: 2,
            font: { family: 'IBM Plex Sans', size: 10 },
            padding: 10,
          },
        },
        tooltip: {
          backgroundColor: dark ? '#1c1e1a' : '#fbf9f3',
          titleColor: dark ? '#ece8dd' : '#1b1a17',
          bodyColor: dark ? '#aaa396' : '#6d675b',
          borderColor: dark ? '#353930' : '#d7d0c1',
          borderWidth: 1,
          padding: 10,
          titleFont: { family: 'IBM Plex Mono', size: 11 },
          bodyFont: { family: 'IBM Plex Sans', size: 11 },
          itemSort: (a, b) =>
            (b.parsed.y ?? Number.NEGATIVE_INFINITY) -
            (a.parsed.y ?? Number.NEGATIVE_INFINITY),
          callbacks: {
            title: (items) => {
              const index = items[0]?.dataIndex
              if (index === undefined) return ''
              return formatFullDate(timeline[index], mode)
            },
            label: (context) => {
              const value = context.parsed.y
              return ` ${context.dataset.label} : ${formatValue(
                value,
                unit,
                parameter?.kind,
              )}`
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: tickColor,
            font: { family: 'IBM Plex Mono', size: 10 },
            maxTicksLimit: mode === 'hourly' ? 10 : 16,
            maxRotation: 0,
            autoSkip: true,
            callback: (value) => {
              const index = Number(value)
              if (!tickIndices.has(index)) return undefined
              const time = timeline[index]
              return time ? formatTickLabel(time, mode) : undefined
            },
          },
          grid: { display: false },
        },
        y: {
          beginAtZero:
            parameter !== undefined && ZERO_BASED_PARAMETERS.has(parameter.id),
          min:
            parameter?.kind === 'direction'
              ? 0
              : parameter?.unit === '%'
                ? 0
                : undefined,
          max:
            parameter?.kind === 'direction'
              ? 360
              : parameter?.unit === '%'
                ? 100
                : undefined,
          title: {
            display: true,
            text: parameter
              ? `${parameter.shortLabel}${unit ? ` (${unit})` : ''}`
              : '',
            color: tickColor,
            font: { family: 'IBM Plex Sans', size: 10 },
          },
          ticks: {
            color: tickColor,
            font: { family: 'IBM Plex Mono', size: 10 },
            stepSize: parameter?.kind === 'direction' ? 45 : undefined,
            callback: (value) => {
              if (parameter?.kind === 'direction') return `${value}°`
              return String(value)
            },
          },
          grid: { color: gridColor },
        },
      },
    }
  }, [
    parameter,
    unit,
    dark,
    tickColor,
    gridColor,
    mode,
    timeline,
    tickIndices,
    usableSeries.length,
  ])

  const plugins = useMemo(
    () => [annotationPlugin(timeline, mode, dark, timeZone)],
    [timeline, mode, dark, timeZone],
  )

  if (!parameter) {
    return (
      <div className={heightClass}>
        <EmptyState
          icon={BarChart3}
          title="Aucun paramètre"
          description="Ajoutez un paramètre pour afficher le graphique."
        />
      </div>
    )
  }

  if (usableSeries.length === 0) {
    return (
      <div className={heightClass}>
        <EmptyState
          icon={BarChart3}
          title={loading ? 'Chargement des prévisions…' : 'Aucune donnée à afficher'}
          description={
            loading
              ? 'Les modèles sélectionnés sont en cours d’interrogation.'
              : 'Sélectionnez un modèle disponible pour cette localisation.'
          }
        />
      </div>
    )
  }

  if (parameter.kind === 'code') {
    return (
      <div className={heightClass}>
        <EmptyState
          icon={BarChart3}
          title="Paramètre qualitatif"
          description="Le code météo est affiché dans le tableau des données."
        />
      </div>
    )
  }

  return (
    <div className={heightClass}>
      <Line data={data} options={options} plugins={plugins} />
    </div>
  )
}
