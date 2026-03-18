'use client'

import { useState } from 'react'
import { Calendar, Clock, ChevronDown, Eye, Dumbbell } from 'lucide-react'

interface SetRow {
  set_number: number
  weight_kg: number | null
  reps: number | null
}

interface ExerciseRow {
  name: string
  sets: SetRow[]
}

export interface PublicWorkout {
  id: string
  name: string
  date: string
  duration_minutes: number | null
  notes: string | null
  exercises: ExerciseRow[]
}

function WorkoutCard({ w }: { w: PublicWorkout }) {
  const [open, setOpen] = useState(false)
  const exoNames = w.exercises.map(e => e.name)
  const totalSets = w.exercises.reduce((a, e) => a + e.sets.length, 0)
  const totalVolume = w.exercises.reduce((a, e) =>
    a + e.sets.reduce((b, s) => b + (s.weight_kg ?? 0) * (s.reps ?? 0), 0), 0
  )

  return (
    <div style={{ borderRadius: '0.875rem', background: 'var(--bg-secondary)', border: `1px solid ${open ? 'rgba(124,58,237,0.35)' : 'var(--border)'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
      {/* Header — toujours visible */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{ padding: '0.875rem', cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'var(--accent-violet-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Dumbbell size={13} color="var(--accent-violet)" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {w.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Calendar size={10} />
                  {new Date(w.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                {w.duration_minutes && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock size={10} /> {w.duration_minutes} min
                  </span>
                )}
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Eye size={10} /> Public
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {/* Mini stats */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{w.exercises.length} exo{w.exercises.length > 1 ? 's' : ''} · {totalSets} séries</div>
              {totalVolume > 0 && (
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-violet)', fontWeight: 600 }}>{totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${Math.round(totalVolume)} kg`}</div>
              )}
            </div>
            <ChevronDown size={16} color="var(--text-muted)" style={{ transition: 'transform 0.22s', transform: open ? 'rotate(180deg)' : 'none' }} />
          </div>
        </div>

        {/* Badges exercices (collapsed) */}
        {!open && exoNames.length > 0 && (
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {exoNames.slice(0, 4).map(name => (
              <span key={name} className="badge badge-violet" style={{ fontSize: '0.62rem', padding: '0.1rem 0.375rem' }}>{name}</span>
            ))}
            {exoNames.length > 4 && (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+{exoNames.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Détail déroulé */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {w.exercises.map((ex, i) => (
            <div key={i}>
              {/* Nom exercice */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <div style={{ width: '1.375rem', height: '1.375rem', borderRadius: '0.375rem', background: 'var(--accent-violet-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-violet)', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{ex.name}</span>
              </div>

              {/* Séries */}
              {ex.sets.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '1.875rem' }}>
                  {/* Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5rem 1fr 1fr 1fr', gap: '0.5rem', paddingBottom: '0.2rem' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>#</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Poids</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Reps</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Volume</div>
                  </div>
                  {ex.sets.map(s => {
                    const vol = (s.weight_kg ?? 0) * (s.reps ?? 0)
                    return (
                      <div key={s.set_number} style={{ display: 'grid', gridTemplateColumns: '1.5rem 1fr 1fr 1fr', gap: '0.5rem', padding: '0.3rem 0.5rem', borderRadius: '0.375rem', background: 'var(--bg-card)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>{s.set_number}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {s.weight_kg != null ? `${s.weight_kg} kg` : '—'}
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {s.reps != null ? `${s.reps}` : '—'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: vol > 0 ? 'var(--accent-violet)' : 'var(--text-muted)', fontWeight: vol > 0 ? 600 : 400 }}>
                          {vol > 0 ? `${vol} kg` : '—'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ paddingLeft: '1.875rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pas de séries enregistrées</div>
              )}
            </div>
          ))}

          {/* Notes */}
          {w.notes && (
            <div style={{ padding: '0.625rem 0.75rem', borderRadius: '0.625rem', background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              📝 {w.notes}
            </div>
          )}

          {/* Footer récap */}
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', paddingTop: '0.25rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{w.exercises.length}</strong> exercice{w.exercises.length > 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{totalSets}</strong> série{totalSets > 1 ? 's' : ''}
            </span>
            {totalVolume > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-violet)', fontWeight: 700 }}>
                {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(2)} t` : `${Math.round(totalVolume)} kg`} soulevés
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PublicWorkoutList({ workouts }: { workouts: PublicWorkout[] }) {
  if (workouts.length === 0) return null

  return (
    <div className="card">
      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <Dumbbell size={14} color="var(--accent-violet)" /> Séances publiques
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {workouts.map(w => <WorkoutCard key={w.id} w={w} />)}
      </div>
    </div>
  )
}
