import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MODEL_IDS,
  MODELS,
  MODEL_BY_ID,
  defaultModelIdsForLocation,
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
})
