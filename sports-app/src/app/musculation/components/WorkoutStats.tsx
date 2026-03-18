'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MUSCLE_GROUPS, MUSCLE_COLORS, calculateVolume, detectMuscleGroups } from '@/lib/muscuConstants'
import RadarChart from './RadarChart'
import MuscleMap from './MuscleMap'
import {
  Trophy,
  Star,
  ChevronDown,
  BarChart3,
  Dumbbell,
  X,
} from 'lucide-react'

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

type Period = 'week' | 'month' | 'year' | 'all'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'Année' },
  { value: 'all', label: 'Tout' },
]

// ── Helpers ────────────────────────────────────────────
function getPeriodDates(period: Period): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date()
  const end = new Date(now)
  let start: Date
  let prevStart: Date
  let prevEnd: Date

  switch (period) {
    case 'week': {
      const day = now.getDay()
      const diff = day === 0 ? 6 : day - 1 // Monday-based
      start = new Date(now)
      start.setDate(now.getDate() - diff)
      start.setHours(0, 0, 0, 0)
      prevEnd = new Date(start)
      prevEnd.setDate(prevEnd.getDate() - 1)
      prevStart = new Date(prevEnd)
      prevStart.setDate(prevStart.getDate() - 6)
      prevStart.setHours(0, 0, 0, 0)
      break
    }
    case 'month': {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      prevEnd = new Date(start)
      prevEnd.setDate(prevEnd.getDate() - 1)
      prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1)
      break
    }
    case 'year': {
      start = new Date(now.getFullYear(), 0, 1)
      prevEnd = new Date(start)
      prevEnd.setDate(prevEnd.getDate() - 1)
      prevStart = new Date(prevEnd.getFullYear(), 0, 1)
      break
    }
    default: {
      start = new Date(0)
      prevStart = new Date(0)
      prevEnd = new Date(0)
      break
    }
  }

  return { start, end, prevStart, prevEnd }
}

function filterByDateRange(workouts: WorkoutRow[], from: Date, to: Date): WorkoutRow[] {
  return workouts.filter(w => {
    const d = new Date(w.date)
    return d >= from && d <= to
  })
}

function computeVolume(w: WorkoutRow): number {
  if (w.volume_total_kg != null && w.volume_total_kg > 0) return w.volume_total_kg
  let vol = 0
  for (const ex of w.exercises ?? []) {
    vol += calculateVolume(ex.sets ?? [])
  }
  return vol
}

function totalVolume(workouts: WorkoutRow[]): number {
  return workouts.reduce((sum, w) => sum + computeVolume(w), 0)
}

function getAllExerciseNames(workouts: WorkoutRow[]): string[] {
  const set = new Set<string>()
  for (const w of workouts) {
    for (const ex of w.exercises ?? []) {
      if (ex.name) set.add(ex.name)
    }
  }
  return Array.from(set).sort()
}

function getMaxWeightOverTime(
  workouts: WorkoutRow[],
  exerciseName: string
): { date: string; weight: number }[] {
  const entries: { date: string; weight: number }[] = []

  const sorted = [...workouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  for (const w of sorted) {
    for (const ex of w.exercises ?? []) {
      if (ex.name !== exerciseName) continue
      const maxW = Math.max(0, ...((ex.sets ?? []).map(s => s.weight_kg ?? 0)))
      if (maxW > 0) {
        entries.push({ date: w.date, weight: maxW })
      }
    }
  }

  return entries
}

function getMuscleSetsVolume(
  workouts: WorkoutRow[]
): Record<string, number> {
  const map: Record<string, number> = {}
  for (const mg of MUSCLE_GROUPS) {
    map[mg] = 0
  }

  for (const w of workouts) {
    for (const ex of w.exercises ?? []) {
      const muscles = ex.muscle_groups?.length
        ? ex.muscle_groups
        : detectMuscleGroups(ex.name)
      const vol = calculateVolume(ex.sets ?? [])
      for (const m of muscles) {
        if (map[m] !== undefined) {
          map[m] += vol
        }
      }
    }
  }

  return map
}

function getFavoriteExercise(
  workouts: WorkoutRow[]
): { name: string; count: number } | null {
  const counts: Record<string, number> = {}
  for (const w of workouts) {
    for (const ex of w.exercises ?? []) {
      const setCount = (ex.sets ?? []).length
      counts[ex.name] = (counts[ex.name] ?? 0) + setCount
    }
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (!sorted.length) return null
  return { name: sorted[0][0], count: sorted[0][1] }
}

function getPersonalRecords(
  workouts: WorkoutRow[]
): { exercise: string; weight: number }[] {
  const records: Record<string, number> = {}
  for (const w of workouts) {
    for (const ex of w.exercises ?? []) {
      const maxW = Math.max(0, ...((ex.sets ?? []).map(s => s.weight_kg ?? 0)))
      if (maxW > 0) {
        records[ex.name] = Math.max(records[ex.name] ?? 0, maxW)
      }
    }
  }
  return Object.entries(records)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([exercise, weight]) => ({ exercise, weight }))
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}

function getWeekBounds(offset: number): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - diff + offset * 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { start: monday, end: sunday }
}

