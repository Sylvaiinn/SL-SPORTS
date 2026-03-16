'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Waves, ChevronDown, ChevronUp, Pencil, Trash2, Save, Loader2, X, CheckCircle, Play, History } from 'lucide-react'

interface SwimBlockRaw { label: string; type: string; distance: number; description: string; pace?: string }
interface SwimSessionRow {
  id: string
  style: string
  distance_m: number
  date: string
  notes: string | null
  plan_json: {
    warmup: SwimBlockRaw[]
    main: SwimBlockRaw[]
    cooldown: SwimBlockRaw[]
  }
}

const STYLE_BADGE: Record<string, string> = {
  Endurance: 'badge-blue',
  Vitesse: 'badge-rose',
  Technique: 'badge-violet',
  Mixte: 'badge-teal',
}

function SwimSessionCard({ session, onUpdated, onDeleted }: {
  session: SwimSessionRow
  onUpdated: (id: string, notes: string) => void
  onDeleted: (id: string) => void
}) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(session.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saved, setSaved] = useState(false)

  const plan = session.plan_json
  const allBlocks = plan ? [...(plan.warmup ?? []), ...(plan.main ?? []), ...(plan.cooldown ?? [])] : []

  async function saveNotes() {
    setSaving(true)
    await supabase.from('swim_sessions').update({ notes } as never).eq('id', session.id)
    setSaving(false)
    setEditingNotes(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    onUpdated(session.id, notes)
  }

  async function deleteSession() {
    setDeleting(true)
    await supabase.from('swim_sessions').delete().eq('id', session.id)
    onDeleted(session.id)
  }

  const blockTypeColor: Record<string, string> = {
    warmup: 'var(--accent-amber)', main: 'var(--accent-blue)',
    cooldown: 'var(--accent-teal)', rest: '#6b7280',
  }
  const blockTypeBadge: Record<string, string> = {
    warmup: 'badge-amber', main: 'badge-blue', cooldown: 'badge-teal', rest: 'badge-gray',
  }
  const blockTypeLabel: Record<string, string> = {
    warmup: 'Échauffement', main: 'Corps', cooldown: 'Récupération', rest: 'Récup. active',
  }

  return (
    <div className="card" style={{ marginBottom: '0.875rem' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setOpen(v => !v)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <Waves size={16} color="var(--accent-teal)" />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{session.style} — {session.distance_m}m</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <span className={`badge ${STYLE_BADGE[session.style] ?? 'badge-gray'}`}>{session.style}</span>
            <span className="badge badge-gray">{allBlocks.length} blocs</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
          <button
            onClick={() => setEditingNotes(v => !v)}
            className="btn-icon"
            style={{ background: 'var(--accent-blue-glow)', color: 'var(--accent-blue)' }}
            title="Ajouter/modifier une description"
          >
            <Pencil size={14} />
          </button>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="btn-icon btn-icon-danger" title="Supprimer">
              <Trash2 size={14} />
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button onClick={deleteSession} disabled={deleting} className="btn-icon btn-icon-danger" title="Confirmer suppression">
                {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="btn-icon" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                <X size={12} />
              </button>
            </div>
          )}
          <button onClick={() => setOpen(v => !v)} className="btn-icon" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Notes/description section */}
      {editingNotes && (
        <div style={{ marginTop: '0.875rem', borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
          <label className="input-label" style={{ marginBottom: '0.375rem' }}>📝 Description / Ce que j&apos;ai vraiment fait</label>
          <textarea
            className="input"
            rows={3}
            placeholder="Ex: J'ai arrêté à 2000m, remplacé les sprints par 100m crawl, sensation de jambes lourdes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ resize: 'vertical', padding: '0.625rem 0.875rem' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem' }}>
            <button onClick={saveNotes} disabled={saving} className="btn btn-primary btn-sm">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button onClick={() => setEditingNotes(false)} className="btn btn-ghost btn-sm">Annuler</button>
          </div>
        </div>
      )}

      {/* Saved indicator */}
      {saved && (
        <div style={{ marginTop: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--accent-teal)' }}>
          <CheckCircle size={14} /> Description sauvegardée
        </div>
      )}

      {/* Existing notes display */}
      {!editingNotes && notes && (
        <div style={{ marginTop: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.25rem' }}>Mes notes</span>
          {notes}
        </div>
      )}

      {/* Expandable plan */}
      {open && plan && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
          {[
            { label: 'Échauffement', blocks: plan.warmup ?? [], color: 'var(--accent-amber)' },
            { label: 'Corps de séance', blocks: plan.main ?? [], color: 'var(--accent-blue)' },
            { label: 'Récupération', blocks: plan.cooldown ?? [], color: 'var(--accent-teal)' },
          ].filter(g => g.blocks.length > 0).map((group) => (
            <div key={group.label} style={{ marginBottom: '0.875rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: group.color, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                {group.label} · {group.blocks.reduce((a, b) => a + b.distance, 0)}m
              </div>
              {group.blocks.map((b, i) => (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column', padding: '0.625rem 0.875rem',
                  borderRadius: '0.625rem', borderLeft: `3px solid ${blockTypeColor[b.type] ?? '#6b7280'}`,
                  background: 'var(--bg-secondary)', marginBottom: '0.375rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{b.label}</span>
                    <span className={`badge ${blockTypeBadge[b.type] ?? 'badge-gray'}`}>{blockTypeLabel[b.type] ?? b.type}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{b.distance}m</span>
                    {b.pace && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.pace}</span>}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.375rem', lineHeight: 1.5 }}>{b.description}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SwimHistoryPage() {
  const supabase = createClient()
  const router = useRouter()
  const [sessions, setSessions] = useState<SwimSessionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('swim_sessions')
        .select('id, style, distance_m, date, notes, plan_json')
        .order('date', { ascending: false })
      setSessions((data ?? []) as SwimSessionRow[])
      setLoading(false)
    }
    load()
  }, [])

  function handleUpdated(id: string, notes: string) {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, notes } : s))
  }

  function handleDeleted(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '1rem' }}>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '5rem', borderRadius: '1rem' }} />)}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="empty-state">
        <Waves size={44} />
        <h3>Aucune séance sauvegardée</h3>
        <p>Générez et sauvegardez une séance dans l&apos;onglet Générer.</p>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Natation</h1>
        <p>Historique de vos séances</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '0.875rem', padding: '0.25rem', marginBottom: '1.5rem', border: '1px solid var(--border)', gap: '0.25rem' }}>
        <button onClick={() => router.push('/natation')} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 500, background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', transition: 'all 0.2s' }}>
          <Play size={14} /> Générer
        </button>
        <button style={{ flex: 1, padding: '0.5rem', borderRadius: '0.625rem', border: 'none', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 700, background: 'var(--accent-teal)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
          <History size={14} /> Historique
        </button>
      </div>

      {sessions.map(s => (
        <SwimSessionCard
          key={s.id}
          session={s}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  )
}
