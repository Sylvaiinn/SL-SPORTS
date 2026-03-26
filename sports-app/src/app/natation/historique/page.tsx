'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Waves, ChevronDown, ChevronUp, Pencil, Trash2, Save, Loader2, X, CheckCircle, Play, History, Trophy, TrendingUp, PlusCircle } from 'lucide-react'
import ShareButton from '@/components/ShareButton'

type SwimStyle = 'Endurance' | 'Vitesse' | 'Technique' | 'Mixte'

interface SwimBlockRaw { label: string; type: string; distance: number; description: string; pace?: string; restSeconds?: number }
interface SwimSessionRow {
  id: string
  style: string
  distance_m: number
  date: string
  notes: string | null
  plan_json: {
    level?: string
    equipment?: string[]
    restSeconds?: number
    warmup: SwimBlockRaw[]
    main: SwimBlockRaw[]
    cooldown: SwimBlockRaw[]
  } | null
}

const STYLE_COLORS: Record<string, { badge: string; color: string }> = {
  Endurance: { badge: 'badge-blue', color: 'var(--accent-blue)' },
  Vitesse: { badge: 'badge-rose', color: '#fb7185' },
  Technique: { badge: 'badge-violet', color: 'var(--accent-violet)' },
  Mixte: { badge: 'badge-teal', color: 'var(--accent-teal)' },
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
    warmup: 'var(--accent-amber)', main: 'var(--accent-blue)', cooldown: 'var(--accent-teal)', rest: '#6b7280',
  }

  const styleInfo = STYLE_COLORS[session.style] ?? { badge: 'badge-gray', color: 'var(--text-muted)' }

  return (
    <div className="card" style={{ marginBottom: '0.875rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setOpen(v => !v)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <Waves size={16} color={styleInfo.color} />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {session.style} — {session.distance_m}m
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <span className={`badge ${styleInfo.badge}`}>{session.style}</span>
            {plan?.level && <span className="badge badge-gray">{plan.level}</span>}
            {plan?.equipment && plan.equipment.length > 0 && <span className="badge badge-violet">{plan.equipment.join(' ')}</span>}
            <span className="badge badge-gray">{allBlocks.length} blocs</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0, alignItems: 'center' }}>
          <button onClick={() => setEditingNotes(v => !v)} className="btn-icon" style={{ background: 'var(--accent-blue-glow)', color: 'var(--accent-blue)' }} title="Description">
            <Pencil size={14} />
          </button>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="btn-icon btn-icon-danger"><Trash2 size={14} /></button>
          ) : (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button onClick={deleteSession} disabled={deleting} className="btn-icon btn-icon-danger">
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

      {/* Notes editor */}
      {editingNotes && (
        <div style={{ marginTop: '0.875rem', borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
          <label className="input-label" style={{ marginBottom: '0.375rem' }}>📝 Ce que j&apos;ai vraiment fait</label>
          <textarea className="input" rows={3} placeholder="Distance réelle, sensations, modifications..." value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'vertical', padding: '0.625rem 0.875rem' }} />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem' }}>
            <button onClick={saveNotes} disabled={saving} className="btn btn-primary btn-sm">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button onClick={() => setEditingNotes(false)} className="btn btn-ghost btn-sm">Annuler</button>
          </div>
        </div>
      )}
      {saved && <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><CheckCircle size={14} /> Sauvegardé</div>}
      {!editingNotes && notes && (
        <div style={{ marginTop: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.25rem' }}>Mes notes</span>
          {notes}
        </div>
      )}

      {/* Expandable plan */}
      {open && plan && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
          <ShareButton session={{
            type: 'swim',
            title: `Natation ${session.style}`,
            date: session.date,
            stats: [
              { label: 'Distance', value: `${session.distance_m} m` },
              { label: 'Style', value: session.style },
              ...(allBlocks.length > 0 ? [{ label: 'Blocs', value: String(allBlocks.length) }] : []),
              ...(plan?.level ? [{ label: 'Niveau', value: plan.level }] : []),
            ],
          }} />
          {[
            { label: 'Échauffement', blocks: plan.warmup ?? [], color: 'var(--accent-amber)' },
            { label: 'Corps', blocks: plan.main ?? [], color: 'var(--accent-blue)' },
            { label: 'Récupération', blocks: plan.cooldown ?? [], color: 'var(--accent-teal)' },
          ].filter(g => g.blocks.length > 0).map(group => (
            <div key={group.label} style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: group.color, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                {group.label} · {group.blocks.reduce((a, b) => a + b.distance, 0)}m
              </div>
              {group.blocks.map((b, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', borderLeft: `3px solid ${blockTypeColor[b.type] ?? '#6b7280'}`, background: 'var(--bg-secondary)', marginBottom: '0.375rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{b.label}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{b.distance}m</span>
                    {b.pace && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.pace}</span>}
                    {b.restSeconds && b.restSeconds > 0 && b.type === 'main' && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)' }}>{b.restSeconds}s repos</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>{b.description}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Pure CSS bar chart - last 10 sessions */
function ProgressionChart({ sessions }: { sessions: SwimSessionRow[] }) {
  if (sessions.length < 2) return null
  const last10 = sessions.slice(0, 10).reverse()
  const maxDist = Math.max(...last10.map(s => s.distance_m))

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <TrendingUp size={15} color="var(--accent-blue)" />
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Progression — 10 dernières séances</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
        {last10.map((s, i) => {
          const pct = Math.max(10, (s.distance_m / maxDist) * 100)
          const styleColor = STYLE_COLORS[s.style]?.color ?? 'var(--accent-teal)'
          return (
            <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }} title={`${new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · ${s.style} · ${s.distance_m}m`}>
              <div style={{ width: '100%', height: `${pct}%`, borderRadius: '4px 4px 0 0', background: styleColor, opacity: i + 1 === last10.length ? 1 : 0.65, transition: 'height 0.4s ease', minHeight: '8px' }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
        {last10.map(s => (
          <div key={s.id} style={{ flex: 1, textAlign: 'center', fontSize: '0.55rem', color: 'var(--text-muted)', overflow: 'hidden' }}>
            {new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace(' ', '\n')}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.625rem', flexWrap: 'wrap' }}>
        {(Object.entries(STYLE_COLORS) as [string, {color: string}][]).map(([style, { color }]) => (
          <div key={style} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color }} />
            {style}
          </div>
        ))}
      </div>
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

  function handleUpdated(id: string, notes: string) { setSessions(prev => prev.map(s => s.id === id ? { ...s, notes } : s)) }
  function handleDeleted(id: string) { setSessions(prev => prev.filter(s => s.id !== id)) }

  // Stats
  const totalDistance = sessions.reduce((a, s) => a + s.distance_m, 0)
  const totalSessions = sessions.length

  // Records per style
  const records: Record<string, { distance: number; date: string }> = {}
  for (const s of sessions) {
    if (!records[s.style] || s.distance_m > records[s.style].distance) {
      records[s.style] = { distance: s.distance_m, date: s.date }
    }
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Natation</h1>
        <p>Historique de vos séances</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '0.875rem', padding: '0.25rem', marginBottom: '1.5rem', border: '1px solid var(--border)', gap: '0.25rem' }}>
        {[
          { label: 'Générer', icon: <Play size={14} />, onClick: () => router.push('/natation'), active: false },
          { label: 'Saisir', icon: <PlusCircle size={14} />, onClick: () => router.push('/natation?tab=saisir'), active: false },
          { label: 'Historique', icon: <History size={14} />, onClick: undefined, active: true },
        ].map(tab => (
          <button
            key={tab.label}
            onClick={tab.onClick}
            style={{
              flex: 1, padding: '0.5rem', borderRadius: '0.625rem', border: 'none',
              cursor: tab.onClick ? 'pointer' : 'default', fontFamily: 'inherit',
              fontSize: '0.875rem', fontWeight: tab.active ? 700 : 500,
              background: tab.active ? 'var(--accent-blue)' : 'transparent',
              color: tab.active ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.375rem', transition: 'all 0.2s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '5rem', borderRadius: '1rem' }} />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <Waves size={44} />
          <h3>Aucune séance sauvegardée</h3>
          <p>Générez et sauvegardez une séance dans l&apos;onglet Générer.</p>
        </div>
      ) : (
        <>
          {/* Global stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Distance totale', value: `${totalDistance} m`, icon: Waves, color: 'var(--accent-blue)', bg: 'var(--accent-blue-glow)' },
              { label: 'Séances total', value: String(totalSessions), icon: TrendingUp, color: 'var(--accent-blue)', bg: 'var(--accent-blue-glow)' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="stat-card" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                <div className="stat-icon" style={{ background: bg, width: '2rem', height: '2rem', borderRadius: '0.5rem' }}>
                  <Icon size={14} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Records per style */}
          {Object.keys(records).length > 0 && (
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <Trophy size={15} color="#fbbf24" />
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Records par style</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(records).map(([style, { distance, date }]) => {
                  const c = STYLE_COLORS[style] ?? { color: 'var(--accent-teal)', badge: 'badge-gray' }
                  return (
                    <div key={style} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: '0.625rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${c.badge}`}>{style}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#fbbf24' }}>
                          {distance} m
                        </span>
                        <Trophy size={12} color="#fbbf24" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Progression chart */}
          <ProgressionChart sessions={sessions} />

          {/* Sessions list */}
          {sessions.map(s => (
            <SwimSessionCard key={s.id} session={s} onUpdated={handleUpdated} onDeleted={handleDeleted} />
          ))}
        </>
      )}
    </div>
  )
}
