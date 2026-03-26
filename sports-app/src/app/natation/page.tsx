'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  generateSwimSession,
  type SwimStyle, type SwimLevel, type SwimEquipment, type SwimBlock
} from '@/lib/swimGenerator'
import {
  Waves, Play, Save, Flame, Zap, Target, Shuffle,
  Loader2, ChevronDown, History, Timer, PlusCircle, Clock
} from 'lucide-react'

const STYLES: { value: SwimStyle; label: string; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { value: 'Endurance', label: 'Endurance', icon: Flame },
  { value: 'Vitesse', label: 'Vitesse', icon: Zap },
  { value: 'Technique', label: 'Technique', icon: Target },
  { value: 'Mixte', label: 'Mixte', icon: Shuffle },
]

const PRESET_DISTANCES = [1000, 1500, 2500, 3500]

const LEVELS: { value: SwimLevel; label: string; desc: string; color: string }[] = [
  { value: 'Débutant', label: 'Débutant', desc: 'RPE réduit, pauses autorisées', color: '#34d399' },
  { value: 'Intermédiaire', label: 'Intermédiaire', desc: 'Rythme standard', color: '#60a5fa' },
  { value: 'Avancé', label: 'Avancé', desc: 'RPE élevé, volume intense', color: '#f87171' },
]

const EQUIPMENT_OPTIONS: { value: SwimEquipment; label: string; icon: string }[] = [
  { value: 'palmes', label: 'Palmes', icon: '🦈' },
  { value: 'pull-buoy', label: 'Pull-buoy', icon: '🟡' },
  { value: 'planche', label: 'Planche', icon: '🏄' },
  { value: 'plaquette', label: 'Plaquettes', icon: '🤲' },
]

