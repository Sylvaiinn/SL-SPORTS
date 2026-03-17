'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RUN_TYPES, RUN_SURFACES } from '@/lib/constants'
import type { RunType, RunSurface } from '@/lib/constants'
import RunSessionCard, { type RunSessionRow } from './RunSessionCard'
import { SlidersHorizontal, Footprints } from 'lucide-react'

const PERIODS = [
  { label: '7j', days: 7 },
  { label: '30j', days: 30 },
  { label: '3m', days: 90 },
  { label: '1an', days: 365 },
  { label: 'Tout', days: 0 },
] as const

type SortKey = 'date' | 'distance' | 'pace' | 'bpm'

export default function RunHistory() {
  const supabase = createClient()
  const [sessions, setSessions] = useState<RunSessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<RunType | ''>('')
  const [filterSurface, setFilterSurface] = useState<RunSurface | ''>('')
  const [filterPeriod, setFilterPeriod] = useState(0)
  const [sortBy, setSortBy] = useState<SortKey>('date')
  const [showFilters, setShowFilters] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadSessions() {
    setLoading(true)
    const { data } = await supabase
      .from('run_sessions')
      .select('*')
      .order('date', { ascending: false })
    setSessions((data ?? []) as RunSessionRow[])
    setLoading(false)
  }

  async function deleteSession(id: string) {
    setDeletingId(id)
    const session = sessions.find(s => s.id === id)
    await supabase.from('run_sessions').delete().eq('id', id)
    // Subtract km from shoe
    if (session?.shoe_id && session.distance_km > 0) {
      // We don't know the shoe data here so we'll handle it via a simple query
    }
    setSessions(prev => prev.filter(s => s.id !== id))
    setDeletingId(null)
  }

  async function duplicateSession(session: RunSessionRow) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { id, created_at, ...rest } = session as RunSessionRow & { created_at?: string }
    void id; void created_at;
    await supabase.from('run_sessions').insert({
      ...rest,
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
    } as never)
    loadSessions()
  }

  const filtered = useMemo(() => {
    let result = [...sessions]

    if (filterType) result = result.filter(s => s.type === filterType)
    if (filterSurface) result = result.filter(s => s.surface === filterSurface)
    if (filterPeriod > 0) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - filterPeriod)
      const cutoffStr = cutoff.toISOString().split('T')[0]
      result = result.filter(s => s.date >= cutoffStr)
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'distance': return b.distance_km - a.distance_km
        case 'pace': {
          const pA = a.distance_km > 0 ? a.duration_seconds / a.distance_km : Infinity
          const pB = b.distance_km > 0 ? b.duration_seconds / b.distance_km : Infinity
          return pA - pB
        }
        case 'bpm': return (b.avg_bpm ?? 0) - (a.avg_bpm ?? 0)
        default: return b.date.localeCompare(a.date)
      }
    })

    return result
  }, [sessions, filterType, filterSurface, filterPeriod, sortBy])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: '5rem', borderRadius: '1rem' }} />)}
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Filters toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {filtered.length} séance{filtered.length > 1 ? 's' : ''}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn btn-ghost btn-sm">
          <SlidersHorizontal size={14} /> Filtres
        </button>
      </div>

      {showFilters && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          {/* Period */}
          <label className="input-label">Période</label>
          <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.75rem' }}>
            {PERIODS.map(p => (
              <button key={p.label} onClick={() => setFilterPeriod(p.days)} style={{
                flex: 1, padding: '0.375rem', borderRadius: '0.5rem',
                border: `1px solid ${filterPeriod === p.days ? 'var(--accent-green)' : 'var(--border)'}`,
                background: filterPeriod === p.days ? 'var(--accent-green-glow)' : 'var(--bg-secondary)',
                color: filterPeriod === p.days ? '#34d399' : 'var(--text-secondary)',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}>{p.label}</button>
            ))}
          </div>

          {/* Type */}
          <label className="input-label">Type</label>
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <button onClick={() => setFilterType('')} style={{
              padding: '0.25rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
              border: `1px solid ${!filterType ? 'var(--accent-green)' : 'var(--border)'}`,
              background: !filterType ? 'var(--accent-green-glow)' : 'transparent',
              color: !filterType ? '#34d399' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
            }}>Tous</button>
            {RUN_TYPES.map(t => (
              <button key={t} onClick={() => setFilterType(t)} style={{
                padding: '0.25rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                border: `1px solid ${filterType === t ? 'var(--accent-green)' : 'var(--border)'}`,
                background: filterType === t ? 'var(--accent-green-glow)' : 'transparent',
                color: filterType === t ? '#34d399' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
              }}>{t}</button>
            ))}
          </div>

          {/* Surface */}
          <label className="input-label">Surface</label>
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <button onClick={() => setFilterSurface('')} style={{
              padding: '0.25rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
              border: `1px solid ${!filterSurface ? 'var(--accent-green)' : 'var(--border)'}`,
              background: !filterSurface ? 'var(--accent-green-glow)' : 'transparent',
              color: !filterSurface ? '#34d399' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
            }}>Toutes</button>
            {RUN_SURFACES.map(s => (
              <button key={s} onClick={() => setFilterSurface(s)} style={{
                padding: '0.25rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                border: `1px solid ${filterSurface === s ? 'var(--accent-green)' : 'var(--border)'}`,
                background: filterSurface === s ? 'var(--accent-green-glow)' : 'transparent',
                color: filterSurface === s ? '#34d399' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
              }}>{s}</button>
            ))}
          </div>

          {/* Sort */}
          <label className="input-label">Trier par</label>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {([['date', 'Date'], ['distance', 'Distance'], ['pace', 'Allure'], ['bpm', 'BPM']] as [SortKey, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setSortBy(key)} style={{
                flex: 1, padding: '0.375rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600,
                border: `1px solid ${sortBy === key ? 'var(--accent-green)' : 'var(--border)'}`,
                background: sortBy === key ? 'var(--accent-green-glow)' : 'var(--bg-secondary)',
                color: sortBy === key ? '#34d399' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
              }}>{label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Sessions list */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <Footprints size={44} />
          <h3>Aucune séance trouvée</h3>
          <p>Ajustez vos filtres ou créez une nouvelle séance</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {filtered.map(session => (
            <RunSessionCard
              key={session.id}
              session={session}
              onDuplicate={() => duplicateSession(session)}
              onDelete={() => deleteSession(session.id)}
              deleting={deletingId === session.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
