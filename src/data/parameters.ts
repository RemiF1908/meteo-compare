import type { ParameterInfo, TimeMode } from '../types'

const HOURLY: ParameterInfo[] = [
  { id: 'temperature_2m', label: 'Température à 2 m', shortLabel: 'Température', unit: '°C', group: 'Température', kind: 'line', mode: 'hourly' },
  { id: 'apparent_temperature', label: 'Température ressentie', shortLabel: 'Ressenti', unit: '°C', group: 'Température', kind: 'line', mode: 'hourly' },
  { id: 'dew_point_2m', label: 'Point de rosée', shortLabel: 'Point de rosée', unit: '°C', group: 'Température', kind: 'line', mode: 'hourly' },
  { id: 'wet_bulb_temperature_2m', label: 'Température humide', shortLabel: 'T. humide', unit: '°C', group: 'Température', kind: 'line', mode: 'hourly' },
  { id: 'soil_temperature_0cm', label: 'Température du sol (0 cm)', shortLabel: 'Sol 0 cm', unit: '°C', group: 'Température', kind: 'line', mode: 'hourly' },
  { id: 'soil_temperature_6cm', label: 'Température du sol (6 cm)', shortLabel: 'Sol 6 cm', unit: '°C', group: 'Température', kind: 'line', mode: 'hourly' },
  { id: 'soil_temperature_18cm', label: 'Température du sol (18 cm)', shortLabel: 'Sol 18 cm', unit: '°C', group: 'Température', kind: 'line', mode: 'hourly' },
  { id: 'soil_temperature_54cm', label: 'Température du sol (54 cm)', shortLabel: 'Sol 54 cm', unit: '°C', group: 'Température', kind: 'line', mode: 'hourly' },

  { id: 'relative_humidity_2m', label: 'Humidité relative à 2 m', shortLabel: 'Humidité', unit: '%', group: 'Humidité', kind: 'line', mode: 'hourly' },
  { id: 'vapour_pressure_deficit', label: 'Déficit de pression de vapeur', shortLabel: 'VPD', unit: 'kPa', group: 'Humidité', kind: 'line', mode: 'hourly' },

  { id: 'precipitation', label: 'Précipitations', shortLabel: 'Précipitations', unit: 'mm', group: 'Précipitations', kind: 'line', mode: 'hourly' },
  { id: 'rain', label: 'Pluie', shortLabel: 'Pluie', unit: 'mm', group: 'Précipitations', kind: 'line', mode: 'hourly' },
  { id: 'showers', label: 'Averses', shortLabel: 'Averses', unit: 'mm', group: 'Précipitations', kind: 'line', mode: 'hourly' },
  { id: 'snowfall', label: 'Neige', shortLabel: 'Neige', unit: 'cm', group: 'Précipitations', kind: 'line', mode: 'hourly' },
  { id: 'precipitation_probability', label: 'Probabilité de précipitations', shortLabel: 'Prob. pluie', unit: '%', group: 'Précipitations', kind: 'line', mode: 'hourly' },
  { id: 'snow_depth', label: 'Hauteur de neige', shortLabel: 'Hauteur neige', unit: 'cm', group: 'Précipitations', kind: 'line', mode: 'hourly' },
  { id: 'weather_code', label: 'Code météo (WMO)', shortLabel: 'Code météo', unit: '', group: 'Précipitations', kind: 'code', mode: 'hourly' },

  { id: 'wind_speed_10m', label: 'Vitesse du vent à 10 m', shortLabel: 'Vent 10 m', unit: 'km/h', group: 'Vent', kind: 'line', mode: 'hourly' },
  { id: 'wind_speed_80m', label: 'Vitesse du vent à 80 m', shortLabel: 'Vent 80 m', unit: 'km/h', group: 'Vent', kind: 'line', mode: 'hourly' },
  { id: 'wind_speed_120m', label: 'Vitesse du vent à 120 m', shortLabel: 'Vent 120 m', unit: 'km/h', group: 'Vent', kind: 'line', mode: 'hourly' },
  { id: 'wind_speed_180m', label: 'Vitesse du vent à 180 m', shortLabel: 'Vent 180 m', unit: 'km/h', group: 'Vent', kind: 'line', mode: 'hourly' },
  { id: 'wind_gusts_10m', label: 'Rafales à 10 m', shortLabel: 'Rafales', unit: 'km/h', group: 'Vent', kind: 'line', mode: 'hourly' },
  { id: 'wind_direction_10m', label: 'Direction du vent à 10 m', shortLabel: 'Direction 10 m', unit: '°', group: 'Vent', kind: 'direction', mode: 'hourly' },
  { id: 'wind_direction_80m', label: 'Direction du vent à 80 m', shortLabel: 'Direction 80 m', unit: '°', group: 'Vent', kind: 'direction', mode: 'hourly' },
  { id: 'wind_direction_120m', label: 'Direction du vent à 120 m', shortLabel: 'Direction 120 m', unit: '°', group: 'Vent', kind: 'direction', mode: 'hourly' },
  { id: 'wind_direction_180m', label: 'Direction du vent à 180 m', shortLabel: 'Direction 180 m', unit: '°', group: 'Vent', kind: 'direction', mode: 'hourly' },

  { id: 'pressure_msl', label: 'Pression au niveau de la mer', shortLabel: 'Pression MSL', unit: 'hPa', group: 'Pression', kind: 'line', mode: 'hourly' },
  { id: 'surface_pressure', label: 'Pression de surface', shortLabel: 'Pression surface', unit: 'hPa', group: 'Pression', kind: 'line', mode: 'hourly' },

  { id: 'cloud_cover', label: 'Couverture nuageuse totale', shortLabel: 'Nuages', unit: '%', group: 'Nuages', kind: 'line', mode: 'hourly' },
  { id: 'cloud_cover_low', label: 'Nuages bas', shortLabel: 'Nuages bas', unit: '%', group: 'Nuages', kind: 'line', mode: 'hourly' },
  { id: 'cloud_cover_mid', label: 'Nuages moyens', shortLabel: 'Nuages moyens', unit: '%', group: 'Nuages', kind: 'line', mode: 'hourly' },
  { id: 'cloud_cover_high', label: 'Nuages hauts', shortLabel: 'Nuages hauts', unit: '%', group: 'Nuages', kind: 'line', mode: 'hourly' },

  { id: 'shortwave_radiation', label: 'Rayonnement global', shortLabel: 'Rayonnement', unit: 'W/m²', group: 'Rayonnement', kind: 'line', mode: 'hourly' },
  { id: 'direct_radiation', label: 'Rayonnement direct', shortLabel: 'Ray. direct', unit: 'W/m²', group: 'Rayonnement', kind: 'line', mode: 'hourly' },
  { id: 'diffuse_radiation', label: 'Rayonnement diffus', shortLabel: 'Ray. diffus', unit: 'W/m²', group: 'Rayonnement', kind: 'line', mode: 'hourly' },
  { id: 'direct_normal_irradiance', label: 'Irradiance normale directe', shortLabel: 'DNI', unit: 'W/m²', group: 'Rayonnement', kind: 'line', mode: 'hourly' },
  { id: 'uv_index', label: 'Indice UV', shortLabel: 'UV', unit: '', group: 'Rayonnement', kind: 'line', mode: 'hourly' },
  { id: 'sunshine_duration', label: 'Durée d’ensoleillement', shortLabel: 'Ensoleillement', unit: 's', group: 'Rayonnement', kind: 'line', mode: 'hourly' },

  { id: 'visibility', label: 'Visibilité', shortLabel: 'Visibilité', unit: 'm', group: 'Divers', kind: 'line', mode: 'hourly' },
  { id: 'cape', label: 'Énergie convective (CAPE)', shortLabel: 'CAPE', unit: 'J/kg', group: 'Divers', kind: 'line', mode: 'hourly' },
  { id: 'freezing_level_height', label: 'Altitude du niveau de gel', shortLabel: 'Niveau de gel', unit: 'm', group: 'Divers', kind: 'line', mode: 'hourly' },
  { id: 'et0_fao_evapotranspiration', label: 'Évapotranspiration ET₀', shortLabel: 'ET₀', unit: 'mm', group: 'Divers', kind: 'line', mode: 'hourly' },
  { id: 'is_day', label: 'Jour / nuit', shortLabel: 'Jour/nuit', unit: '', group: 'Divers', kind: 'line', mode: 'hourly' },
]

