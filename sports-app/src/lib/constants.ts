// src/lib/constants.ts

export const RUN_TYPES = ['Endurance', 'Fractionné', 'Tempo', 'Trail', 'Récupération', 'Compétition'] as const
export type RunType = (typeof RUN_TYPES)[number]

export const RUN_SURFACES = ['Route', 'Chemin', 'Piste', 'Tapis', 'Trail'] as const
export type RunSurface = (typeof RUN_SURFACES)[number]

export const RUN_WEATHER = ['Soleil', 'Nuageux', 'Pluie', 'Froid', 'Chaud'] as const
export type RunWeather = (typeof RUN_WEATHER)[number]

export const RECORD_DISTANCES = [
  { label: '1km', km: 1 },
  { label: '5km', km: 5 },
  { label: '10km', km: 10 },
  { label: 'Semi', km: 21.097 },
  { label: 'Marathon', km: 42.195 },
] as const

export const RUN_TYPE_COLORS: Record<RunType, { bg: string; color: string; badge: string }> = {
  Endurance: { bg: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', badge: 'badge-blue' },
  Fractionné: { bg: 'rgba(244,63,94,0.1)', color: '#fb7185', badge: 'badge-rose' },
  Tempo: { bg: 'var(--accent-violet-glow)', color: 'var(--accent-violet)', badge: 'badge-violet' },
  Trail: { bg: 'var(--accent-green-glow)', color: 'var(--accent-green)', badge: 'badge-green' },
  Récupération: { bg: 'var(--accent-teal-glow)', color: 'var(--accent-teal)', badge: 'badge-teal' },
  Compétition: { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', badge: 'badge-amber' },
}

export const WEATHER_ICONS: Record<RunWeather, string> = {
  Soleil: '☀️',
  Nuageux: '☁️',
  Pluie: '🌧️',
  Froid: '❄️',
  Chaud: '🔥',
}

export const SURFACE_ICONS: Record<RunSurface, string> = {
  Route: '🛣️',
  Chemin: '🌲',
  Piste: '🏟️',
  Tapis: '🏠',
  Trail: '⛰️',
}

export const DIFFICULTY_LABELS = ['', 'Facile', 'Modéré', 'Dur', 'Intense', 'Maximal'] as const

export const MAIN_GOALS = ['Perdre du poids', 'Performer', 'Santé', 'Compétition'] as const
export type MainGoal = (typeof MAIN_GOALS)[number]

export const LEVEL_THRESHOLDS = [
  { label: 'Débutant', minSessions: 0, color: '#34d399' },
  { label: 'Intermédiaire', minSessions: 20, color: '#60a5fa' },
  { label: 'Confirmé', minSessions: 50, color: '#a78bfa' },
  { label: 'Expert', minSessions: 100, color: '#fbbf24' },
  { label: 'Élite', minSessions: 200, color: '#f87171' },
] as const
