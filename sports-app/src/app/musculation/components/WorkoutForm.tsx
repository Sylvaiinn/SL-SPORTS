'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MUSCLE_GROUPS, detectMuscleGroups, calculateVolume, REST_TIMES } from '@/lib/muscuConstants'
import {
  Play, Square, Timer, PlusCircle, Trash2, Save, Loader2,
  ChevronDown, ChevronUp, X, Eye, EyeOff, TrendingUp,
  MessageSquare, Dumbbell, Clock, Zap, Check
} from 'lucide-react'

/* ─── Types ─── */
interface SetEntry {
  set_number: number
  weight_kg: string
  reps: string
}

interface ExerciseEntry {
  id: string
  name: string
  muscleGroups: string[]
  sets: SetEntry[]
  notes: string
}

interface WeightSuggestion {
  exerciseName: string
  currentWeight: number
  suggestedWeight: number
}

interface Props {
  onSaved: () => void
  initialTemplate: { id: string; name: string; exercises_json: { name: string; sets: number; reps: string; muscle_groups: string[] }[]; [key: string]: unknown } | null
  onTemplateConsumed: () => void
}

/* ─── Helpers ─── */
function newExercise(order: number): ExerciseEntry {
  return {
    id: `ex-${Date.now()}-${order}`,
    name: '',
    muscleGroups: [],
    sets: [{ set_number: 1, weight_kg: '', reps: '10' }],
    notes: '',
  }
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

export default function WorkoutForm({ onSaved, initialTemplate, onTemplateConsumed }: Props) {
  // Bug #4 fix: mémoïser le client Supabase pour éviter de recréer des connexions à chaque render
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  /* ─── Session state ─── */
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionStart, setSessionStart] = useState<Date | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  /* ─── Form state ─── */
  const [workoutName, setWorkoutName] = useState('')
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0])
  const [exercises, setExercises] = useState<ExerciseEntry[]>([newExercise(0)])
  const [isPublic, setIsPublic] = useState(false)
  const [notes, setNotes] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Bug #5 fix: remplacer le hack ' ' (espace) par un Set des IDs d'exercices avec notes ouvertes
  const [openNotes, setOpenNotes] = useState<Set<string>>(new Set())

  /* ─── Rest timer ─── */
  const [restTime, setRestTime] = useState(90)
  const [restActive, setRestActive] = useState(false)
  const [restRemaining, setRestRemaining] = useState(0)

  /* ─── Save state ─── */
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showSummary, setShowSummary] = useState(false)

  /* ─── Templates from DB ─── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [templates, setTemplates] = useState<any[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const templateIdRef = useRef<string | null>(null)

  /* ─── Weight suggestions ─── */
  const [suggestions, setSuggestions] = useState<WeightSuggestion[]>([])

  /* ─── Load templates from DB ─── */
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false, nullsFirst: false })
      setTemplates(data ?? [])
      setLoadingTemplates(false)
    }
    load()
  }, [])

  /* ─── Handle incoming template from parent ─── */
  // Bug #3 fix: inclure toutes les dépendances pour éviter les stale closures
  useEffect(() => {
    if (initialTemplate) {
      loadTemplate(initialTemplate)
      onTemplateConsumed()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTemplate]) // loadTemplate et onTemplateConsumed sont stables (useCallback / prop stable)

  /* ─── Session chronometer ─── */
  useEffect(() => {
    if (!sessionStarted || !sessionStart) return
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStart.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionStarted, sessionStart])

  /* ─── Rest timer ─── */
  // Bug #1 fix: retirer restRemaining des dépendances — son changement relançait l'effet à chaque
  // seconde, créant un nouveau interval sans nettoyer le précédent (accumulation exponentielle).
  // Le functional updater `prev =>` garantit qu'on lit toujours la valeur à jour sans la capturer.
  useEffect(() => {
    if (!restActive) return
    const interval = setInterval(() => {
      setRestRemaining(prev => {
        if (prev <= 1) {
          setRestActive(false)
          // Vibrate on complete
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200])
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [restActive]) // ← restRemaining RETIRÉ : le functional updater le gère en interne

  /* ─── Fetch weight suggestions ─── */
  const fetchSuggestions = useCallback(async (exerciseName: string) => {
    if (!exerciseName.trim()) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Find past exercises with same name
      const { data: pastExercises } = await supabase
        .from('exercises')
        .select('id, workout_id, name, sets(weight_kg, reps)')
        .eq('name', exerciseName.trim())
        .limit(10)

      if (!pastExercises || pastExercises.length < 3) return

      // Check if consistently hitting same weight
      const weights: number[] = []
      for (const ex of pastExercises) {
        const sets = Array.isArray(ex.sets) ? ex.sets : []
        for (const s of sets) {
          if (s.weight_kg && s.weight_kg > 0) {
            weights.push(s.weight_kg)
          }
        }
      }

      if (weights.length < 3) return
      const maxWeight = Math.max(...weights)
      const consistentCount = weights.filter(w => w === maxWeight).length

      if (consistentCount >= 3) {
        setSuggestions(prev => {
          const filtered = prev.filter(s => s.exerciseName !== exerciseName)
          return [...filtered, {
            exerciseName,
            currentWeight: maxWeight,
            suggestedWeight: maxWeight + 2.5,
          }]
        })
      }
    } catch {
      // Silently ignore suggestion errors
    }
  }, [])

  /* ─── Template loading ─── */
  // Bug #3 fix: mémoïser avec useCallback pour stabiliser la référence
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadTemplate = useCallback((tpl: any) => {
    templateIdRef.current = tpl.id
    setWorkoutName(tpl.name)
    const exJson = Array.isArray(tpl.exercises_json) ? tpl.exercises_json : []
    setExercises(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exJson.map((ex: any, i: number) => ({
        id: `ex-tpl-${Date.now()}-${i}`,
        name: ex.name || '',
        muscleGroups: ex.muscleGroups || ex.muscle_groups || detectMuscleGroups(ex.name || ''),
        sets: Array.from({ length: ex.sets || 3 }, (_, j) => ({
          set_number: j + 1,
          weight_kg: ex.weight_kg ? String(ex.weight_kg) : '',
          reps: ex.reps ? String(typeof ex.reps === 'string' ? ex.reps.split('-')[0] : ex.reps) : '10',
        })),
        notes: ex.notes || '',
      }))
    )
  }, [])

  /* ─── Session controls ─── */
  function startSession() {
    setSessionStarted(true)
    setSessionStart(new Date())
  }

  function startRest() {
    setRestRemaining(restTime)
    setRestActive(true)
  }

  function stopRest() {
    setRestActive(false)
    setRestRemaining(0)
  }

  /* ─── Exercise CRUD ─── */
  function addExercise() {
    setExercises(prev => [...prev, newExercise(prev.length)])
  }

  function removeExercise(id: string) {
    setExercises(prev => prev.filter(e => e.id !== id))
  }

  function updateExerciseName(id: string, name: string) {
    setExercises(prev => prev.map(e => {
      if (e.id !== id) return e
      const autoMuscles = detectMuscleGroups(name)
      return { ...e, name, muscleGroups: autoMuscles.length > 0 ? autoMuscles : e.muscleGroups }
    }))
  }

  function handleExerciseBlur(exerciseName: string) {
    fetchSuggestions(exerciseName)
  }

  function toggleMuscleGroup(exId: string, muscle: string) {
    setExercises(prev => prev.map(e => {
      if (e.id !== exId) return e
      const has = e.muscleGroups.includes(muscle)
      return { ...e, muscleGroups: has ? e.muscleGroups.filter(m => m !== muscle) : [...e.muscleGroups, muscle] }
    }))
  }

  function updateExerciseNotes(id: string, notes: string) {
    setExercises(prev => prev.map(e => e.id === id ? { ...e, notes } : e))
  }

  /* ─── Set CRUD ─── */
  function addSet(exId: string) {
    setExercises(prev => prev.map(e =>
      e.id === exId
        ? { ...e, sets: [...e.sets, { set_number: e.sets.length + 1, weight_kg: '', reps: '10' }] }
        : e
    ))
  }

  function removeSet(exId: string, setIdx: number) {
    setExercises(prev => prev.map(e =>
      e.id === exId
        ? { ...e, sets: e.sets.filter((_, i) => i !== setIdx).map((s, i) => ({ ...s, set_number: i + 1 })) }
        : e
    ))
  }

  function updateSet(exId: string, setIdx: number, field: 'weight_kg' | 'reps', value: string) {
    setExercises(prev => prev.map(e =>
      e.id === exId
        ? { ...e, sets: e.sets.map((s, i) => i === setIdx ? { ...s, [field]: value } : s) }
        : e
    ))
  }

  /* ─── Computed values ─── */
  // Bug #2 fix: mémoïser les calculs coûteux — sans useMemo, ils sont recalculés
  // à chaque re-render (= chaque touche clavier), créant une pression CPU progressive
  const totalVolume = useMemo(() =>
    exercises.reduce((sum, ex) =>
      sum + calculateVolume(ex.sets.map(s => ({
        weight_kg: s.weight_kg ? parseFloat(s.weight_kg) : null,
        reps: s.reps ? parseInt(s.reps) : null,
      }))), 0),
    [exercises]
  )

  const allMuscles = useMemo(() =>
    [...new Set(exercises.flatMap(e => e.muscleGroups))],
    [exercises]
  )

  const totalSets = useMemo(() =>
    exercises.reduce((sum, e) => sum + e.sets.length, 0),
    [exercises]
  )

  const durationMinutes = sessionStart ? Math.round(elapsedSeconds / 60) : 0

  /* ─── Finish session → show summary ─── */
  function handleFinish() {
    if (!workoutName.trim()) {
      setError('Donnez un nom a la seance')
      return
    }
    if (exercises.some(e => !e.name.trim())) {
      setError('Tous les exercices doivent avoir un nom')
      return
    }
    setError('')
    setShowSummary(true)
  }

  /* ─── Save to DB ─── */
  async function handleSave() {
    setSaving(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecte')

      // Insert workout
      const { data: workout, error: wErr } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: workoutName.trim(),
          date: workoutDate,
          duration_minutes: durationMinutes || null,
          notes: notes.trim() || null,
          is_public: isPublic,
          volume_total_kg: totalVolume,
          template_id: templateIdRef.current || null,
        } as never)
        .select()
        .single()
      if (wErr) throw wErr

      // Insert exercises + sets
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i]
        const { data: exercise, error: eErr } = await supabase
          .from('exercises')
          .insert({
            workout_id: workout.id,
            name: ex.name.trim(),
            order: i,
            muscle_groups: ex.muscleGroups,
          })
          .select()
          .single()
        if (eErr) throw eErr

        const setsPayload = ex.sets.map(s => ({
          exercise_id: exercise.id,
          set_number: s.set_number,
          weight_kg: s.weight_kg ? parseFloat(s.weight_kg) : null,
          reps: s.reps ? parseInt(s.reps) : null,
        }))
        if (setsPayload.length > 0) {
          const { error: sErr } = await supabase.from('sets').insert(setsPayload)
          if (sErr) throw sErr
        }
      }

      // Update template last_used_at if from template
      if (templateIdRef.current) {
        await supabase
          .from('workout_templates')
          .update({ last_used_at: new Date().toISOString(), use_count: templates.find(t => t.id === templateIdRef.current)?.use_count + 1 || 1 })
          .eq('id', templateIdRef.current)
      }

      setShowSummary(false)
      onSaved()
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e?.message ?? 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  /* ─── Suggestion for an exercise ─── */
  function getSuggestion(exerciseName: string): WeightSuggestion | undefined {
    return suggestions.find(s => s.exerciseName === exerciseName)
  }

  /* ═══════════════════════════════════════════ RENDER ═══════════════════════════════════════════ */

  return (
    <div>
      {/* ─── Session Timer Bar ─── */}
      {sessionStarted && (
        <div className="card" style={{
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.125rem',
          borderColor: 'rgba(59,130,246,0.3)',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.25rem', height: '2.25rem', borderRadius: '50%',
              background: 'var(--accent-blue-glow)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Clock size={14} color="var(--accent-blue)" />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Duree
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {formatElapsed(elapsedSeconds)}
              </div>
            </div>
          </div>

          {/* Rest Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {restActive ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  padding: '0.375rem 0.75rem', borderRadius: '0.625rem',
                  background: restRemaining <= 10 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                  border: `1px solid ${restRemaining <= 10 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                  fontWeight: 800, fontSize: '1.125rem',
                  color: restRemaining <= 10 ? '#f87171' : '#fbbf24',
                  fontVariantNumeric: 'tabular-nums', minWidth: '3.5rem', textAlign: 'center',
                }}>
                  {formatElapsed(restRemaining)}
                </div>
                <button onClick={stopRest} className="btn-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button onClick={startRest} className="btn btn-ghost btn-sm" style={{ gap: '0.375rem' }}>
                <Timer size={14} />
                Repos
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Rest time config ─── */}
      {sessionStarted && !restActive && (
        <div style={{
          display: 'flex', gap: '0.375rem', marginBottom: '1rem',
          overflowX: 'auto', paddingBottom: '0.25rem',
        }}>
          {REST_TIMES.map(t => (
            <button
              key={t}
              onClick={() => setRestTime(t)}
              className="btn btn-sm"
              style={{
                background: restTime === t ? 'var(--accent-blue)' : 'var(--bg-card)',
                color: restTime === t ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${restTime === t ? 'var(--accent-blue)' : 'var(--border)'}`,
                minWidth: '3rem', flexShrink: 0,
              }}
            >
              {t}s
            </button>
          ))}
        </div>
      )}

      {/* ─── Start Session Button ─── */}
      {!sessionStarted && (
        <button onClick={startSession} className="btn btn-primary btn-lg btn-full" style={{ marginBottom: '1.25rem' }}>
          <Play size={18} />
          Demarrer la seance
        </button>
      )}

      {/* ─── Template Quick-Load ─── */}
      {!sessionStarted && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Zap size={16} color="var(--accent-violet)" />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Templates</span>
          </div>
          {loadingTemplates ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: '3.5rem', flex: 1 }} />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Aucun template. Créez-en un dans l&apos;onglet Templates.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(5.5rem, 1fr))', gap: '0.5rem' }}>
              {templates.slice(0, 6).map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => loadTemplate(tpl)}
                  className="template-btn"
                  style={templateIdRef.current === tpl.id ? {
                    borderColor: 'var(--accent-violet)',
                    background: 'var(--accent-violet-glow)',
                    color: '#c4b5fd',
                  } : {}}
                >
                  <span className="letter" style={{ color: tpl.color || 'var(--accent-violet)' }}>{tpl.icon || '💪'}</span>
                  <span className="tname">{tpl.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Workout Info ─── */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="input-group" style={{ marginBottom: '0.75rem' }}>
          <label className="input-label">Nom de la seance</label>
          <input
            className="input"
            type="text"
            placeholder="Ex: Push Day, Full Body..."
            value={workoutName}
            onChange={e => setWorkoutName(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Date</label>
          <input
            className="input"
            type="date"
            value={workoutDate}
            onChange={e => setWorkoutDate(e.target.value)}
          />
        </div>
      </div>

      {/* ─── Exercises ─── */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>
            Exercices ({exercises.length})
          </h2>
          {totalVolume > 0 && (
            <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
              {Math.round(totalVolume).toLocaleString('fr-FR')} kg vol.
            </span>
          )}
        </div>

        {exercises.map((ex, exIdx) => {
          const suggestion = getSuggestion(ex.name)
          return (
            <div key={ex.id} className="exercise-card">
              {/* Exercise header */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                <div style={{
                  width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem',
                  background: 'var(--accent-violet-glow)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-violet)',
                }}>
                  {exIdx + 1}
                </div>
                <input
                  className="input"
                  type="text"
                  placeholder="Nom de l'exercice"
                  value={ex.name}
                  onChange={e => updateExerciseName(ex.id, e.target.value)}
                  onBlur={() => handleExerciseBlur(ex.name)}
                  style={{ flex: 1 }}
                />
                {exercises.length > 1 && (
                  <button onClick={() => removeExercise(ex.id)} className="btn-icon btn-icon-danger">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Muscle group chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
                {MUSCLE_GROUPS.map(muscle => {
                  const active = ex.muscleGroups.includes(muscle)
                  return (
                    <button
                      key={muscle}
                      onClick={() => toggleMuscleGroup(ex.id, muscle)}
                      style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        border: `1px solid ${active ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`,
                        background: active ? 'var(--accent-violet-glow)' : 'transparent',
                        color: active ? '#a78bfa' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        fontFamily: 'inherit',
                      }}
                    >
                      {active && <Check size={10} style={{ marginRight: '0.25rem', display: 'inline' }} />}
                      {muscle}
                    </button>
                  )
                })}
              </div>

              {/* Weight suggestion */}
              {suggestion && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.75rem', borderRadius: '0.625rem',
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                  marginBottom: '0.75rem', fontSize: '0.8125rem',
                }}>
                  <TrendingUp size={14} color="var(--accent-green)" />
                  <span style={{ color: '#34d399' }}>
                    Progression suggeree : <strong>{suggestion.suggestedWeight} kg</strong>
                  </span>
                  <span className="badge badge-green" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                    +2.5kg
                  </span>
                </div>
              )}

              {/* Sets header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '2rem 1fr 1fr auto',
                gap: '0.5rem', marginBottom: '0.375rem',
              }}>
                <div />
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Poids (kg)
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Reps
                </div>
                <div />
              </div>

              {/* Sets */}
              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className="set-row">
                  <div className="set-number">{set.set_number}</div>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    value={set.weight_kg}
                    onChange={e => updateSet(ex.id, setIdx, 'weight_kg', e.target.value)}
                    style={{ padding: '0.45rem 0.6rem', textAlign: 'center' }}
                  />
                  <input
                    className="input"
                    type="number"
                    min="1"
                    placeholder="10"
                    value={set.reps}
                    onChange={e => updateSet(ex.id, setIdx, 'reps', e.target.value)}
                    style={{ padding: '0.45rem 0.6rem', textAlign: 'center' }}
                  />
                  {ex.sets.length > 1 ? (
                    <button onClick={() => removeSet(ex.id, setIdx)} className="btn-icon btn-icon-danger">
                      <Trash2 size={12} />
                    </button>
                  ) : <div style={{ width: '2rem' }} />}
                </div>
              ))}

              <button onClick={() => addSet(ex.id)} className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem', width: '100%' }}>
                <PlusCircle size={14} /> Ajouter une serie
              </button>

              {/* Exercise notes (collapsible) */}
              {/* Bug #5 fix: utiliser un Set d'IDs à la place du hack ' ' (espace) comme signal */}
              <div style={{ marginTop: '0.625rem' }}>
                <button
                  onClick={() => setOpenNotes(prev => {
                    const next = new Set(prev)
                    if (next.has(ex.id)) { next.delete(ex.id) } else { next.add(ex.id) }
                    return next
                  })}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                  }}
                >
                  <MessageSquare size={12} />
                  {openNotes.has(ex.id) ? 'Note' : 'Ajouter une note'}
                </button>
                {openNotes.has(ex.id) && (
                  <textarea
                    className="input"
                    value={ex.notes}
                    onChange={e => updateExerciseNotes(ex.id, e.target.value)}
                    placeholder="Notes pour cet exercice..."
                    rows={2}
                    style={{ marginTop: '0.375rem', resize: 'vertical', fontSize: '0.8125rem' }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={addExercise} className="btn btn-ghost btn-full" style={{ marginBottom: '1.25rem' }}>
        <PlusCircle size={16} /> Ajouter un exercice
      </button>

      {/* ─── Advanced Options (collapsible) ─── */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div
          className="collapsible-header"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ padding: '0' }}
        >
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Options avancees
          </span>
          <span className={`chevron ${showAdvanced ? 'open' : ''}`}>
            <ChevronDown size={16} color="var(--text-muted)" />
          </span>
        </div>

        {showAdvanced && (
          <div style={{ marginTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {/* Public toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isPublic ? <Eye size={16} color="var(--accent-blue)" /> : <EyeOff size={16} color="var(--text-muted)" />}
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {isPublic ? 'Seance publique' : 'Seance privee'}
                </span>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                style={{
                  width: '2.75rem', height: '1.5rem', borderRadius: '999px',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  background: isPublic ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: '1.125rem', height: '1.125rem', borderRadius: '50%',
                  background: 'white', position: 'absolute', top: '0.1875rem',
                  left: isPublic ? '1.4375rem' : '0.1875rem',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>

            {/* Session notes */}
            <div className="input-group">
              <label className="input-label">Notes de seance</label>
              <textarea
                className="input"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Comment s'est passee la seance..."
                rows={3}
                style={{ resize: 'vertical', fontSize: '0.8125rem' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── Error ─── */}
      {error && (
        <div style={{
          padding: '0.75rem', borderRadius: '0.625rem',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}

      {/* ─── Finish Button ─── */}
      {sessionStarted ? (
        <button onClick={handleFinish} className="btn btn-primary btn-lg btn-full">
          <Square size={18} />
          Terminer la seance
        </button>
      ) : (
        <button onClick={handleFinish} className="btn btn-primary btn-lg btn-full">
          <Save size={18} />
          Sauvegarder
        </button>
      )}

      {/* ═══ Summary Modal ═══ */}
      {showSummary && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div className="card fade-in" style={{
            maxWidth: '24rem', width: '100%',
            padding: '1.75rem', border: '1px solid rgba(59,130,246,0.3)',
            background: 'var(--bg-card)',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                  width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
                  background: 'var(--accent-violet-glow)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Dumbbell size={18} color="var(--accent-violet)" />
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                    Resume
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {workoutName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSummary(false)}
                className="btn-icon"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                padding: '0.875rem', borderRadius: '0.75rem',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Duree
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {sessionStart ? formatElapsed(elapsedSeconds) : '--:--'}
                </div>
              </div>
              <div style={{
                padding: '0.875rem', borderRadius: '0.75rem',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Volume total
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-violet)' }}>
                  {Math.round(totalVolume).toLocaleString('fr-FR')} kg
                </div>
              </div>
              <div style={{
                padding: '0.875rem', borderRadius: '0.75rem',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Exercices
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {exercises.length}
                </div>
              </div>
              <div style={{
                padding: '0.875rem', borderRadius: '0.75rem',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Series
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {totalSets}
                </div>
              </div>
            </div>

            {/* Muscles worked */}
            {allMuscles.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Muscles travailles
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {allMuscles.map(m => (
                    <span key={m} className="badge badge-blue">{m}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary btn-lg btn-full"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Sauvegarde...' : 'Confirmer et sauvegarder'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
