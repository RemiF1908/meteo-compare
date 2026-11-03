import { describe, expect, it } from 'vitest'
import { alignValues, buildTimeline, summarize } from './mergeSeries'
import type { ModelSeries } from '../types'

function series(
  modelId: string,
  times: string[],
  values: (number | null)[],
): ModelSeries {
  return {
    modelId,
    status: 'ok',
    times,
    data: { temperature_2m: values },
    units: { temperature_2m: '°C' },
  }
}

describe('mergeSeries', () => {
  it('construit une timeline unie et triée', () => {
    const timeline = buildTimeline([
      series('a', ['2026-01-01T02:00', '2026-01-01T01:00'], [2, 1]),
      series('b', ['2026-01-01T03:00', '2026-01-01T01:00'], [3, 1]),
    ])

    expect(timeline).toEqual([
      '2026-01-01T01:00',
      '2026-01-01T02:00',
      '2026-01-01T03:00',
    ])
  })

  it('aligne les valeurs et insère null pour les trous', () => {
    const timeline = [
      '2026-01-01T01:00',
      '2026-01-01T02:00',
      '2026-01-01T03:00',
    ]
    const aligned = alignValues(
      series('a', ['2026-01-01T02:00', '2026-01-01T03:00'], [12, 13]),
      'temperature_2m',
      timeline,
    )

    expect(aligned).toEqual([null, 12, 13])
  })

  it('calcule min, max, moyenne et couverture', () => {
    expect(summarize([1, 2, null, 6])).toEqual({
      count: 3,
      min: 1,
      max: 6,
      mean: 3,
      coverage: 0.75,
    })
    expect(summarize([null, null])).toEqual({
      count: 0,
      min: null,
      max: null,
      mean: null,
      coverage: 0,
    })
  })
})