// ── SVG Line Chart ─────────────────────────────────────
function ProgressionChart({
  entries,
}: {
  entries: { date: string; weight: number }[]
}) {
  if (entries.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '1.5rem' }}>
        <BarChart3 size={28} style={{ color: 'var(--text-muted)' }} />
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Pas de données pour cet exercice
        </p>
      </div>
    )
  }

  const W = 400
  const H = 200
  const padX = 40
  const padTop = 20
  const padBot = 30
  const chartW = W - padX * 2
  const chartH = H - padTop - padBot

  const weights = entries.map(e => e.weight)
  const minW = Math.min(...weights) * 0.9
  const maxW = Math.max(...weights) * 1.1
  const rangeW = maxW - minW || 1

  const points = entries.map((e, i) => {
    const x = padX + (entries.length === 1 ? chartW / 2 : (i / (entries.length - 1)) * chartW)
    const y = padTop + chartH - ((e.weight - minW) / rangeW) * chartH
    return { x, y, ...e }
  })

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')
  const areaPath = `M${points[0].x},${padTop + chartH} ${points.map(p => `L${p.x},${p.y}`).join(' ')} L${points[points.length - 1].x},${padTop + chartH} Z`

  const gradientId = `prog-grad-${entries.length}-${entries[0]?.date ?? 'x'}`

  // Show max ~6 labels on x-axis
  const step = Math.max(1, Math.floor(entries.length / 6))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-violet)" stopOpacity={0.25} />
          <stop offset="100%" stopColor="var(--accent-violet)" stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {/* Grid horizontal lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
        const y = padTop + chartH - frac * chartH
        const val = Math.round(minW + frac * rangeW)
        return (
          <g key={i}>
            <line
              x1={padX}
              y1={y}
              x2={padX + chartW}
              y2={y}
              stroke="var(--border)"
              strokeOpacity={0.3}
              strokeDasharray="4 4"
            />
            <text
              x={padX - 6}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fill="var(--text-muted)"
              fontSize={10}
              fontFamily="inherit"
            >
              {val}
            </text>
          </g>
        )
      })}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradientId})`} />

      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke="var(--accent-violet)"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Dots */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="var(--accent-violet)"
          stroke="var(--bg-card)"
          strokeWidth={2}
        />
      ))}

      {/* X-axis labels */}
      {points.map((p, i) => {
        if (i % step !== 0 && i !== points.length - 1) return null
        return (
          <text
            key={`label-${i}`}
            x={p.x}
            y={H - 4}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize={10}
            fontFamily="inherit"
          >
            {formatDateShort(p.date)}
          </text>
        )
      })}
    </svg>
  )
}