const STYLE_COLORS: Record<SwimStyle, { bg: string; color: string; badge: string }> = {
  Endurance: { bg: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', badge: 'badge-blue' },
  Vitesse: { bg: 'rgba(244,63,94,0.1)', color: '#fb7185', badge: 'badge-rose' },
  Technique: { bg: 'var(--accent-violet-glow)', color: 'var(--accent-violet)', badge: 'badge-violet' },
  Mixte: { bg: 'var(--accent-teal-glow)', color: 'var(--accent-teal)', badge: 'badge-teal' },
}

const BLOCK_TYPE_LABEL: Record<SwimBlock['type'], string> = {
  warmup: 'Échauffement', main: 'Corps de séance', cooldown: 'Récupération', rest: 'Récup. active',
}

function BlockCard({ block }: { block: SwimBlock }) {
  const [open, setOpen] = useState(false)
  const equipLabels: Record<SwimEquipment, string> = { palmes: '🦈', 'pull-buoy': '🟡', planche: '🏄', plaquette: '🤲' }
  return (
    <div className={`swim-block ${block.type}`} style={{ cursor: 'pointer' }} onClick={() => setOpen(v => !v)}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{block.label}</div>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`badge ${block.type === 'warmup' ? 'badge-amber' : block.type === 'cooldown' ? 'badge-teal' : block.type === 'rest' ? 'badge-gray' : 'badge-blue'}`}>
                {BLOCK_TYPE_LABEL[block.type]}
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{block.distance}m</span>
              {block.pace && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{block.pace}</span>}
              {block.restSeconds && block.restSeconds > 0 && block.type === 'main' && (
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                  <Timer size={11} />{block.restSeconds}s
                </span>
              )}
              {block.equipment?.map(e => equipLabels[e]).join(' ')}
            </div>
          </div>
          <ChevronDown size={16} color="var(--text-muted)" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
        </div>
        {open && (
          <p style={{ marginTop: '0.625rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: '0.625rem' }}>
            {block.description}
          </p>
        )}
      </div>
    </div>
  )
}

type TabId = 'generate' | 'manual' | 'history'

function NatationPageInner() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    searchParams.get('tab') === 'saisir' ? 'manual' : 'generate'
  )

  // Generator state
  const [selectedStyle, setSelectedStyle] = useState<SwimStyle>('Endurance')
  const [selectedLevel, setSelectedLevel] = useState<SwimLevel>('Intermédiaire')
  const [selectedDistance, setSelectedDistance] = useState<number>(2500)
  const [customDistance, setCustomDistance] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [equipment, setEquipment] = useState<SwimEquipment[]>([])
  const [restSeconds, setRestSeconds] = useState(30)
  const [plan, setPlan] = useState<ReturnType<typeof generateSwimSession> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Manual session state
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0])
  const [manualStyle, setManualStyle] = useState<SwimStyle>('Endurance')
  const [manualDistance, setManualDistance] = useState('')
  const [manualDurationMin, setManualDurationMin] = useState('')
  const [manualEquipment, setManualEquipment] = useState<SwimEquipment[]>([])
  const [manualNotes, setManualNotes] = useState('')
  const [manualSaving, setManualSaving] = useState(false)
  const [manualError, setManualError] = useState('')
  const [manualSaved, setManualSaved] = useState(false)

  function toggleEquipment(e: SwimEquipment) {
    setEquipment(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])
  }

  function toggleManualEquipment(e: SwimEquipment) {
    setManualEquipment(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])
  }

  function generate() {
    const dist = useCustom && customDistance ? Math.max(200, parseInt(customDistance) || 1000) : selectedDistance
    const result = generateSwimSession({ style: selectedStyle, distance: dist, level: selectedLevel, equipment, restSeconds })
    setPlan(result)
    setSaved(false)
    window.scrollTo({ top: 500, behavior: 'smooth' })
  }

  async function savePlan() {
    if (!plan) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('swim_sessions').insert({
        user_id: user.id,
        style: plan.style,
        distance_m: plan.totalDistance,
        plan_json: plan as unknown as Record<string, unknown>,
        date: new Date().toISOString().split('T')[0],
      } as never)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  async function saveManualSession() {
    if (!manualDistance || parseInt(manualDistance) < 50) {
      setManualError('Renseignez une distance valide (min 50m)')
      return
    }
    setManualError('')
    setManualSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')
      const durationSec = manualDurationMin ? Math.round(parseFloat(manualDurationMin) * 60) : null
      await supabase.from('swim_sessions').insert({
        user_id: user.id,
        style: manualStyle,
        distance_m: parseInt(manualDistance),
        plan_json: {
          manual: true,
          equipment: manualEquipment,
          duration_seconds: durationSec,
          notes: manualNotes || null,
        },
        date: manualDate,
        notes: manualNotes || null,
      } as never)
      setManualSaved(true)
      setManualDistance('')
      setManualDurationMin('')
      setManualNotes('')
      setManualEquipment([])
    } catch (err: unknown) {
      const e = err as { message?: string }
      setManualError(e?.message ?? 'Erreur lors de la sauvegarde')
    } finally {
      setManualSaving(false)
    }
  }

  const styleColors = STYLE_COLORS[selectedStyle]
  const allBlocks = plan ? [...plan.warmup, ...plan.main, ...plan.cooldown] : []

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'generate', label: 'Générer', icon: <Play size={14} fill="currentColor" /> },
    { id: 'manual', label: 'Saisir', icon: <PlusCircle size={14} /> },
    { id: 'history', label: 'Historique', icon: <History size={14} /> },
  ]

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Natation</h1>
        <p>{activeTab === 'generate' ? 'Génération de séances personnalisées' : activeTab === 'manual' ? 'Saisie manuelle d\'une séance' : 'Historique des séances'}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '0.875rem', padding: '0.25rem', marginBottom: '1.5rem', border: '1px solid var(--border)', gap: '0.25rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => tab.id === 'history' ? router.push('/natation/historique') : setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '0.5rem', borderRadius: '0.625rem', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: activeTab === tab.id ? 700 : 500,
              background: activeTab === tab.id ? 'var(--accent-blue)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Onglet Générer ── */}
      {activeTab === 'generate' && (
        <>
          {/* Style */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <label className="input-label" style={{ marginBottom: '0.625rem' }}>Style de séance</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {STYLES.map(({ value, label, icon: Icon }) => {
                const selected = selectedStyle === value
                const c = STYLE_COLORS[value]
                return (
                  <button key={value} onClick={() => setSelectedStyle(value)} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem', borderRadius: '0.75rem', border: `1px solid ${selected ? c.color : 'var(--border)'}`, background: selected ? c.bg : 'var(--bg-secondary)', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', color: selected ? c.color : 'var(--text-secondary)', fontWeight: selected ? 700 : 500 }}>
                    <Icon size={18} color={selected ? c.color : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.9rem' }}>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Level */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <label className="input-label" style={{ marginBottom: '0.625rem' }}>Niveau</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {LEVELS.map(({ value, label, desc, color }) => {
                const selected = selectedLevel === value
                return (
                  <button key={value} onClick={() => setSelectedLevel(value)} style={{ flex: 1, padding: '0.625rem 0.375rem', borderRadius: '0.75rem', border: `1px solid ${selected ? color : 'var(--border)'}`, background: selected ? `${color}18` : 'var(--bg-secondary)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: selected ? color : 'var(--text-secondary)' }}>{label}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{desc}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Distance */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <label className="input-label" style={{ marginBottom: '0.625rem' }}>Distance totale</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.625rem' }}>
              {PRESET_DISTANCES.map(d => {
                const selected = !useCustom && selectedDistance === d
                return (
                  <button key={d} onClick={() => { setSelectedDistance(d); setUseCustom(false) }} style={{ padding: '0.75rem 0.25rem', borderRadius: '0.75rem', border: `1px solid ${selected ? 'var(--accent-blue)' : 'var(--border)'}`, background: selected ? 'var(--accent-blue-glow)' : 'var(--bg-secondary)', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', fontWeight: 700, color: selected ? 'var(--accent-blue)' : 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {d}m
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number" min="200" step="50" placeholder="Distance libre (m)"
                value={customDistance}
                onChange={e => { setCustomDistance(e.target.value); setUseCustom(true) }}
                onFocus={() => setUseCustom(true)}
                className="input"
                style={{ flex: 1, borderColor: useCustom ? 'var(--accent-blue)' : undefined }}
              />
              {useCustom && customDistance && (
                <span style={{ fontSize: '0.875rem', color: 'var(--accent-blue)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {customDistance}m
                </span>
              )}
            </div>
          </div>

          {/* Equipment */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <label className="input-label" style={{ marginBottom: '0.625rem' }}>Équipement disponible</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {EQUIPMENT_OPTIONS.map(({ value, label, icon }) => {
                const active = equipment.includes(value)
                return (
                  <button key={value} onClick={() => toggleEquipment(value)} style={{ padding: '0.5rem 0.25rem', borderRadius: '0.75rem', border: `1px solid ${active ? 'var(--accent-violet)' : 'var(--border)'}`, background: active ? 'var(--accent-violet-glow)' : 'var(--bg-secondary)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{icon}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: active ? 700 : 500, color: active ? '#c4b5fd' : 'var(--text-muted)' }}>{label}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Rest time */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>
                <Timer size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />
                Repos entre les séries
              </label>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{restSeconds}s</span>
            </div>
            <input
              type="range" min="0" max="120" step="5"
              value={restSeconds}
              onChange={e => setRestSeconds(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <span>0s (continu)</span><span>30s</span><span>60s</span><span>120s</span>
            </div>
          </div>

          <button onClick={generate} className="btn btn-primary btn-lg btn-full" style={{ marginBottom: '2rem' }}>
            <Play size={18} fill="white" /> Générer la séance
          </button>

          {/* Plan */}
          {plan && (
            <div className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Séance {plan.style}</h2>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                    <span className={`badge ${styleColors.badge}`}>{plan.style}</span>
                    <span className="badge badge-blue">{plan.totalDistance}m</span>
                    <span className="badge badge-gray">{plan.level}</span>
                    <span className="badge badge-gray">{allBlocks.length} blocs</span>
                    {plan.equipment.length > 0 && <span className="badge badge-violet">{plan.equipment.join(' · ')}</span>}
                    {plan.restSeconds > 0 && <span className="badge badge-amber"><Timer size={10} style={{ display: 'inline' }} /> {plan.restSeconds}s repos</span>}
                  </div>
                </div>
                <button onClick={savePlan} disabled={saving || saved} className={`btn ${saved ? 'btn-ghost' : 'btn-violet'} btn-sm`}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saved ? 'Sauvegardé ✓' : 'Sauvegarder'}
                </button>
              </div>

              {[
                { label: 'Échauffement', blocks: plan.warmup, color: 'var(--accent-amber)' },
                { label: 'Corps de séance', blocks: plan.main, color: 'var(--accent-blue)' },
                { label: 'Récupération', blocks: plan.cooldown, color: 'var(--accent-teal)' },
              ].filter(g => g.blocks.length > 0).map(group => (
                <div key={group.label} style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: group.color, flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: group.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {group.label} · {group.blocks.reduce((a, b) => a + b.distance, 0)}m
                    </span>
                  </div>
                  {group.blocks.map((b, i) => <BlockCard key={i} block={b} />)}
                </div>
              ))}
            </div>
          )}

          {!plan && (
            <div className="empty-state">
              <Waves size={44} />
              <h3>Générez votre séance</h3>
              <p>Choisissez le style, le niveau et les options, puis appuyez sur Générer.</p>
            </div>
          )}
        </>
      )}

      {/* ── Onglet Saisir manuellement ── */}
      {activeTab === 'manual' && (
        <div className="fade-in">
          {manualSaved ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Séance enregistrée !</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Votre séance de natation a été sauvegardée.</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => { setManualSaved(false); setManualDate(new Date().toISOString().split('T')[0]) }} className="btn btn-primary" style={{ flex: 1 }}>
                  Nouvelle séance
                </button>
                <button onClick={() => router.push('/natation/historique')} className="btn btn-ghost" style={{ flex: 1 }}>
                  Historique
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Date */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Date</label>
                  <input className="input" type="date" value={manualDate} onChange={e => setManualDate(e.target.value)} />
                </div>
              </div>

              {/* Style */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <label className="input-label" style={{ marginBottom: '0.625rem' }}>Style de séance</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {STYLES.map(({ value, label, icon: Icon }) => {
                    const selected = manualStyle === value
                    const c = STYLE_COLORS[value]
                    return (
                      <button key={value} onClick={() => setManualStyle(value)} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem', borderRadius: '0.75rem', border: `1px solid ${selected ? c.color : 'var(--border)'}`, background: selected ? c.bg : 'var(--bg-secondary)', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', color: selected ? c.color : 'var(--text-secondary)', fontWeight: selected ? 700 : 500 }}>
                        <Icon size={18} color={selected ? c.color : 'var(--text-muted)'} />
                        <span style={{ fontSize: '0.9rem' }}>{label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Distance + Durée */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label className="input-label">Distance (m) *</label>
                    <input
                      className="input" type="number" min="50" step="50"
                      placeholder="Ex: 2000"
                      value={manualDistance}
                      onChange={e => setManualDistance(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label"><Clock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />Durée (min)</label>
                    <input
                      className="input" type="number" min="5" step="5"
                      placeholder="Ex: 45"
                      value={manualDurationMin}
                      onChange={e => setManualDurationMin(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Equipment */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <label className="input-label" style={{ marginBottom: '0.625rem' }}>Équipement utilisé</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {EQUIPMENT_OPTIONS.map(({ value, label, icon }) => {
                    const active = manualEquipment.includes(value)
                    return (
                      <button key={value} onClick={() => toggleManualEquipment(value)} style={{ padding: '0.5rem 0.25rem', borderRadius: '0.75rem', border: `1px solid ${active ? 'var(--accent-violet)' : 'var(--border)'}`, background: active ? 'var(--accent-violet-glow)' : 'var(--bg-secondary)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{icon}</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: active ? 700 : 500, color: active ? '#c4b5fd' : 'var(--text-muted)' }}>{label}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="input-group">
                  <label className="input-label">Notes (optionnel)</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Ressenti, conditions, commentaires..."
                    value={manualNotes}
                    onChange={e => setManualNotes(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>

              {manualError && (
                <div style={{ padding: '0.75rem', borderRadius: '0.625rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {manualError}
                </div>
              )}

              <button onClick={saveManualSession} disabled={manualSaving} className="btn btn-primary btn-lg btn-full">
                {manualSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {manualSaving ? 'Sauvegarde...' : 'Enregistrer la séance'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function NatationPage() {
  return (
    <Suspense>
      <NatationPageInner />
    </Suspense>
  )
}
