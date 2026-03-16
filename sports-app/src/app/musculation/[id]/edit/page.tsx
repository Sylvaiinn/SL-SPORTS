'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATES } from '@/lib/templates'
import { ChevronLeft, PlusCircle, Trash2, Save, Loader2, Zap, AlertCircle } from 'lucide-react'

interface SetEntry { set_number: number; weight_kg: string; reps: string; dbId?: string }
interface ExerciseEntry { id: string; name: string; sets: SetEntry[]; dbId?: string }

export default function EditWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const [workoutId, setWorkoutId] = useState('')
  const [workoutName, setWorkoutName] = useState('')
  const [workoutDate, setWorkoutDate] = useState('')
  const [workoutNotes, setWorkoutNotes] = useState('')
  const [exercises, setExercises] = useState<ExerciseEntry[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const { id } = await params
    setWorkoutId(id)
    const { data: workout } = await supabase
      .from('workouts')
      .select('*, exercises(*, sets(*))')
      .eq('id', id)
      .single()

    if (!workout) { router.push('/musculation'); return }
    const w = workout as unknown as {
      name: string; date: string; notes: string | null;
      exercises: { id: string; name: string; order: number; sets: { id: string; set_number: number; weight_kg: number | null; reps: number | null }[] }[]
    }
    setWorkoutName(w.name)
    setWorkoutDate(w.date)
    setWorkoutNotes(w.notes ?? '')
    const exos = (w.exercises ?? []).sort((a, b) => a.order - b.order).map((ex) => ({
      id: `ex-edit-${ex.id}`,
      name: ex.name,
      dbId: ex.id,
      sets: (ex.sets ?? []).sort((a, b) => a.set_number - b.set_number).map((s) => ({
        set_number: s.set_number,
        weight_kg: s.weight_kg != null ? String(s.weight_kg) : '',
        reps: s.reps != null ? String(s.reps) : '',
        dbId: s.id,
      })),
    }))
    setExercises(exos)
    setLoading(false)
  }, [params, supabase, router])

  useEffect(() => { load() }, [load])

  function addExercise() {
    setExercises(prev => [...prev, { id: `ex-new-${Date.now()}`, name: '', sets: [{ set_number: 1, weight_kg: '', reps: '10' }] }])
  }
  function removeExercise(id: string) { setExercises(prev => prev.filter(e => e.id !== id)) }
  function updateExerciseName(id: string, name: string) { setExercises(prev => prev.map(e => e.id === id ? { ...e, name } : e)) }
  function addSet(exId: string) { setExercises(prev => prev.map(e => e.id === exId ? { ...e, sets: [...e.sets, { set_number: e.sets.length + 1, weight_kg: '', reps: '10' }] } : e)) }
  function removeSet(exId: string, setIdx: number) { setExercises(prev => prev.map(e => e.id === exId ? { ...e, sets: e.sets.filter((_, i) => i !== setIdx).map((s, i) => ({ ...s, set_number: i + 1 })) } : e)) }
  function updateSet(exId: string, setIdx: number, field: 'weight_kg' | 'reps', value: string) { setExercises(prev => prev.map(e => e.id === exId ? { ...e, sets: e.sets.map((s, i) => i === setIdx ? { ...s, [field]: value } : s) } : e)) }

  async function handleSave() {
    if (!workoutName.trim()) { setError('Donnez un nom à la séance'); return }
    if (exercises.some(e => !e.name.trim())) { setError('Tous les exercices doivent avoir un nom'); return }
    setError('')
    setSaving(true)
    try {
      // Update workout meta
      await supabase.from('workouts').update({ name: workoutName.trim(), date: workoutDate, notes: workoutNotes || null } as never).eq('id', workoutId)
      // Delete all existing exercises (cascades to sets) then re-insert
      await supabase.from('exercises').delete().eq('workout_id', workoutId)
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i]
        const { data: exercise } = await supabase.from('exercises').insert({ workout_id: workoutId, name: ex.name.trim(), order: i } as never).select().single()
        if (!exercise) continue
        const exRow = exercise as unknown as { id: string }
        const setsPayload = ex.sets.map(s => ({
          exercise_id: exRow.id,
          set_number: s.set_number,
          weight_kg: s.weight_kg ? parseFloat(s.weight_kg) : null,
          reps: s.reps ? parseInt(s.reps) : null,
        }))
        if (setsPayload.length > 0) await supabase.from('sets').insert(setsPayload as never)
      }
      router.push(`/musculation/${workoutId}`)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e?.message ?? 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '6rem', borderRadius: '1rem' }} />)}
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ padding: '0.5rem' }}>
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1>Modifier la séance</h1>
          <p>Musculation</p>
        </div>
      </div>

      {/* Workout info */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="input-group" style={{ marginBottom: '0.75rem' }}>
          <label className="input-label">Nom de la séance</label>
          <input className="input" type="text" value={workoutName} onChange={e => setWorkoutName(e.target.value)} />
        </div>
        <div className="input-group" style={{ marginBottom: '0.75rem' }}>
          <label className="input-label">Date</label>
          <input className="input" type="date" value={workoutDate} onChange={e => setWorkoutDate(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Notes (optionnel)</label>
          <textarea className="input" rows={2} placeholder="Sensations, contexte de la séance..." value={workoutNotes} onChange={e => setWorkoutNotes(e.target.value)} style={{ resize: 'vertical' }} />
        </div>
      </div>

      {/* Quick template reload */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Zap size={15} color="var(--accent-violet)" />
          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Recharger un template</span>
        </div>
        <div className="template-grid">
          {Object.values(TEMPLATES).map(t => (
            <button key={t.id} className="template-btn" onClick={() => {
              setWorkoutName(t.name)
              setExercises(t.exercises.map((ex, i) => ({
                id: `ex-tpl-${i}-${Date.now()}`,
                name: ex.name,
                sets: Array.from({ length: ex.sets }, (_, j) => ({ set_number: j + 1, weight_kg: '', reps: ex.reps.split('-')[0] })),
              })))
            }}>
              <span className="letter">{t.id}</span>
              <span className="tname">{t.exercises.map(e => e.name.split(' ')[0]).join(' · ')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Exercises */}
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Exercices ({exercises.length})
        </h2>
        {exercises.map((ex, exIdx) => (
          <div key={ex.id} className="exercise-card">
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
              <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem', background: 'var(--accent-blue-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                {exIdx + 1}
              </div>
              <input className="input" type="text" placeholder="Nom de l'exercice" value={ex.name} onChange={e => updateExerciseName(ex.id, e.target.value)} style={{ flex: 1 }} />
              {exercises.length > 1 && (
                <button onClick={() => removeExercise(ex.id)} className="btn-icon btn-icon-danger"><Trash2 size={14} /></button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2rem 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <div /><div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Poids (kg)</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reps</div><div />
            </div>
            {ex.sets.map((set, setIdx) => (
              <div key={setIdx} className="set-row">
                <div className="set-number">{set.set_number}</div>
                <input className="input" type="number" min="0" step="0.5" placeholder="0" value={set.weight_kg} onChange={e => updateSet(ex.id, setIdx, 'weight_kg', e.target.value)} style={{ padding: '0.45rem 0.6rem', textAlign: 'center' }} />
                <input className="input" type="number" min="1" placeholder="10" value={set.reps} onChange={e => updateSet(ex.id, setIdx, 'reps', e.target.value)} style={{ padding: '0.45rem 0.6rem', textAlign: 'center' }} />
                {ex.sets.length > 1 ? <button onClick={() => removeSet(ex.id, setIdx)} className="btn-icon btn-icon-danger"><Trash2 size={12} /></button> : <div style={{ width: '2rem' }} />}
              </div>
            ))}
            <button onClick={() => addSet(ex.id)} className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem', width: '100%' }}>
              <PlusCircle size={14} /> Ajouter une série
            </button>
          </div>
        ))}
      </div>

      <button onClick={addExercise} className="btn btn-ghost btn-full" style={{ marginBottom: '1.5rem' }}>
        <PlusCircle size={16} /> Ajouter un exercice
      </button>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.625rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-lg btn-full">
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
      </button>
    </div>
  )
}