// ── Main Component ─────────────────────────────────────
export default function WorkoutStats() {
  const supabase = createClient()

  const [workouts, setWorkouts] = useState<WorkoutRow[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('month')
  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [muscleDetail, setMuscleDetail] = useState<string | null>(null)

  // ── Fetch ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

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

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Derived data ─────────────────────────────────────
  const { start, end } = useMemo(() => getPeriodDates(period), [period])

  const currentWorkouts = useMemo(
    () => (period === 'all' ? workouts : filterByDateRange(workouts, start, end)),
    [workouts, period, start, end]
  )

  const exerciseNames = useMemo(() => getAllExerciseNames(workouts), [workouts])

  // Always use all-time data for progression chart (historique complet = plus pertinent)
  const progressionEntries = useMemo(() => {
    if (!selectedExercise) return []
    return getMaxWeightOverTime(workouts, selectedExercise)
  }, [selectedExercise, workouts])

  // Week vs previous week
  const thisWeek = useMemo(() => {
    const { start: s, end: e } = getWeekBounds(0)
    return filterByDateRange(workouts, s, e)
  }, [workouts])

  const lastWeek = useMemo(() => {
    const { start: s, end: e } = getWeekBounds(-1)
    return filterByDateRange(workouts, s, e)
  }, [workouts])

  // Radar data
  const radarData = useMemo(() => {
    const volMap = getMuscleSetsVolume(currentWorkouts)
    return MUSCLE_GROUPS.map(mg => ({
      label: mg,
      value: volMap[mg],
    }))
  }, [currentWorkouts])

  // Muscle map data (0-1 intensity)
  const muscleMapData = useMemo(() => {
    const volMap = getMuscleSetsVolume(currentWorkouts)
    const maxVol = Math.max(1, ...Object.values(volMap))
    const result: Record<string, number> = {}
    for (const mg of MUSCLE_GROUPS) {
      result[mg] = volMap[mg] / maxVol
    }
    return result
  }, [currentWorkouts])

  // Muscle detail exercises
  const muscleDetailExercises = useMemo(() => {
    if (!muscleDetail) return []
    const map: Record<string, number> = {}
    for (const w of currentWorkouts) {
      for (const ex of w.exercises ?? []) {
        const muscles = ex.muscle_groups?.length
          ? ex.muscle_groups
          : detectMuscleGroups(ex.name)
        if (muscles.includes(muscleDetail)) {
          const vol = calculateVolume(ex.sets ?? [])
          map[ex.name] = (map[ex.name] ?? 0) + vol
        }
      }
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, volume]) => ({ name, volume }))
  }, [muscleDetail, currentWorkouts])

  const favorite = useMemo(() => getFavoriteExercise(currentWorkouts), [currentWorkouts])
  const records = useMemo(() => getPersonalRecords(workouts), [workouts])

  // Set default selected exercise
  useEffect(() => {
    if (!selectedExercise && exerciseNames.length > 0) {
      setSelectedExercise(exerciseNames[0])
    }
  }, [exerciseNames, selectedExercise])

  // ── Skeleton ─────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="skeleton" style={{ height: '2.5rem', borderRadius: '0.75rem', maxWidth: 320 }} />
        <div className="skeleton" style={{ height: '7rem', borderRadius: '1rem' }} />
        <div className="skeleton" style={{ height: '14rem', borderRadius: '1rem' }} />
        <div className="skeleton" style={{ height: '10rem', borderRadius: '1rem' }} />
        <div className="skeleton" style={{ height: '18rem', borderRadius: '1rem' }} />
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Period selector */}
      <div style={{ display: 'flex', gap: '0.375rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {PERIOD_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`btn btn-sm ${period === opt.value ? '' : 'btn-ghost'}`}
            onClick={() => setPeriod(opt.value)}
            style={
              period === opt.value
                ? { background: 'var(--accent-violet)', color: 'white', flexShrink: 0 }
                : { flexShrink: 0 }
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Progression par exercice */}
      <div className="card">
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}
        >
          Progression par exercice
        </div>
        {exerciseNames.length > 0 ? (
          <>
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <select
                className="input"
                value={selectedExercise}
                onChange={e => setSelectedExercise(e.target.value)}
                style={{ fontSize: '0.875rem', paddingRight: '2rem' }}
              >
                {exerciseNames.map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
            </div>
            <ProgressionChart entries={progressionEntries} />
          </>
        ) : (
          <div className="empty-state" style={{ padding: '1.5rem' }}>
            <Dumbbell size={28} style={{ color: 'var(--text-muted)' }} />
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Aucun exercice enregistré
            </p>
          </div>
        )}
      </div>

      {/* Semaine vs semaine précédente */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
        }}
      >
        <div className="card">
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '0.375rem',
            }}
          >
            Séances cette sem.
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {thisWeek.length}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              vs {lastWeek.length}
            </span>
          </div>
        </div>
        <div className="card">
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '0.375rem',
            }}
          >
            Volume cette sem.
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {totalVolume(thisWeek).toLocaleString('fr-FR')}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              vs {totalVolume(lastWeek).toLocaleString('fr-FR')} kg
            </span>
          </div>
        </div>
      </div>

      {/* Radar chart */}
      <div className="card">
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}
        >
          Répartition musculaire
        </div>
        <RadarChart data={radarData} />
      </div>

      {/* Muscle map */}
      <div className="card">
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}
        >
          Carte musculaire
        </div>
        <MuscleMap
          data={muscleMapData}
          onSelect={muscle => setMuscleDetail(muscleDetail === muscle ? null : muscle)}
        />

        {/* Muscle detail panel */}
        {muscleDetail && (
          <div className="fade-in" style={{ marginTop: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: MUSCLE_COLORS[muscleDetail] ?? 'var(--accent-blue)',
                  }}
                />
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  {muscleDetail}
                </span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setMuscleDetail(null)}
                style={{ padding: '0.25rem' }}
              >
                <X size={14} />
              </button>
            </div>
            {muscleDetailExercises.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {muscleDetailExercises.map(ex => (
                  <div
                    key={ex.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.625rem',
                      background: 'var(--bg-secondary)',
                    }}
                  >
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {ex.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {ex.volume.toLocaleString('fr-FR')} kg
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Aucun exercice pour ce muscle sur cette période.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Exercice favori + Records */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
        }}
      >
        {/* Favori */}
        <div className="card">
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            Exercice favori
          </div>
          {favorite ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Star size={14} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {favorite.name}
                </span>
              </div>
              <span className="badge badge-blue">{favorite.count} séries</span>
            </div>
          ) : (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>—</span>
          )}
        </div>

        {/* Records perso (top cell, spanning detail below) */}
        <div className="card">
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <Trophy size={12} style={{ color: 'var(--accent-amber)' }} />
            Records perso
          </div>
          {records.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {records.map((r, i) => (
                <div
                  key={r.exercise}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: i === 0 ? 'var(--accent-amber)' : 'var(--text-secondary)',
                      fontWeight: i === 0 ? 700 : 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}
                  >
                    {r.exercise}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      flexShrink: 0,
                    }}
                  >
                    {r.weight} kg
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>—</span>
          )}
        </div>
      </div>
    </div>
  )
}
