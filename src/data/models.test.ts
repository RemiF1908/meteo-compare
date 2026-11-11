import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MODEL_IDS,
  MODELS,
  MODEL_BY_ID,
  defaultModelIdsForLocation,
  modelMetaIds,
} from './models'

describe('catalogue des modèles', () => {
  it('contient tous les modèles avec des identifiants uniques', () => {
    const ids = MODELS.map((model) => model.id)
    expect(ids.length).toBeGreaterThan(50)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('résout les modèles par identifiant', () => {
    expect(MODEL_BY_ID.get('ecmwf_ifs')?.label).toBe('ECMWF IFS HRES 9 km')
    expect(MODEL_BY_ID.get('meteofrance_arome_france_hd')?.region).toBe('france')
  })

  it('ajoute le modèle régional pertinent selon le pays', () => {
    for (const modelId of DEFAULT_MODEL_IDS) {
      expect(MODEL_BY_ID.has(modelId)).toBe(true)
    }
    expect(defaultModelIdsForLocation('FR')).toContain(
      'meteofrance_arome_france_hd',
    )
    expect(defaultModelIdsForLocation('US')).toContain('ncep_hrrr_conus')
    expect(defaultModelIdsForLocation(undefined)).toEqual(DEFAULT_MODEL_IDS)
  })

  it('résout l’identifiant de métadonnées des modèles seamless', () => {
    const paris = {
      name: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      countryCode: 'FR',
    }
    const newYork = {
      name: 'New York',
      latitude: 40.7128,
      longitude: -74.006,
      countryCode: 'US',
    }
    const london = {
      name: 'Londres',
      latitude: 51.5072,
      longitude: -0.1276,
      countryCode: 'GB',
    }

    expect(modelMetaIds('ecmwf_ifs', paris)).toEqual(['ecmwf_ifs'])
    expect(modelMetaIds('best_match', paris)).toEqual([])
    expect(modelMetaIds('meteofrance_seamless', paris)).toContain(
      'meteofrance_arome_france_hd',
    )
    expect(modelMetaIds('meteofrance_seamless', newYork)).toEqual([
      'meteofrance_arpege_world025',
    ])
    expect(modelMetaIds('ncep_gfs_seamless', newYork)).toContain(
      'ncep_hrrr_conus',
    )
    expect(modelMetaIds('ukmo_seamless', london)).toContain(
      'ukmo_uk_deterministic_2km',
    )
  })
})
