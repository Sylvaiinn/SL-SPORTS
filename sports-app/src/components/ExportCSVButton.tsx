'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, Loader2 } from 'lucide-react'

interface SetRow { set_number: number; weight_kg: number | null; reps: number | null }
interface ExerciseRow { name: string; order: number; sets: SetRow[] }
interface WorkoutRow { id: string; name: string; date: string; duration_minutes: number | null; notes: string | null; exercises: ExerciseRow[] }

export default function ExportCSVButton() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('workouts')
        .select('id, name, date, duration_minutes, notes, exercises(name, order, sets(set_number, weight_kg, reps))')
        .order('date', { ascending: false })

      const workouts = (data ?? []) as unknown as WorkoutRow[]

      const rows: string[] = ['Séance;Date;Durée (min);Exercice;Série;Poids (kg);Reps;Notes']

      for (const w of workouts) {
        const exos = Array.isArray(w.exercises) ? w.exercises : []
        if (exos.length === 0) {
          rows.push(`"${w.name}";"${w.date}";${w.duration_minutes ?? ''};;;;;${w.notes ? `"${w.notes}"` : ''}`)
          continue
        }
        for (const ex of exos.sort((a, b) => a.order - b.order)) {
          const sets = Array.isArray(ex.sets) ? ex.sets.sort((a, b) => a.set_number - b.set_number) : []
          if (sets.length === 0) {
            rows.push(`"${w.name}";"${w.date}";${w.duration_minutes ?? ''};"${ex.name}";;;;"${w.notes ?? ''}"`)
            continue
          }
          for (const s of sets) {
            rows.push(`"${w.name}";"${w.date}";${w.duration_minutes ?? ''};"${ex.name}";${s.set_number};${s.weight_kg ?? ''};${s.reps ?? ''};"${w.notes ?? ''}"`)
          }
        }
      }

      const csv = rows.join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `SPORTS_SL_musculation_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleExport} disabled={loading} className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }} title="Exporter en CSV">
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      CSV
    </button>
  )
}
