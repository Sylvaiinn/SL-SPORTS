/**
 * Auto-detect muscle groups from exercise names.
 * Maps common French/English exercise names to muscle groups.
 */

const MUSCLE_MAP: { keywords: string[]; muscles: string }[] = [
  { keywords: ['squat', 'presse', 'leg press', 'fente', 'hack'], muscles: 'Quadriceps · Fessiers' },
  { keywords: ['soulevé', 'deadlift', 'rdl', 'roumain'], muscles: 'Ischio · Dos · Fessiers' },
  { keywords: ['bench', 'développé', 'incliné', 'dips', 'écart', 'pec'], muscles: 'Pectoraux · Épaules' },
  { keywords: ['rowing', 'tirage', 'traction', 'pull', 'curl dos'], muscles: 'Dos · Biceps' },
  { keywords: ['overhead', 'épaules', 'military', 'latéral', 'oiseau', 'deltoïdes'], muscles: 'Épaules' },
  { keywords: ['curl', 'bicep', 'marteau'], muscles: 'Biceps' },
  { keywords: ['tricep', 'extension', 'pushdown', 'dips tricep'], muscles: 'Triceps' },
  { keywords: ['mollet', 'calf'], muscles: 'Mollets' },
  { keywords: ['ab', 'crunch', 'planche', 'gainage', 'abdos', 'core'], muscles: 'Abdominaux' },
  { keywords: ['leg curl', 'ischios', 'ischio'], muscles: 'Ischio-jambiers' },
]

export function detectMuscles(exerciseNames: string[]): string {
  if (!exerciseNames || exerciseNames.length === 0) return ''

  const all = exerciseNames.join(' ').toLowerCase()
  const found: string[] = []

  for (const { keywords, muscles } of MUSCLE_MAP) {
    if (keywords.some(k => all.includes(k))) {
      found.push(muscles)
    }
  }

  if (found.length === 0) return ''
  // Return at most 2 muscle group labels
  return found.slice(0, 2).join(' · ')
}

/**
 * Calculate current streak of consecutive active days.
 * dates: array of 'YYYY-MM-DD' strings (sorted desc or unsorted)
 */
export function calculateStreak(dates: string[]): number {
  if (!dates || dates.length === 0) return 0

  // Unique dates only
  const unique = [...new Set(dates)].sort().reverse()  // newest first

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let checkDate = new Date(today)

  for (const dateStr of unique) {
    const d = new Date(dateStr)
    d.setHours(0, 0, 0, 0)
    const diff = Math.round((checkDate.getTime() - d.getTime()) / 86400000)

    if (diff === 0) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (diff === 1) {
      streak++
      checkDate = new Date(d)
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

/**
 * Week boundary helpers (Mon-Sun weeks)
 */
export function getCurrentWeekBounds(): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getDay() // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day)  // Monday
  const start = new Date(now)
  start.setDate(now.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export function getLastWeekBounds(): { start: Date; end: Date } {
  const { start } = getCurrentWeekBounds()
  const end = new Date(start)
  end.setDate(start.getDate() - 1)
  end.setHours(23, 59, 59, 999)
  const s = new Date(end)
  s.setDate(end.getDate() - 6)
  s.setHours(0, 0, 0, 0)
  return { start: s, end }
}

export function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}
