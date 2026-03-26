export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, Dumbbell, Clock, Eye, EyeOff, Weight } from 'lucide-react'
import WorkoutActions from './WorkoutActions'
import ShareButton from '@/components/ShareButton'

interface SetRow { id: string; set_number: number; weight_kg: number | null; reps: number | null; notes: string | null }
interface ExRow { id: string; name: string; order: number; muscle_groups: string[]; sets: SetRow[] }
interface WorkoutDetailRow { id: string; name: string; date: string; notes: string | null; is_public: boolean; volume_total_kg: number; duration_minutes: number | null; exercises: ExRow[] }

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
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <Link href="/musculation" className="btn btn-ghost btn-sm" style={{ padding: '0.5rem', flexShrink: 0 }}>
              <ChevronLeft size={18} />
            </Link>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: '1.375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{workout.name}</h1>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={13} />
                {new Date(workout.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            <ShareButton session={{
              type: 'muscu',
              title: workout.name,
              date: workout.date,
              stats: [
                { label: 'Exercices', value: String(exercises.length) },
                { label: 'Séries', value: String(exercises.reduce((a: number, e: ExRow) => a + (Array.isArray(e.sets) ? e.sets.length : 0), 0)) },
                ...(workout.duration_minutes ? [{ label: 'Durée', value: `${workout.duration_minutes} min` }] : []),
                ...(workout.volume_total_kg > 0 ? [{ label: 'Volume', value: `${Math.round(workout.volume_total_kg)} kg` }] : []),
              ],
            }} />
            <WorkoutActions workoutId={workout.id} />
          </div>
        </div>
      </div>

      {/* Summary badges */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <span className="badge badge-blue">{exercises.length} exercice{exercises.length > 1 ? 's' : ''}</span>
        <span className="badge badge-violet">{exercises.reduce((a: number, e: ExRow) => a + (Array.isArray(e.sets) ? e.sets.length : 0), 0)} séries</span>
        {workout.duration_minutes != null && (
          <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={11} /> {workout.duration_minutes} min
          </span>
        )}
        {workout.volume_total_kg > 0 && (
          <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Weight size={11} /> {Math.round(workout.volume_total_kg)} kg
          </span>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {workout.is_public ? <Eye size={12} /> : <EyeOff size={12} />}
          {workout.is_public ? 'Public' : 'Privé'}
        </span>
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
                <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem', background: 'var(--accent-violet-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-violet)' }}>
                  {ex.order + 1}
                </div>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{ex.name}</span>
              </div>
              {ex.muscle_groups && ex.muscle_groups.length > 0 && (
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {ex.muscle_groups.map((m: string) => (
                    <span key={m} className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '0.125rem 0.4rem' }}>{m}</span>
                  ))}
                </div>
              )}

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
