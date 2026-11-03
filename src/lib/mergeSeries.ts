import type { ModelSeries } from '../types'

export function buildTimeline(series: ModelSeries[]): string[] {
  const times = new Set<string>()
  for (const item of series) {
    for (const time of item.times) times.add(time)
  }
  return [...times].sort()
}

export function alignValues(
  series: ModelSeries,
  parameterId: string,
  timeline: string[],
): (number | null)[] {
  const indexByTime = new Map(series.times.map((time, index) => [time, index]))
  const values = series.data[parameterId] ?? []

  return timeline.map((time) => {
    const index = indexByTime.get(time)
    if (index === undefined) return null
    const value = values[index]
    return value === undefined ? null : value
  })
}

export interface SeriesSummary {
  count: number
  min: number | null
  max: number | null
  mean: number | null
  coverage: number
}

export function summarize(values: (number | null)[]): SeriesSummary {
  const valid = values.filter((value): value is number => value !== null && Number.isFinite(value))
  if (valid.length === 0) {
    return { count: 0, min: null, max: null, mean: null, coverage: 0 }
  }

  const sum = valid.reduce((total, value) => total + value, 0)
  return {
    count: valid.length,
    min: Math.min(...valid),
    max: Math.max(...valid),
    mean: sum / valid.length,
    coverage: values.length === 0 ? 0 : valid.length / values.length,
  }
}
