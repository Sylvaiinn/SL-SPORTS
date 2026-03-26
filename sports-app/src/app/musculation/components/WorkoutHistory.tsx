'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  History,
  ChevronDown,
  ChevronUp,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  Dumbbell,
  Clock,
  Weight,
  Pencil,
} from 'lucide-react'
import Link from 'next/link'
import ShareButton from '@/components/ShareButton'

// ── Types ──────────────────────────────────────────────
interface SetRow {
  id: string
  exercise_id: string
  set_number: number
  weight_kg: number | null
  reps: number | null
  notes: string | null
}

interface ExerciseRow {
  id: string
  workout_id: string
  name: string
  order: number
  muscle_groups: string[]
  sets: SetRow[]
}

interface WorkoutRow {
  id: string
  user_id: string
  name: string
  date: string
  duration_minutes: number | null
  notes: string | null
  is_public: boolean
  volume_total_kg: number | null
  template_id: string | null
  created_at: string
  exercises: ExerciseRow[]
}

type PeriodFilter = 'all' | '7' | '30' | '90' | '365'
type SortKey = 'date' | 'volume' | 'duration'

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'all', label: 'Tout' },
  { value: '7', label: '7j' },
  { value: '30', label: '30j' },
  { value: '90', label: '90j' },
  { value: '365', label: '1an' },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date', label: 'Date' },
  { value: 'volume', label: 'Volume' },
  { value: 'duration', label: 'Durée' },
]

// ── Helpers ────────────────────────────────────────────
function getAllMuscles(workouts: WorkoutRow[]): string[] {
  const set = new Set<string>()
  for (const w of workouts) {
    for (const ex of w.exercises ?? []) {
      for (const m of ex.muscle_groups ?? []) {
        set.add(m)
      }
    }
  }
  return Array.from(set).sort()
}

function getDistinctNames(workouts: WorkoutRow[]): string[] {
  const set = new Set<string>()
  for (const w of workouts) {
    if (w.name) set.add(w.name)
  }
  return Array.from(set).sort()
}

function workoutMuscles(w: WorkoutRow): string[] {
  const set = new Set<string>()
  for (const ex of w.exercises ?? []) {
    for (const m of ex.muscle_groups ?? []) {
      set.add(m)
    }
  }
  return Array.from(set)
}