const DAILY: ParameterInfo[] = [
  { id: 'temperature_2m_max', label: 'Température maximale', shortLabel: 'T max', unit: '°C', group: 'Température', kind: 'line', mode: 'daily' },
  { id: 'temperature_2m_min', label: 'Température minimale', shortLabel: 'T min', unit: '°C', group: 'Température', kind: 'line', mode: 'daily' },
  { id: 'temperature_2m_mean', label: 'Température moyenne', shortLabel: 'T moy', unit: '°C', group: 'Température', kind: 'line', mode: 'daily' },
  { id: 'apparent_temperature_max', label: 'Ressenti maximal', shortLabel: 'Ressenti max', unit: '°C', group: 'Température', kind: 'line', mode: 'daily' },
  { id: 'apparent_temperature_min', label: 'Ressenti minimal', shortLabel: 'Ressenti min', unit: '°C', group: 'Température', kind: 'line', mode: 'daily' },

  { id: 'relative_humidity_2m_mean', label: 'Humidité relative moyenne', shortLabel: 'Humidité moy', unit: '%', group: 'Humidité', kind: 'line', mode: 'daily' },

  { id: 'precipitation_sum', label: 'Cumul de précipitations', shortLabel: 'Précipitations', unit: 'mm', group: 'Précipitations', kind: 'line', mode: 'daily' },
  { id: 'rain_sum', label: 'Cumul de pluie', shortLabel: 'Pluie', unit: 'mm', group: 'Précipitations', kind: 'line', mode: 'daily' },
  { id: 'showers_sum', label: 'Cumul d’averses', shortLabel: 'Averses', unit: 'mm', group: 'Précipitations', kind: 'line', mode: 'daily' },
  { id: 'snowfall_sum', label: 'Cumul de neige', shortLabel: 'Neige', unit: 'cm', group: 'Précipitations', kind: 'line', mode: 'daily' },
  { id: 'precipitation_probability_max', label: 'Probabilité max de précipitations', shortLabel: 'Prob. pluie max', unit: '%', group: 'Précipitations', kind: 'line', mode: 'daily' },
  { id: 'precipitation_hours', label: 'Heures de précipitations', shortLabel: 'Heures pluie', unit: 'h', group: 'Précipitations', kind: 'line', mode: 'daily' },
  { id: 'weather_code', label: 'Code météo (WMO)', shortLabel: 'Code météo', unit: '', group: 'Précipitations', kind: 'code', mode: 'daily' },

  { id: 'wind_speed_10m_max', label: 'Vent maximal à 10 m', shortLabel: 'Vent max', unit: 'km/h', group: 'Vent', kind: 'line', mode: 'daily' },
  { id: 'wind_gusts_10m_max', label: 'Rafales maximales', shortLabel: 'Rafales max', unit: 'km/h', group: 'Vent', kind: 'line', mode: 'daily' },
  { id: 'wind_direction_10m_dominant', label: 'Direction dominante du vent', shortLabel: 'Direction dominante', unit: '°', group: 'Vent', kind: 'direction', mode: 'daily' },

  { id: 'pressure_msl_mean', label: 'Pression moyenne MSL', shortLabel: 'Pression moy', unit: 'hPa', group: 'Pression', kind: 'line', mode: 'daily' },

  { id: 'cloud_cover_mean', label: 'Couverture nuageuse moyenne', shortLabel: 'Nuages moy', unit: '%', group: 'Nuages', kind: 'line', mode: 'daily' },

  { id: 'shortwave_radiation_sum', label: 'Rayonnement global cumulé', shortLabel: 'Rayonnement', unit: 'MJ/m²', group: 'Rayonnement', kind: 'line', mode: 'daily' },
  { id: 'uv_index_max', label: 'Indice UV maximal', shortLabel: 'UV max', unit: '', group: 'Rayonnement', kind: 'line', mode: 'daily' },
  { id: 'sunshine_duration', label: 'Durée d’ensoleillement', shortLabel: 'Ensoleillement', unit: 's', group: 'Rayonnement', kind: 'line', mode: 'daily' },
  { id: 'daylight_duration', label: 'Durée du jour', shortLabel: 'Durée du jour', unit: 's', group: 'Rayonnement', kind: 'line', mode: 'daily' },

  { id: 'visibility_min', label: 'Visibilité minimale', shortLabel: 'Visibilité min', unit: 'm', group: 'Divers', kind: 'line', mode: 'daily' },
  { id: 'cape_max', label: 'CAPE maximal', shortLabel: 'CAPE max', unit: 'J/kg', group: 'Divers', kind: 'line', mode: 'daily' },
  { id: 'et0_fao_evapotranspiration_sum', label: 'Évapotranspiration ET₀ cumulée', shortLabel: 'ET₀', unit: 'mm', group: 'Divers', kind: 'line', mode: 'daily' },
]

