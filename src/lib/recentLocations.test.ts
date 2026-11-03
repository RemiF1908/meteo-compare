import { beforeEach, describe, expect, it } from 'vitest'
import { addRecentLocation, getRecentLocations } from './recentLocations'

beforeEach(() => {
  localStorage.clear()
})

describe('recentLocations', () => {
  it('mémorise les localisations récentes sans doublon', () => {
    addRecentLocation({ name: 'Paris', latitude: 48.8566, longitude: 2.3522 })
    addRecentLocation({ name: 'Lyon', latitude: 45.764, longitude: 4.8357 })
    addRecentLocation({ name: 'Paris', latitude: 48.8566, longitude: 2.3522 })

    expect(getRecentLocations().map((item) => item.name)).toEqual([
      'Paris',
      'Lyon',
    ])
  })

  it('limite la liste à cinq entrées', () => {
    for (let index = 0; index < 7; index += 1) {
      addRecentLocation({
        name: `Ville ${index}`,
        latitude: index,
        longitude: index,
      })
    }

    expect(getRecentLocations()).toHaveLength(5)
    expect(getRecentLocations()[0].name).toBe('Ville 6')
  })
})
