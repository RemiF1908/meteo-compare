import { describe, expect, it } from 'vitest'
import { buildChartTickIndices } from './chartTicks'

function hourlyTimeline(hours: number): string[] {
  const start = new Date('2026-11-02T00:00:00')
  return Array.from({ length: hours }, (_, index) => {
    const date = new Date(start.getTime() + index * 3600_000)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:00`
  })
}

describe('buildChartTickIndices', () => {
  it('affiche toutes les dates en mode journalier', () => {
    const indices = buildChartTickIndices(
      ['2026-11-02', '2026-11-03', '2026-11-04'],
      'daily',
    )
    expect([...indices]).toEqual([0, 1, 2])
  })

  it('garde un repère par jour pour les longues périodes horaires', () => {
    const indices = buildChartTickIndices(hourlyTimeline(16 * 24), 'hourly')
    expect([...indices]).toEqual(
      Array.from({ length: 16 }, (_, day) => day * 24),
    )
  })

  it('ajoute des repères intermédiaires pour les courtes périodes', () => {
    const indices = buildChartTickIndices(hourlyTimeline(48), 'hourly')
    expect([...indices]).toEqual([
      0, 6, 12, 18, 24, 30, 36, 42,
    ])
  })
})
