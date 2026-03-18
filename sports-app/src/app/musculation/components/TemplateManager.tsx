'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MUSCLE_GROUPS, TEMPLATE_ICONS, TEMPLATE_COLORS } from '@/lib/muscuConstants'
import {
  Plus, Trash2, Loader2, X, Eye, EyeOff, Copy, Pencil, Check,
  ChevronLeft, Globe, PlusCircle, Dumbbell, Users, Search, ArrowDownWideNarrow,
} from 'lucide-react'

/* ─── Types ─── */
interface TemplateExercise {
  name: string
  sets: number
  reps: string
  muscle_groups: string[]
}

interface WorkoutTemplate {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  is_public: boolean
  exercises_json: TemplateExercise[]
  use_count: number
  last_used_at: string | null
  created_at: string
  profiles?: { username: string } | null
}

interface Props {
  onUseTemplate: (template: WorkoutTemplate) => void
}

/* ─── Helpers ─── */
function newExercise(): TemplateExercise {
  return { name: '', sets: 3, reps: '10', muscle_groups: [] }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Jamais'
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

/* ═══════════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function TemplateManager({ onUseTemplate }: Props) {
  const supabase = createClient()

  /* ─── State ─── */
  const [userId, setUserId] = useState<string | null>(null)
  const [myTemplates, setMyTemplates] = useState<WorkoutTemplate[]>([])
  const [publicTemplates, setPublicTemplates] = useState<WorkoutTemplate[]>([])
  const [loadingMine, setLoadingMine] = useState(true)
  const [loadingPublic, setLoadingPublic] = useState(true)

  /* ─── Form state ─── */
  const [editing, setEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null) // null = create, string = edit
  const [formName, setFormName] = useState('')
  const [formColor, setFormColor] = useState(TEMPLATE_COLORS[0])
  const [formIcon, setFormIcon] = useState(TEMPLATE_ICONS[0])
  const [formPublic, setFormPublic] = useState(false)
  const [formExercises, setFormExercises] = useState<TemplateExercise[]>([newExercise()])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  /* ─── Delete confirmation ─── */
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  /* ─── Public filter ─── */
  const [publicFilter, setPublicFilter] = useState<string | null>(null)

  /* ─── Copying public template ─── */
  const [copyingId, setCopyingId] = useState<string | null>(null)

  /* ─── Load user + data ─── */
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      fetchMyTemplates(user.id)
      fetchPublicTemplates(user.id)
    }
    init()
  }, [])

  const fetchMyTemplates = useCallback(async (uid: string) => {
    setLoadingMine(true)
    const { data } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('user_id', uid)
      .order('last_used_at', { ascending: false, nullsFirst: false })
    setMyTemplates((data as WorkoutTemplate[]) ?? [])
    setLoadingMine(false)
  }, [])

  const fetchPublicTemplates = useCallback(async (uid: string) => {
    setLoadingPublic(true)
    const { data: templates } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('is_public', true)
      .order('use_count', { ascending: false })

    if (!templates || templates.length === 0) {
      setPublicTemplates([])
      setLoadingPublic(false)
      return
    }

    // Fetch usernames separately (no direct FK to profiles)
    const userIds = [...new Set(templates.map((t: WorkoutTemplate) => t.user_id))]
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds)

    const usernameMap: Record<string, string> = {}
    for (const p of (profilesData ?? []) as { id: string; username: string | null }[]) {
      if (p.username) usernameMap[p.id] = p.username
    }

    const enriched = templates.map((t: WorkoutTemplate) => ({
      ...t,
      profiles: { username: usernameMap[t.user_id] ?? null },
    }))
    setPublicTemplates(enriched as WorkoutTemplate[])
    setLoadingPublic(false)
  }, [])

  /* ─── Open create form ─── */
  function openCreate() {
    setEditingId(null)
    setFormName('')
    setFormColor(TEMPLATE_COLORS[0])
    setFormIcon(TEMPLATE_ICONS[0])
    setFormPublic(false)
    setFormExercises([newExercise()])
    setFormError('')
    setEditing(true)
  }

  /* ─── Open edit form ─── */
  function openEdit(tpl: WorkoutTemplate) {
    setEditingId(tpl.id)
    setFormName(tpl.name)
    setFormColor(tpl.color || TEMPLATE_COLORS[0])
    setFormIcon(tpl.icon || TEMPLATE_ICONS[0])
    setFormPublic(tpl.is_public)
    setFormExercises(
      Array.isArray(tpl.exercises_json) && tpl.exercises_json.length > 0
        ? tpl.exercises_json.map(e => ({ ...e }))
        : [newExercise()]
    )
    setFormError('')
    setEditing(true)
  }

  /* ─── Close form ─── */
  function closeForm() {
    setEditing(false)
    setEditingId(null)
    setFormError('')
  }

  /* ─── Form exercise CRUD ─── */
  function addFormExercise() {
    setFormExercises(prev => [...prev, newExercise()])
  }

  function removeFormExercise(idx: number) {
    setFormExercises(prev => prev.filter((_, i) => i !== idx))
  }

  function updateFormExercise(idx: number, field: keyof TemplateExercise, value: string | number | string[]) {
    setFormExercises(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))
  }

  function toggleFormMuscle(exIdx: number, muscle: string) {
    setFormExercises(prev => prev.map((e, i) => {
      if (i !== exIdx) return e
      const has = e.muscle_groups.includes(muscle)
      return {
        ...e,
        muscle_groups: has
          ? e.muscle_groups.filter(m => m !== muscle)
          : [...e.muscle_groups, muscle],
      }
    }))
  }

  /* ─── Save template ─── */
  async function handleSave() {
    if (!formName.trim()) {
      setFormError('Le nom du template est requis')
      return
    }
    if (formExercises.some(e => !e.name.trim())) {
      setFormError('Tous les exercices doivent avoir un nom')
      return
    }
    if (!userId) return

    setSaving(true)
    setFormError('')

    try {
      const payload = {
        user_id: userId,
        name: formName.trim(),
        icon: formIcon,
        color: formColor,
        is_public: formPublic,
        exercises_json: formExercises.map(e => ({
          name: e.name.trim(),
          sets: e.sets,
          reps: e.reps,
          muscle_groups: e.muscle_groups,
        })),
      }

      if (editingId) {
        const { error } = await supabase
          .from('workout_templates')
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('workout_templates')
          .insert({ ...payload, use_count: 0 } as never)
        if (error) throw error
      }

      closeForm()
      fetchMyTemplates(userId)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setFormError(e?.message ?? 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  /* ─── Delete template ─── */
  async function handleDelete(id: string) {
    if (!userId) return
    setDeleting(true)
    try {
      await supabase.from('workout_templates').delete().eq('id', id)
      setConfirmDeleteId(null)
      fetchMyTemplates(userId)
    } catch {
      // silent
    } finally {
      setDeleting(false)
    }
  }

  /* ─── Duplicate template ─── */
  async function handleDuplicate(tpl: WorkoutTemplate) {
    if (!userId) return
    try {
      await supabase.from('workout_templates').insert({
        user_id: userId,
        name: `${tpl.name} (copie)`,
        icon: tpl.icon,
        color: tpl.color,
        is_public: false,
        exercises_json: tpl.exercises_json,
        use_count: 0,
      } as never)
      fetchMyTemplates(userId)
    } catch {
      // silent
    }
  }

  /* ─── Copy public template to own ─── */
  async function handleCopyPublic(tpl: WorkoutTemplate) {
    if (!userId) return
    setCopyingId(tpl.id)
    try {
      await supabase.from('workout_templates').insert({
        user_id: userId,
        name: tpl.name,
        icon: tpl.icon,
        color: tpl.color,
        is_public: false,
        exercises_json: tpl.exercises_json,
        use_count: 0,
      } as never)
      fetchMyTemplates(userId)
    } catch {
      // silent
    } finally {
      setCopyingId(null)
    }
  }

  /* ─── Filtered public templates ─── */
  const filteredPublic = publicFilter
    ? publicTemplates.filter(t =>
        Array.isArray(t.exercises_json) &&
        t.exercises_json.some(ex =>
          ex.muscle_groups?.includes(publicFilter)
        )
      )
    : publicTemplates

  /* ═══════════════════════════════════════════ RENDER ═══════════════════════════════════════════ */

  /* ─── Create / Edit Form ─── */
  if (editing) {
    return (
      <div className="fade-in">
        {/* Back button */}
        <button
          onClick={closeForm}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '1rem' }}
        >
          <ChevronLeft size={16} />
          Retour
        </button>

        <h2 style={{
          fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)',
          marginBottom: '1.25rem',
        }}>
          {editingId ? 'Modifier le template' : 'Nouveau template'}
        </h2>

        {/* Name */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Nom du template</label>
            <input
              className="input"
              type="text"
              placeholder="Ex: Push Day, Full Body..."
              value={formName}
              onChange={e => setFormName(e.target.value)}
            />
          </div>
        </div>

        {/* Icon + Color picker */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          {/* Color */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Couleur</label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0.625rem', marginTop: '0.375rem',
            }}>
              {TEMPLATE_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setFormColor(c)}
                  style={{
                    width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                    background: c, border: formColor === c ? '3px solid var(--text-primary)' : '3px solid transparent',
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: formColor === c ? `0 0 12px ${c}60` : 'none',
                    justifySelf: 'center',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="input-label">Icone</label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0.625rem', marginTop: '0.375rem',
            }}>
              {TEMPLATE_ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setFormIcon(icon)}
                  style={{
                    width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem',
                    background: formIcon === icon ? 'var(--accent-violet-glow)' : 'var(--bg-secondary)',
                    border: formIcon === icon ? '2px solid var(--accent-violet)' : '1px solid var(--border)',
                    cursor: 'pointer', transition: 'all 0.15s',
                    fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    justifySelf: 'center',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Public / Private toggle */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {formPublic ? <Eye size={16} color="var(--accent-blue)" /> : <EyeOff size={16} color="var(--text-muted)" />}
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {formPublic ? 'Template public' : 'Template prive'}
              </span>
            </div>
            <button
              onClick={() => setFormPublic(!formPublic)}
              style={{
                width: '2.75rem', height: '1.5rem', borderRadius: '999px',
                border: 'none', cursor: 'pointer', position: 'relative',
                background: formPublic ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: '1.125rem', height: '1.125rem', borderRadius: '50%',
                background: 'white', position: 'absolute', top: '0.1875rem',
                left: formPublic ? '1.4375rem' : '0.1875rem',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
            {formPublic ? 'Visible par tous les utilisateurs' : 'Visible uniquement par vous'}
          </p>
        </div>

        {/* Exercises */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '0.75rem',
          }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              Exercices ({formExercises.length})
            </h3>
          </div>

          {formExercises.map((ex, idx) => (
            <div key={idx} className="exercise-card">
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                <div style={{
                  width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem',
                  background: `${formColor}20`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontSize: '0.75rem', fontWeight: 700, color: formColor,
                }}>
                  {idx + 1}
                </div>
                <input
                  className="input"
                  type="text"
                  placeholder="Nom de l'exercice"
                  value={ex.name}
                  onChange={e => updateFormExercise(idx, 'name', e.target.value)}
                  style={{ flex: 1 }}
                />
                {formExercises.length > 1 && (
                  <button
                    onClick={() => removeFormExercise(idx)}
                    className="btn-icon btn-icon-danger"
                    style={{ minWidth: '2rem', minHeight: '2rem' }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Sets + Reps */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Series</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="20"
                    value={ex.sets}
                    onChange={e => updateFormExercise(idx, 'sets', parseInt(e.target.value) || 1)}
                    style={{ textAlign: 'center' }}
                  />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Reps</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="10 ou 8-12"
                    value={ex.reps}
                    onChange={e => updateFormExercise(idx, 'reps', e.target.value)}
                    style={{ textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* Muscle groups chips */}
              <div>
                <label className="input-label">Groupes musculaires</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.25rem' }}>
                  {MUSCLE_GROUPS.map(muscle => {
                    const active = ex.muscle_groups.includes(muscle)
                    return (
                      <button
                        key={muscle}
                        onClick={() => toggleFormMuscle(idx, muscle)}
                        style={{
                          padding: '0.3rem 0.625rem',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          border: `1px solid ${active ? `${formColor}66` : 'var(--border)'}`,
                          background: active ? `${formColor}20` : 'transparent',
                          color: active ? formColor : 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          fontFamily: 'inherit',
                          minHeight: '2rem',
                        }}
                      >
                        {active && <Check size={10} style={{ marginRight: '0.25rem', display: 'inline' }} />}
                        {muscle}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}

          <button onClick={addFormExercise} className="btn btn-ghost btn-full" style={{ marginBottom: '0.5rem' }}>
            <PlusCircle size={16} /> Ajouter un exercice
          </button>
        </div>

        {/* Error */}
        {formError && (
          <div style={{
            padding: '0.75rem', borderRadius: '0.625rem',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem',
          }}>
            {formError}
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary btn-lg btn-full"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          {saving ? 'Sauvegarde...' : editingId ? 'Enregistrer les modifications' : 'Creer le template'}
        </button>
      </div>
    )
  }

  /* ─── Main list view ─── */
  return (
    <div className="fade-in">
      {/* ═══ My Templates ═══ */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Dumbbell size={18} color="var(--accent-violet)" />
            <h2 style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
              Mes templates
            </h2>
          </div>
          <button onClick={openCreate} className="btn btn-primary btn-sm">
            <Plus size={14} />
            Creer
          </button>
        </div>

        {loadingMine ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '5.5rem', borderRadius: '1rem' }} />
            ))}
          </div>
        ) : myTemplates.length === 0 ? (
          <div className="card empty-state">
            <Dumbbell size={40} color="var(--text-muted)" />
            <h3>Aucun template</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Creez votre premier template pour gagner du temps
            </p>
            <button onClick={openCreate} className="btn btn-primary btn-sm">
              <Plus size={14} />
              Creer un template
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myTemplates.map(tpl => {
              const exerciseCount = Array.isArray(tpl.exercises_json) ? tpl.exercises_json.length : 0
              const isConfirmingDelete = confirmDeleteId === tpl.id

              return (
                <div key={tpl.id} className="card" style={{ padding: '1rem' }}>
                  {/* Template header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    {/* Icon with colored dot */}
                    <div style={{
                      width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem',
                      background: `${tpl.color || TEMPLATE_COLORS[0]}15`,
                      border: `1px solid ${tpl.color || TEMPLATE_COLORS[0]}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.25rem', flexShrink: 0, position: 'relative',
                    }}>
                      {tpl.icon || '💪'}
                      <div style={{
                        position: 'absolute', bottom: '-2px', right: '-2px',
                        width: '0.75rem', height: '0.75rem', borderRadius: '50%',
                        background: tpl.color || TEMPLATE_COLORS[0],
                        border: '2px solid var(--bg-card)',
                      }} />
                    </div>

                    {/* Name + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {tpl.name}
                        </span>
                        <span className={tpl.is_public ? 'badge badge-blue' : 'badge badge-gray'} style={{ fontSize: '0.65rem' }}>
                          {tpl.is_public ? 'Public' : 'Prive'}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                      }}>
                        <span>{exerciseCount} exercice{exerciseCount > 1 ? 's' : ''}</span>
                        <span>Utilise : {formatDate(tpl.last_used_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {isConfirmingDelete ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.625rem', borderRadius: '0.625rem',
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    }}>
                      <span style={{ fontSize: '0.8125rem', color: '#f87171', flex: 1 }}>
                        Supprimer ce template ?
                      </span>
                      <button
                        onClick={() => handleDelete(tpl.id)}
                        disabled={deleting}
                        className="btn btn-danger btn-sm"
                        style={{ minHeight: '2.25rem' }}
                      >
                        {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Oui'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="btn btn-ghost btn-sm"
                        style={{ minHeight: '2.25rem' }}
                      >
                        Non
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                      gap: '0.5rem',
                    }}>
                      <button
                        onClick={() => onUseTemplate(tpl)}
                        className="btn btn-primary btn-sm"
                        style={{ minHeight: '2.25rem' }}
                      >
                        Utiliser
                      </button>
                      <button
                        onClick={() => openEdit(tpl)}
                        className="btn btn-ghost btn-sm"
                        style={{ minHeight: '2.25rem', minWidth: '2.25rem', padding: '0.375rem' }}
                        title="Modifier"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(tpl)}
                        className="btn btn-ghost btn-sm"
                        style={{ minHeight: '2.25rem', minWidth: '2.25rem', padding: '0.375rem' }}
                        title="Dupliquer"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(tpl.id)}
                        className="btn btn-ghost btn-sm"
                        style={{
                          minHeight: '2.25rem', minWidth: '2.25rem', padding: '0.375rem',
                          color: '#f87171', borderColor: 'rgba(239,68,68,0.3)',
                        }}
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ═══ Public / Community Templates ═══ */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginBottom: '1rem',
        }}>
          <Globe size={18} color="var(--accent-violet)" />
          <h2 style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
            Templates communautaires
          </h2>
        </div>

        {/* Muscle group filter chips */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.375rem',
          marginBottom: '1rem',
        }}>
          <button
            onClick={() => setPublicFilter(null)}
            style={{
              padding: '0.3rem 0.625rem',
              borderRadius: '999px',
              fontSize: '0.7rem',
              fontWeight: 600,
              border: `1px solid ${!publicFilter ? 'rgba(139,92,246,0.4)' : 'var(--border)'}`,
              background: !publicFilter ? 'var(--accent-violet-glow)' : 'transparent',
              color: !publicFilter ? '#a78bfa' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
              minHeight: '2rem',
            }}
          >
            Tous
          </button>
          {MUSCLE_GROUPS.map(muscle => {
            const active = publicFilter === muscle
            return (
              <button
                key={muscle}
                onClick={() => setPublicFilter(active ? null : muscle)}
                style={{
                  padding: '0.3rem 0.625rem',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  border: `1px solid ${active ? 'rgba(139,92,246,0.4)' : 'var(--border)'}`,
                  background: active ? 'var(--accent-violet-glow)' : 'transparent',
                  color: active ? '#a78bfa' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                  minHeight: '2rem',
                }}
              >
                {muscle}
              </button>
            )
          })}
        </div>

        {/* Sort indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          marginBottom: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)',
        }}>
          <ArrowDownWideNarrow size={12} />
          Trie par popularite
        </div>

        {loadingPublic ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '4.5rem', borderRadius: '0.75rem' }} />
            ))}
          </div>
        ) : filteredPublic.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <Users size={32} color="var(--text-muted)" />
            <h3>Aucun template communautaire</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {publicFilter
                ? `Aucun template pour "${publicFilter}"`
                : 'Soyez le premier a partager un template !'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {filteredPublic.map(tpl => {
              const exerciseCount = Array.isArray(tpl.exercises_json) ? tpl.exercises_json.length : 0
              const username = tpl.profiles?.username || 'Anonyme'
              const isMine = tpl.user_id === userId
              const isCopying = copyingId === tpl.id

              return (
                <div
                  key={tpl.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem', borderRadius: '0.75rem',
                    background: 'var(--bg-secondary)', border: `1px solid ${isMine ? 'rgba(139,92,246,0.3)' : 'var(--border)'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem',
                    background: `${tpl.color || TEMPLATE_COLORS[0]}15`,
                    border: `1px solid ${tpl.color || TEMPLATE_COLORS[0]}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.125rem', flexShrink: 0,
                  }}>
                    {tpl.icon || '💪'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {tpl.name}
                      </span>
                      {isMine && (
                        <span className="badge" style={{ fontSize: '0.6rem', background: 'var(--accent-violet-glow)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                          Le vôtre
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.125rem',
                      display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
                    }}>
                      <span>@{username}</span>
                      <span>{exerciseCount} ex.</span>
                      <span className="badge badge-amber" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                        {tpl.use_count || 0} utilisation{(tpl.use_count || 0) > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Use button — hidden for own templates */}
                  {!isMine && (
                    <button
                      onClick={() => handleCopyPublic(tpl)}
                      disabled={isCopying}
                      className="btn btn-ghost btn-sm"
                      style={{
                        flexShrink: 0, minHeight: '2.25rem',
                        borderColor: 'rgba(139,92,246,0.3)',
                        color: '#a78bfa',
                      }}
                    >
                      {isCopying ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <Plus size={14} />
                          <span style={{ fontSize: '0.75rem' }}>Utiliser</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
