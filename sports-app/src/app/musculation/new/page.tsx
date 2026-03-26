'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATES, type Template } from '@/lib/templates'
import { PlusCircle, Trash2, ChevronLeft, Save, Zap, Loader2, Clock } from 'lucide-react'

interface SetEntry {
  set_number: number
  weight_kg: string
  reps: string
}

interface ExerciseEntry {
  id: string
  name: string
  sets: SetEntry[]
}

function newExercise(order: number): ExerciseEntry {
  return {
    id: `ex-${Date.now()}-${order}`,
    name: '',
    sets: [{ set_number: 1, weight_kg: '', reps: '10' }],
  }
}

export default function NewWorkoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const [workoutName, setWorkoutName] = useState('')
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0])
  const [workoutDuration, setWorkoutDuration] = useState('')
  const [exercises, setExercises] = useState<ExerciseEntry[]>([newExercise(0)])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)

  // Known exercises from past workouts: name → last weight used
  const [knownExercises, setKnownExercises] = useState<string[]>([])
  const [lastWeightMap, setLastWeightMap] = useState<Record<string, string>>({})

  // Load historical exercises on mount
  useEffect(() => {
    async function loadHistory() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all workouts for this user
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('id, date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      if (!workoutsData || workoutsData.length === 0) return

      const workoutIds = workoutsData.map(w => w.id)
      const workoutDateById: Record<string, string> = {}
      workoutsData.forEach(w => { workoutDateById[w.id] = w.date })

      // Get exercises + sets for these workouts
      const { data: exosData } = await supabase
        .from('exercises')
        .select('id, name, workout_id, sets(weight_kg)')
        .in('workout_id', workoutIds)
      if (!exosData) return

      // Build name → last weight map (most recent workout per exercise name)
      const nameToDate: Record<string, string> = {}
      const nameToWeight: Record<string, string> = {}

      for (const exo of exosData as { id: string; name: string; workout_id: string; sets: { weight_kg: number | null }[] }[]) {
        const exoDate = workoutDateById[exo.workout_id] ?? ''
        if (!nameToDate[exo.name] || exoDate > nameToDate[exo.name]) {
          nameToDate[exo.name] = exoDate
          // Find the max weight used in this exercise
          const weights = (exo.sets ?? [])
            .map(s => s.weight_kg)
            .filter((w): w is number => w !== null && w > 0)
          if (weights.length > 0) {
            nameToWeight[exo.name] = String(Math.max(...weights))
          }
        }
      }

      const names = [...new Set(exosData.map(e => e.name))].sort()
      setKnownExercises(names)
      setLastWeightMap(nameToWeight)
    }
    loadHistory()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When user selects a known exercise, pre-fill weight from history
  const handleExerciseNameChange = useCallback((exId: string, name: string) => {
    setExercises(prev => prev.map(e => {
      if (e.id !== exId) return e
      const lastWeight = lastWeightMap[name]
      if (lastWeight) {
        // Pre-fill all existing sets with last known weight
        return {
          ...e,
          name,
          sets: e.sets.map(s => ({ ...s, weight_kg: s.weight_kg || lastWeight })),
        }
      }
      return { ...e, name }
    }))
  }, [lastWeightMap])

  function loadTemplate(t: Template) {
    setActiveTemplate(t.id)
    setWorkoutName(t.name)
    setExercises(
      t.exercises.map((ex, i) => ({
        id: `ex-tpl-${i}`,
        name: ex.name,
        sets: Array.from({ length: ex.sets }, (_, j) => ({
          set_number: j + 1,
          weight_kg: lastWeightMap[ex.name] ?? '',
          reps: ex.reps.split('-')[0],
        })),
      }))
    )
  }

  function addExercise() {
    setExercises((prev) => [...prev, newExercise(prev.length)])
  }

  function removeExercise(id: string) {
    setExercises((prev) => prev.filter((e) => e.id !== id))
  }

  function addSet(exId: string) {
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exId
          ? { ...e, sets: [...e.sets, { set_number: e.sets.length + 1, weight_kg: '', reps: '10' }] }
          : e
      )
    )
  }

  function removeSet(exId: string, setIdx: number) {
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exId
          ? { ...e, sets: e.sets.filter((_, i) => i !== setIdx).map((s, i) => ({ ...s, set_number: i + 1 })) }
          : e
      )
    )
  }

  function updateSet(exId: string, setIdx: number, field: 'weight_kg' | 'reps', value: string) {
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exId
          ? { ...e, sets: e.sets.map((s, i) => (i === setIdx ? { ...s, [field]: value } : s)) }
          : e
      )
    )
  }

  async function handleSave() {
    if (!workoutName.trim()) { setError('Donnez un nom à la séance'); return }
    if (exercises.some((e) => !e.name.trim())) { setError('Tous les exercices doivent avoir un nom'); return }
    setError('')
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')

      // Insert workout
      const { data: workout, error: wErr } = await supabase
        .from('workouts')
        .insert({ user_id: user.id, name: workoutName.trim(), date: workoutDate, duration_minutes: workoutDuration ? parseInt(workoutDuration) : null } as never)
        .select().single()
      if (wErr) throw wErr

      // Insert exercises + sets
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i]
        const { data: exercise, error: eErr } = await supabase
          .from('exercises')
          .insert({ workout_id: workout.id, name: ex.name.trim(), order: i })
          .select()
          .single()
        if (eErr) throw eErr

        const setsPayload = ex.sets.map((s) => ({
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

      router.push(`/musculation/${workout.id}`)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e?.message ?? 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fade-in">
      {/* Datalist for exercise autocomplete */}
      <datalist id="exercises-list">
        {knownExercises.map(name => <option key={name} value={name} />)}
      </datalist>

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ padding: '0.5rem' }}>
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1>Nouvelle séance</h1>
          <p>Musculation</p>
        </div>
      </div>

      {/* Workout Info */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="input-group" style={{ marginBottom: '0.75rem' }}>
          <label className="input-label">Nom de la séance</label>
          <input
            className="input"
            type="text"
            placeholder="Ex: Push Day, Full Body..."
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0' }}>
          <div className="input-group">
            <label className="input-label">Date</label>
            <input className="input" type="date" value={workoutDate} onChange={(e) => setWorkoutDate(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label"><Clock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />Durée (min)</label>
            <input className="input" type="number" min="1" placeholder="60" value={workoutDuration} onChange={(e) => setWorkoutDuration(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Zap size={16} color="var(--accent-violet)" />
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Chargement rapide</span>
          <span className="badge badge-violet">Templates</span>
        </div>
        <div className="template-grid">
          {Object.values(TEMPLATES).map((t) => (
            <button
              key={t.id}
              onClick={() => loadTemplate(t)}
              className="template-btn"
              style={activeTemplate === t.id ? { borderColor: 'var(--accent-violet)', background: 'var(--accent-violet-glow)', color: '#c4b5fd' } : {}}
            >
              <span className="letter">{t.id}</span>
              <span className="tname">{t.exercises.map((e) => e.name.split(' ')[0]).join(' · ')}</span>
            </button>
          ))}
        </div>
        {activeTemplate && (
          <div style={{ marginTop: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', background: 'var(--accent-violet-glow)', border: '1px solid rgba(139,92,246,0.3)', fontSize: '0.8125rem', color: '#c4b5fd' }}>
            Template {activeTemplate} chargé — renseignez les poids par série puis sauvegardez.
          </div>
        )}
      </div>

      {/* Exercises */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>Exercices ({exercises.length})</h2>
        </div>

        {exercises.map((ex, exIdx) => {
          const lastW = lastWeightMap[ex.name]
          return (
            <div key={ex.id} className="exercise-card">
              {/* Exercise header */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem', background: 'var(--accent-blue-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                  {exIdx + 1}
                </div>
                <input
                  className="input"
                  type="text"
                  list="exercises-list"
                  placeholder="Nom de l'exercice"
                  value={ex.name}
                  onChange={(e) => handleExerciseNameChange(ex.id, e.target.value)}
                  style={{ flex: 1 }}
                />
                {exercises.length > 1 && (
                  <button onClick={() => removeExercise(ex.id)} className="btn-icon btn-icon-danger">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Last weight hint */}
              {lastW && (
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>⏱</span> Dernier poids connu : <strong>{lastW} kg</strong>
                </div>
              )}

              {/* Sets header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2rem 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <div />
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Poids (kg)</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reps</div>
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
                    placeholder={lastW ?? '0'}
                    value={set.weight_kg}
                    onChange={(e) => updateSet(ex.id, setIdx, 'weight_kg', e.target.value)}
                    style={{ padding: '0.45rem 0.6rem', textAlign: 'center' }}
                  />
                  <input
                    className="input"
                    type="number"
                    min="1"
                    placeholder="10"
                    value={set.reps}
                    onChange={(e) => updateSet(ex.id, setIdx, 'reps', e.target.value)}
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
                <PlusCircle size={14} /> Ajouter une série
              </button>
            </div>
          )
        })}
      </div>

      <button onClick={addExercise} className="btn btn-ghost btn-full" style={{ marginBottom: '1.5rem' }}>
        <PlusCircle size={16} /> Ajouter un exercice
      </button>

      {error && (
        <div style={{ padding: '0.75rem', borderRadius: '0.625rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-lg btn-full">
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {saving ? 'Sauvegarde...' : 'Sauvegarder la séance'}
      </button>
    </div>
  )
}
