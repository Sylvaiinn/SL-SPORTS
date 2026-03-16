export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, Dumbbell } from 'lucide-react'

interface SetRow { id: string; set_number: number; weight_kg: number | null; reps: number | null; notes: string | null }
interface ExRow { id: string; name: string; order: number; sets: SetRow[] }
interface WorkoutDetailRow { id: string; name: string; date: string; notes: string | null; exercises: ExRow[] }

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawWorkout } = await supabase
    .from('workouts')
    .select('*, exercises(*, sets(*))')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!rawWorkout) notFound()

  const workout = rawWorkout as unknown as WorkoutDetailRow
  const exercises = Array.isArray(workout.exercises) ? workout.exercises : []

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link href="/musculation" className="btn btn-ghost btn-sm" style={{ padding: '0.5rem' }}>
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.375rem' }}>{workout.name}</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={13} />
            {new Date(workout.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Summary badges */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <span className="badge badge-blue">{exercises.length} exercice{exercises.length > 1 ? 's' : ''}</span>
        <span className="badge badge-violet">{exercises.reduce((a: number, e: ExRow) => a + (Array.isArray(e.sets) ? e.sets.length : 0), 0)} séries au total</span>
      </div>

      {/* Exercises */}
      {exercises.length === 0 ? (
        <div className="empty-state"><Dumbbell size={36} /><h3>Aucun exercice</h3></div>
      ) : (
        [...exercises].sort((a: ExRow, b: ExRow) => a.order - b.order).map((ex: ExRow) => {
          const sets = Array.isArray(ex.sets) ? ex.sets : []
          return (
            <div key={ex.id} className="exercise-card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem', background: 'var(--accent-blue-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                  {ex.order + 1}
                </div>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{ex.name}</span>
              </div>

              {/* Sets table */}
              <div style={{ display: 'grid', gridTemplateColumns: '2rem 1fr 1fr', gap: '0.375rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>#</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Poids</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reps</div>
                {[...sets].sort((a: SetRow, b: SetRow) => a.set_number - b.set_number).map((s: SetRow) => (
                  <>
                    <div key={`n-${s.id}`} className="set-number">{s.set_number}</div>
                    <div key={`w-${s.id}`} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {s.weight_kg != null ? `${s.weight_kg} kg` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </div>
                    <div key={`r-${s.id}`} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {s.reps != null ? `${s.reps} reps` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </div>
                  </>
                ))}
              </div>
            </div>
          )
        })
      )}

      {workout.notes && (
        <div className="card" style={{ marginTop: '1rem', borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Notes</div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{workout.notes}</p>
        </div>
      )}
    </div>
  )
}