export const PARAMETERS_BY_MODE: Record<TimeMode, ParameterInfo[]> = {
  hourly: HOURLY,
  daily: DAILY,
}

export const PARAMETER_MAP: Record<TimeMode, Map<string, ParameterInfo>> = {
  hourly: new Map(HOURLY.map((parameter) => [parameter.id, parameter])),
  daily: new Map(DAILY.map((parameter) => [parameter.id, parameter])),
}

export const PARAMETER_GROUPS: Record<TimeMode, string[]> = {
  hourly: [...new Set(HOURLY.map((parameter) => parameter.group))],
  daily: [...new Set(DAILY.map((parameter) => parameter.group))],
}

export const DEFAULT_PARAMETER_IDS: Record<TimeMode, string[]> = {
  hourly: ['temperature_2m'],
  daily: ['temperature_2m_max'],
}

export function getParameter(mode: TimeMode, id: string): ParameterInfo | undefined {
  return PARAMETER_MAP[mode].get(id)
}

export function parameterUnit(mode: TimeMode, id: string): string {
  return getParameter(mode, id)?.unit ?? ''
}

export function parameterLabel(mode: TimeMode, id: string): string {
  return getParameter(mode, id)?.label ?? id
}

export function parameterShortLabel(mode: TimeMode, id: string): string {
  return getParameter(mode, id)?.shortLabel ?? id
}
