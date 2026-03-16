// src/lib/templates.ts
export interface TemplateExercise {
  name: string
  sets: number
  reps: string
}

export interface Template {
  id: string
  name: string
  exercises: TemplateExercise[]
}

export const TEMPLATES: Record<string, Template> = {
  A: {
    id: 'A',
    name: 'Template A – Push/Pull/Bas',
    exercises: [
      { name: 'Squat / Presse', sets: 3, reps: '10-12' },
      { name: 'Bench Press', sets: 3, reps: '10-12' },
      { name: 'Rowing barre', sets: 3, reps: '10-12' },
    ],
  },
  B: {
    id: 'B',
    name: 'Template B – Force',
    exercises: [
      { name: 'Soulevé de terre', sets: 3, reps: '10-12' },
      { name: 'Tractions supination', sets: 3, reps: '10-12' },
      { name: 'Bench incliné', sets: 3, reps: '10-12' },
    ],
  },
  C: {
    id: 'C',
    name: 'Template C – OHP',
    exercises: [
      { name: 'Squat / Presse', sets: 3, reps: '10-12' },
      { name: 'Overhead Press', sets: 3, reps: '10-12' },
      { name: 'Tractions pronation', sets: 3, reps: '10-12' },
    ],
  },
}
