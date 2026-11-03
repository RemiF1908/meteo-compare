import { parseISO } from 'date-fns'
import type { TimeMode } from '../types'

export function buildChartTickIndices(
  timeline: string[],
  mode: TimeMode,
): Set<number> {
  if (mode === 'daily') {
    return new Set(timeline.map((_, index) => index))
  }

  const indices = new Set<number>()
  const hours: { index: number; hour: number }[] = []

  timeline.forEach((time, index) => {
    const hour = parseISO(time).getHours()
    hours.push({ index, hour })
    if (hour === 0) indices.add(index)
  })

  if (timeline.length <= 72) {
    for (const { index, hour } of hours) {
      if (hour % 6 === 0) indices.add(index)
    }
  }

  return new Set([...indices].sort((a, b) => a - b))
}
