'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RotateCcw, Loader2 } from 'lucide-react'

interface Exercise { name: string; order: number; sets: { set_number: number; weight_kg: number | null; reps: number | null }[] }
interface ReprendreButtonProps { workoutId: string; workoutName: string }

export default function ReprendreButton({ workoutId, workoutName }: ReprendreButtonProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleReprendre() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch original workout with exercises + sets
      const { data: original } = await supabase
        .from('workouts').select('*, exercises(*, sets(*))')
        .eq('id', workoutId).single()
      if (!original) return

      const orig = original as unknown as { name: string; exercises: Exercise[] }
      const today = new Date().toISOString().split('T')[0]

      // Clone the workout
      const { data: newWorkout } = await supabase
        .from('workouts')
        .insert({ user_id: user.id, name: `${orig.name} (copie)`, date: today } as never)
        .select().single()
      if (!newWorkout) return

      const nw = newWorkout as unknown as { id: string }

      // Clone exercises + sets
      for (const ex of (orig.exercises ?? [])) {
        const { data: newEx } = await supabase
          .from('exercises')
          .insert({ workout_id: nw.id, name: ex.name, order: ex.order } as never)
          .select().single()
        if (!newEx) continue
        const newExRow = newEx as unknown as { id: string }
        const setsPayload = (ex.sets ?? []).map(s => ({
          exercise_id: newExRow.id,
          set_number: s.set_number,
          weight_kg: s.weight_kg,
          reps: s.reps,
        }))
        if (setsPayload.length > 0) {
          await supabase.from('sets').insert(setsPayload as never)
        }
      }

      router.push(`/musculation/${nw.id}/edit`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleReprendre} disabled={loading} className="btn-reprendre">
      {loading ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
      {loading ? '...' : 'Reprendre'}
    </button>
  )
}
