'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateSwimSession, type SwimStyle, type SwimDistance, type SwimBlock } from '@/lib/swimGenerator'
import { Waves, Play, Save, Flame, Zap, Target, Shuffle, Loader2, ChevronDown } from 'lucide-react'

const STYLES: { value: SwimStyle; label: string; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { value: 'Endurance', label: 'Endurance', icon: Flame },
  { value: 'Vitesse', label: 'Vitesse', icon: Zap },
  { value: 'Technique', label: 'Technique', icon: Target },
  { value: 'Mixte', label: 'Mixte', icon: Shuffle },
]

const DISTANCES: SwimDistance[] = [1000, 1500, 2500, 3500]

const STYLE_COLORS: Record<SwimStyle, { bg: string; color: string; badge: string }> = {
  Endurance: { bg: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', badge: 'badge-blue' },
  Vitesse: { bg: 'rgba(244,63,94,0.1)', color: '#fb7185', badge: 'badge-rose' },
  Technique: { bg: 'var(--accent-violet-glow)', color: 'var(--accent-violet)', badge: 'badge-violet' },
  Mixte: { bg: 'var(--accent-teal-glow)', color: 'var(--accent-teal)', badge: 'badge-teal' },
}

const BLOCK_TYPE_LABEL: Record<SwimBlock['type'], string> = {
  warmup: 'Échauffement',
  main: 'Corps de séance',
  cooldown: 'Récupération',
  rest: 'Récupération active',
}

function BlockCard({ block }: { block: SwimBlock }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`swim-block ${block.type}`} style={{ cursor: 'pointer' }} onClick={() => setOpen((v) => !v)}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{block.label}</div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`badge ${block.type === 'warmup' ? 'badge-amber' : block.type === 'cooldown' ? 'badge-teal' : block.type === 'rest' ? 'badge-gray' : 'badge-blue'}`}>
                {BLOCK_TYPE_LABEL[block.type]}
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{block.distance}m</span>
              {block.pace && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{block.pace}</span>}
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

export default function NatationPage() {
  const supabase = createClient()
  const [selectedStyle, setSelectedStyle] = useState<SwimStyle>('Endurance')
  const [selectedDistance, setSelectedDistance] = useState<SwimDistance>(2500)
  const [plan, setPlan] = useState<ReturnType<typeof generateSwimSession> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function generate() {
    const result = generateSwimSession(selectedStyle, selectedDistance)
    setPlan(result)
    setSaved(false)
    window.scrollTo({ top: 400, behavior: 'smooth' })
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const styleColors = STYLE_COLORS[selectedStyle]
  const allBlocks = plan ? [...plan.warmup, ...plan.main, ...plan.cooldown] : []

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Natation</h1>
        <p>Générateur de séances personnalisées</p>
      </div>

      {/* Style selector */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <label className="input-label" style={{ marginBottom: '0.625rem' }}>Style de séance</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {STYLES.map(({ value, label, icon: Icon }) => {
            const selected = selectedStyle === value
            const c = STYLE_COLORS[value]
            return (
              <button
                key={value}
                onClick={() => setSelectedStyle(value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem',
                  borderRadius: '0.75rem', border: `1px solid ${selected ? c.color : 'var(--border)'}`,
                  background: selected ? c.bg : 'var(--bg-secondary)', cursor: 'pointer',
                  transition: 'all 0.2s', fontFamily: 'inherit',
                  color: selected ? c.color : 'var(--text-secondary)', fontWeight: selected ? 700 : 500,
                }}
              >
                <Icon size={18} color={selected ? c.color : 'var(--text-muted)'} />
                <span style={{ fontSize: '0.9rem' }}>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Distance selector */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <label className="input-label" style={{ marginBottom: '0.625rem' }}>Distance totale</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {DISTANCES.map((d) => {
            const selected = selectedDistance === d
            return (
              <button
                key={d}
                onClick={() => setSelectedDistance(d)}
                style={{
                  padding: '0.75rem 0.25rem', borderRadius: '0.75rem',
                  border: `1px solid ${selected ? 'var(--accent-teal)' : 'var(--border)'}`,
                  background: selected ? 'var(--accent-teal-glow)' : 'var(--bg-secondary)',
                  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', fontWeight: 700,
                  color: selected ? 'var(--accent-teal)' : 'var(--text-secondary)', fontSize: '0.9rem',
                }}
              >
                {(d / 1000).toFixed(1)}km
              </button>
            )
          })}
        </div>
      </div>

      {/* Generate button */}
      <button onClick={generate} className="btn btn-teal btn-lg btn-full" style={{ marginBottom: '2rem' }}>
        <Play size={18} fill="white" />
        Générer la séance
      </button>

      {/* Plan display */}
      {plan && (
        <div className="fade-in">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                Séance {plan.style}
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem' }}>
                <span className={`badge ${styleColors.badge}`}>{plan.style}</span>
                <span className="badge badge-teal">{plan.totalDistance}m</span>
                <span className="badge badge-gray">{allBlocks.length} blocs</span>
              </div>
            </div>
            <button onClick={savePlan} disabled={saving || saved} className={`btn ${saved ? 'btn-ghost' : 'btn-violet'} btn-sm`}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saved ? 'Sauvegardé ✓' : 'Sauvegarder'}
            </button>
          </div>

          {/* Warmup */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-amber)', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Échauffement · {plan.warmup.reduce((a, b) => a + b.distance, 0)}m</span>
            </div>
            {plan.warmup.map((b, i) => <BlockCard key={i} block={b} />)}
          </div>

          {/* Main */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-blue)', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Corps de séance · {plan.main.reduce((a, b) => a + b.distance, 0)}m</span>
            </div>
            {plan.main.map((b, i) => <BlockCard key={i} block={b} />)}
          </div>

          {/* Cooldown */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-teal)', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Récupération · {plan.cooldown.reduce((a, b) => a + b.distance, 0)}m</span>
            </div>
            {plan.cooldown.map((b, i) => <BlockCard key={i} block={b} />)}
          </div>
        </div>
      )}

      {!plan && (
        <div className="empty-state">
          <Waves size={44} />
          <h3>Générez votre première séance</h3>
          <p>Choisissez un style et une distance, puis appuyez sur Générer.</p>
        </div>
      )}
    </div>
  )
}
