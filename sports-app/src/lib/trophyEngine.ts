// src/lib/trophyEngine.ts

import { LEVEL_THRESHOLDS } from './constants'

export interface TrophyStats {
  totalSessions: number
  totalWorkouts: number
  totalSwims: number
  totalRuns: number
  totalRunKm: number
  totalSwimKm: number
  currentStreak: number
  bestStreak: number
  hasAllSportsInWeek: boolean
  hasEarlySession: boolean
  hasLateSession: boolean
  hasBrokenRecord: boolean
  sessionsThisWeek: number
}

export interface TrophyDefinition {
  key: string
  name: string
  description: string
  icon: string
  check: (stats: TrophyStats) => boolean
  progress: (stats: TrophyStats) => { current: number; target: number }
}

export const TROPHY_DEFINITIONS: TrophyDefinition[] = [
  {
    key: 'first_session',
    name: 'Premiers pas',
    description: '1ère séance enregistrée',
    icon: '🏃',
    check: (s) => s.totalSessions >= 1,
    progress: (s) => ({ current: Math.min(s.totalSessions, 1), target: 1 }),
  },
  {
    key: 'streak_7',
    name: 'Régulier',
    description: '7 jours consécutifs',
    icon: '🔥',
    check: (s) => s.bestStreak >= 7,
    progress: (s) => ({ current: Math.min(s.bestStreak, 7), target: 7 }),
  },
  {
    key: 'century',
    name: 'Century',
    description: '100 séances totales',
    icon: '💯',
    check: (s) => s.totalSessions >= 100,
    progress: (s) => ({ current: Math.min(s.totalSessions, 100), target: 100 }),
  },
  {
    key: 'centurion',
    name: 'Centurion',
    description: '100km courus',
    icon: '🛣️',
    check: (s) => s.totalRunKm >= 100,
    progress: (s) => ({ current: Math.min(Math.round(s.totalRunKm), 100), target: 100 }),
  },
  {
    key: 'poisson',
    name: 'Poisson',
    description: '50km nagés',
    icon: '🐟',
    check: (s) => s.totalSwimKm >= 50,
    progress: (s) => ({ current: Math.min(Math.round(s.totalSwimKm), 50), target: 50 }),
  },
  {
    key: 'ironman',
    name: 'Ironman',
    description: 'Muscu + natation + course la même semaine',
    icon: '🏆',
    check: (s) => s.hasAllSportsInWeek,
    progress: (s) => ({ current: s.hasAllSportsInWeek ? 1 : 0, target: 1 }),
  },
  {
    key: 'early_bird',
    name: 'Lève-tôt',
    description: 'Séance avant 7h',
    icon: '🌅',
    check: (s) => s.hasEarlySession,
    progress: (s) => ({ current: s.hasEarlySession ? 1 : 0, target: 1 }),
  },
  {
    key: 'night_owl',
    name: 'Nocturne',
    description: 'Séance après 21h',
    icon: '🌙',
    check: (s) => s.hasLateSession,
    progress: (s) => ({ current: s.hasLateSession ? 1 : 0, target: 1 }),
  },
  {
    key: 'record_breaker',
    name: 'Record brisé',
    description: 'Battre un record personnel',
    icon: '⚡',
    check: (s) => s.hasBrokenRecord,
    progress: (s) => ({ current: s.hasBrokenRecord ? 1 : 0, target: 1 }),
  },
  {
    key: 'streak_30',
    name: 'Fidèle',
    description: '30 jours consécutifs',
    icon: '💎',
    check: (s) => s.bestStreak >= 30,
    progress: (s) => ({ current: Math.min(s.bestStreak, 30), target: 30 }),
  },
  {
    key: 'explosive',
    name: 'Explosif',
    description: '5 séances en une semaine',
    icon: '💥',
    check: (s) => s.sessionsThisWeek >= 5,
    progress: (s) => ({ current: Math.min(s.sessionsThisWeek, 5), target: 5 }),
  },
]

/** Returns trophy keys that are newly unlocked */
export function checkTrophies(stats: TrophyStats, alreadyUnlocked: string[]): string[] {
  return TROPHY_DEFINITIONS
    .filter(t => t.check(stats) && !alreadyUnlocked.includes(t.key))
    .map(t => t.key)
}

/** Calculate user level based on total sessions */
export function calculateLevel(totalSessions: number): { label: string; color: string } {
  let level = LEVEL_THRESHOLDS[0]
  for (const t of LEVEL_THRESHOLDS) {
    if (totalSessions >= t.minSessions) level = t
  }
  return { label: level.label, color: level.color }
}

/** Calculate next level progress */
export function nextLevelProgress(totalSessions: number): { current: number; target: number; label: string } | null {
  for (let i = 0; i < LEVEL_THRESHOLDS.length - 1; i++) {
    if (totalSessions < LEVEL_THRESHOLDS[i + 1].minSessions) {
      return {
        current: totalSessions - LEVEL_THRESHOLDS[i].minSessions,
        target: LEVEL_THRESHOLDS[i + 1].minSessions - LEVEL_THRESHOLDS[i].minSessions,
        label: LEVEL_THRESHOLDS[i + 1].label,
      }
    }
  }
  return null
}