function computeVolume(w: WorkoutRow): number {
  if (w.volume_total_kg != null) return w.volume_total_kg
  let vol = 0
  for (const ex of w.exercises ?? []) {
    for (const s of ex.sets ?? []) {
      vol += (s.weight_kg ?? 0) * (s.reps ?? 0)
    }
  }
  return vol
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ── Badge color cycling ────────────────────────────────
const BADGE_CLASSES = ['badge-blue', 'badge-violet', 'badge-amber', 'badge-green']
function muscleBadgeClass(index: number): string {
  return BADGE_CLASSES[index % BADGE_CLASSES.length]
}

// ── Component ──────────────────────────────────────────
export default function WorkoutHistory() {
  const supabase = createClient()

  const [workouts, setWorkouts] = useState<WorkoutRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filters
  const [period, setPeriod] = useState<PeriodFilter>('all')
  const [nameFilter, setNameFilter] = useState<string>('')
  const [muscleFilter, setMuscleFilter] = useState<string>('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [showFilters, setShowFilters] = useState(false)

  // Expand
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // ── Fetch ──────────────────────────────────────────
  const fetchWorkouts = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data, error } = await supabase
      .from('workouts')
      .select('*, exercises(*, sets(*))')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (!error && data) {
      setWorkouts(data as unknown as WorkoutRow[])
    }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasFetched = useRef(false)
  if (!hasFetched.current) {
    hasFetched.current = true
    fetchWorkouts()
  }

  // ── Derived data ───────────────────────────────────
  const allNames = useMemo(() => getDistinctNames(workouts), [workouts])
  const allMuscles = useMemo(() => getAllMuscles(workouts), [workouts])

  const filtered = useMemo(() => {
    let list = [...workouts]

    // Period
    if (period !== 'all') {
      const days = parseInt(period)
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      list = list.filter(w => new Date(w.date) >= cutoff)
    }

    // Name
    if (nameFilter) {
      list = list.filter(w => w.name === nameFilter)
    }

    // Muscle
    if (muscleFilter) {
      list = list.filter(w => {
        const muscles = workoutMuscles(w)
        return muscles.includes(muscleFilter)
      })
    }

    // Sort
    list.sort((a, b) => {
      if (sortKey === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortKey === 'volume') return computeVolume(b) - computeVolume(a)
      if (sortKey === 'duration') return (b.duration_minutes ?? 0) - (a.duration_minutes ?? 0)
      return 0
    })

    return list
  }, [workouts, period, nameFilter, muscleFilter, sortKey])

  // ── Actions ────────────────────────────────────────
  async function toggleVisibility(w: WorkoutRow) {
    setActionLoading(w.id)
    const { error } = await supabase
      .from('workouts')
      .update({ is_public: !w.is_public })
      .eq('id', w.id)
    if (!error) {
      setWorkouts(prev =>
        prev.map(pw => pw.id === w.id ? { ...pw, is_public: !pw.is_public } : pw)
      )
    }
    setActionLoading(null)
  }

  async function duplicateWorkout(w: WorkoutRow) {
    setActionLoading(w.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setActionLoading(null); return }

    const today = new Date().toISOString().slice(0, 10)

    // Create workout
    const { data: newW, error: wErr } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: w.name,
        date: today,
        duration_minutes: w.duration_minutes,
        notes: w.notes,
        is_public: false,
        volume_total_kg: w.volume_total_kg,
        template_id: w.template_id,
      })
      .select()
      .single()

    if (wErr || !newW) { setActionLoading(null); return }

    // Create exercises and sets
    for (const ex of (w.exercises ?? [])) {
      const { data: newEx, error: exErr } = await supabase
        .from('exercises')
        .insert({
          workout_id: newW.id,
          name: ex.name,
          order: ex.order,
          muscle_groups: ex.muscle_groups,
        })
        .select()
        .single()

      if (exErr || !newEx) continue

      const setsToInsert = (ex.sets ?? []).map(s => ({
        exercise_id: newEx.id,
        set_number: s.set_number,
        weight_kg: s.weight_kg,
        reps: s.reps,
        notes: s.notes,
      }))

      if (setsToInsert.length > 0) {
        await supabase.from('sets').insert(setsToInsert)
      }
    }

    setActionLoading(null)
    await fetchWorkouts()
  }

  async function deleteWorkout(id: string) {
    setActionLoading(id)
    setDeleteConfirmId(null)

    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (!error) {
      setWorkouts(prev => prev.filter(w => w.id !== id))
      if (expandedId === id) setExpandedId(null)
    }
    setActionLoading(null)
  }

  // ── Skeleton ───────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: '7rem', borderRadius: '1rem' }} />
        ))}
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Filter toggle */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setShowFilters(f => !f)}
        style={{ alignSelf: 'flex-start' }}
      >
        <Filter size={14} />
        Filtres
        {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Filters panel */}
      {showFilters && (
        <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Period chips */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
              Période
            </div>
            <div style={{ display: 'flex', gap: '0.375rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {PERIOD_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`btn btn-sm ${period === opt.value ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setPeriod(opt.value)}
                  style={{ flexShrink: 0 }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name filter */}
          {allNames.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                Séance
              </div>
              <select
                className="input"
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              >
                <option value="">Toutes les séances</option>
                {allNames.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}

          {/* Muscle chips */}
          {allMuscles.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                Muscle
              </div>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                <button
                  className={`btn btn-sm ${!muscleFilter ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setMuscleFilter('')}
                >
                  Tous
                </button>
                {allMuscles.map(m => (
                  <button
                    key={m}
                    className={`btn btn-sm ${muscleFilter === m ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setMuscleFilter(muscleFilter === m ? '' : m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
              Trier par
            </div>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`btn btn-sm ${sortKey === opt.value ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setSortKey(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        {filtered.length} séance{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="empty-state">
          <History size={36} />
          <h3>Aucune séance trouvée</h3>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {workouts.length === 0
              ? 'Créez votre première séance pour la voir ici.'
              : 'Modifiez vos filtres pour afficher des résultats.'}
          </p>
        </div>
      )}

      {/* Workout cards */}
      {filtered.map((w, idx) => {
        const muscles = workoutMuscles(w)
        const volume = computeVolume(w)
        const isExpanded = expandedId === w.id
        const isActioning = actionLoading === w.id

        return (
          <div
            key={w.id}
            className="card fade-in"
            style={{ animationDelay: `${idx * 0.04}s`, cursor: 'pointer' }}
          >
            {/* Header row — clickable */}
            <div
              onClick={() => setExpandedId(isExpanded ? null : w.id)}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}
            >
              {/* Top line: name + chevron */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                  <div style={{
                    width: '2rem', height: '2rem', borderRadius: '0.5rem',
                    background: 'var(--accent-violet-glow)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Dumbbell size={14} color="var(--accent-violet)" />
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {w.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                  {w.is_public ? (
                    <Eye size={14} style={{ color: 'var(--accent-green)' }} />
                  ) : (
                    <EyeOff size={14} style={{ color: 'var(--text-muted)' }} />
                  )}
                  {isExpanded ? (
                    <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
                  ) : (
                    <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
              </div>

              {/* Date + stats */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <span>{formatDate(w.date)}</span>
                {w.duration_minutes != null && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {w.duration_minutes} min
                  </span>
                )}
                {volume > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Weight size={12} /> {volume.toLocaleString('fr-FR')} kg
                  </span>
                )}
              </div>

              {/* Muscle badges */}
              {muscles.length > 0 && (
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {muscles.map((m, mi) => (
                    <span key={m} className={`badge ${muscleBadgeClass(mi)}`}>{m}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="fade-in" style={{ marginTop: '1rem' }}>
                <hr className="divider" />

                {/* Exercises */}
                {(w.exercises ?? [])
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map(ex => {
                    const sets = (ex.sets ?? []).slice().sort((a, b) => a.set_number - b.set_number)
                    return (
                      <div key={ex.id} className="exercise-card" style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <div className="set-number">{ex.order + 1}</div>
                          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                            {ex.name}
                          </span>
                        </div>

                        {sets.length > 0 && (
                          <div style={{ display: 'grid', gridTemplateColumns: '2rem 1fr 1fr', gap: '0.375rem' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>#</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Poids</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reps</div>
                            {sets.map(s => (
                              <div key={s.id} style={{ display: 'contents' }}>
                                <div className="set-number">{s.set_number}</div>
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {s.weight_kg != null ? `${s.weight_kg} kg` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {s.reps != null ? `${s.reps} reps` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}

                {/* Notes */}
                {w.notes && (
                  <div style={{
                    padding: '0.75rem', borderRadius: '0.625rem', marginBottom: '0.75rem',
                    background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.3)',
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Notes
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {w.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <ShareButton session={{
                    type: 'muscu',
                    title: w.name,
                    date: w.date,
                    stats: [
                      { label: 'Exercices', value: String((w.exercises ?? []).length) },
                      { label: 'Séries', value: String((w.exercises ?? []).reduce((a: number, e: ExerciseRow) => a + (e.sets ?? []).length, 0)) },
                      ...(w.duration_minutes ? [{ label: 'Durée', value: `${w.duration_minutes} min` }] : []),
                      ...(computeVolume(w) > 0 ? [{ label: 'Volume', value: `${Math.round(computeVolume(w))} kg` }] : []),
                    ],
                    exercises: [...(w.exercises ?? [])].sort((a, b) => a.order - b.order).map((ex: ExerciseRow) => {
                      const sets = (ex.sets ?? [])
                      const best = sets.reduce<SetRow | null>((b, s) => {
                        if (!b) return s
                        if ((s.weight_kg ?? 0) > (b.weight_kg ?? 0)) return s
                        if ((s.weight_kg ?? 0) === (b.weight_kg ?? 0) && (s.reps ?? 0) > (b.reps ?? 0)) return s
                        return b
                      }, null)
                      const topSet = best
                        ? best.weight_kg && best.reps ? `${best.weight_kg} kg × ${best.reps}`
                          : best.weight_kg ? `${best.weight_kg} kg`
                          : best.reps ? `${best.reps} reps`
                          : '—'
                        : '—'
                      return { name: ex.name, topSet }
                    }),
                  }} />
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link
                    href={`/musculation/${w.id}/edit`}
                    className="btn btn-ghost btn-sm"
                    onClick={e => e.stopPropagation()}
                  >
                    <Pencil size={14} />
                    Modifier
                  </Link>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={e => { e.stopPropagation(); toggleVisibility(w) }}
                    disabled={isActioning}
                  >
                    {isActioning ? <Loader2 size={14} className="spin" /> : w.is_public ? <EyeOff size={14} /> : <Eye size={14} />}
                    {w.is_public ? 'Rendre privé' : 'Rendre public'}
                  </button>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={e => { e.stopPropagation(); duplicateWorkout(w) }}
                    disabled={isActioning}
                  >
                    {isActioning ? <Loader2 size={14} className="spin" /> : <Copy size={14} />}
                    Dupliquer
                  </button>

                  {deleteConfirmId === w.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#f87171' }}>Confirmer ?</span>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={e => { e.stopPropagation(); deleteWorkout(w.id) }}
                        disabled={isActioning}
                      >
                        {isActioning ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                        Oui
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={e => { e.stopPropagation(); setDeleteConfirmId(null) }}
                      >
                        Non
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={e => { e.stopPropagation(); setDeleteConfirmId(w.id) }}
                      disabled={isActioning}
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
