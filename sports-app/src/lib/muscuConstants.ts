// Muscle group definitions for musculation
export const MUSCLE_GROUPS = [
  'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps',
  'Quadriceps', 'Ischio-jambiers', 'Fessiers', 'Abdominaux', 'Mollets',
] as const

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]

export const MUSCLE_COLORS: Record<string, string> = {
  Pectoraux: '#3b82f6',
  Dos: '#8b5cf6',
  Épaules: '#f59e0b',
  Biceps: '#ef4444',
  Triceps: '#ec4899',
  Quadriceps: '#10b981',
  'Ischio-jambiers': '#14b8a6',
  Fessiers: '#f97316',
  Abdominaux: '#6366f1',
  Mollets: '#84cc16',
}

export const EXERCISE_MUSCLE_MAP: { keywords: string[]; muscles: MuscleGroup[] }[] = [
  { keywords: ['squat', 'presse', 'leg press', 'fente', 'hack', 'leg extension'], muscles: ['Quadriceps', 'Fessiers'] },
  { keywords: ['soulevé', 'deadlift', 'rdl', 'roumain'], muscles: ['Ischio-jambiers', 'Dos', 'Fessiers'] },
  { keywords: ['bench', 'développé couché', 'dips', 'écart', 'pec fly', 'pec deck', 'butterfly'], muscles: ['Pectoraux', 'Triceps'] },
  { keywords: ['incliné', 'développé incliné'], muscles: ['Pectoraux', 'Épaules'] },
  { keywords: ['rowing', 'tirage', 'traction', 'pull', 'lat'], muscles: ['Dos', 'Biceps'] },
  { keywords: ['overhead', 'épaules', 'military', 'latéral', 'oiseau', 'deltoïde', 'ohp'], muscles: ['Épaules'] },
  { keywords: ['curl', 'bicep', 'marteau', 'hammer'], muscles: ['Biceps'] },
  { keywords: ['tricep', 'extension', 'pushdown', 'skull crusher', 'kickback'], muscles: ['Triceps'] },
  { keywords: ['mollet', 'calf'], muscles: ['Mollets'] },
  { keywords: ['crunch', 'planche', 'gainage', 'abdos', 'core', 'sit-up'], muscles: ['Abdominaux'] },
  { keywords: ['leg curl', 'ischios', 'ischio'], muscles: ['Ischio-jambiers'] },
  { keywords: ['hip thrust', 'pont', 'glute', 'fessier'], muscles: ['Fessiers'] },
]

export function detectMuscleGroups(exerciseName: string): MuscleGroup[] {
  const lower = exerciseName.toLowerCase()
  for (const { keywords, muscles } of EXERCISE_MUSCLE_MAP) {
    if (keywords.some(k => lower.includes(k))) return muscles
  }
  return []
}

export function calculateVolume(sets: { weight_kg: number | null; reps: number | null }[]): number {
  return sets.reduce((sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0), 0)
}

export const TEMPLATE_ICONS = ['💪', '🏋️', '⚡', '🔥', '💎', '🎯', '🦾', '🏆', '⭐', '🚀']
export const TEMPLATE_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16']

export const REST_TIMES = [30, 60, 90, 120, 150, 180] as const
