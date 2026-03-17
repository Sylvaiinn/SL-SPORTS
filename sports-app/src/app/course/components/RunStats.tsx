'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDuration, formatPaceShort } from '@/lib/runUtils'
import { RUN_TYPE_COLORS } from '@/lib/constants'
import type { RunType } from '@/lib/constants'
import DonutChart from '@/components/DonutChart'
import LineChart from '@/components/LineChart'
import BarChart from '@/components/BarChart'
import { Mountain, Clock, Footprints, AlertTriangle } from 'lucide-react'

interface RunRow {
  id: string; date: string; distance_km: number; duration_seconds: number
  avg_bpm: number | null; type: string; elevation_pos: number | null
  shoe_id: string | null
}

interface ShoeRow {
  id: string; name: string; brand: string | null; total_km: number; max_km: number
}

const PERIOD_OPTIONS = [
  { label: 'Semaine', key: 'week' },
  { label: 'Mois', key: 'month' },
  { label: 'Année', key: 'year' },
  { label: 'Tout', key: 'all' },
] as const

type PeriodKey = (typeof PERIOD_OPTIONS)[number]['key']

function getStartDate(period: PeriodKey): string | null {
  if (period === 'all') return null
  const d = new Date()
  if (period === 'week') d.setDate(d.getDate() - 7)
  else if (period === 'month') d.setMonth(d.getMonth() - 1)
  else if (period === 'year') d.setFullYear(d.getFullYear() - 1)
  return d.toISOString().split('T')[0]
}

export default function RunStats() {
  const supabase = createClient()
  const [sessions, setSessions] = useState<RunRow[]>([])
  const [shoes, setShoes] = useState<ShoeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodKey>('all')

  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: sh }] = await Promise.all([
        supabase.from('run_sessions').select('id, date, distance_km, duration_seconds, avg_bpm, type, elevation_pos, shoe_id').order('date', { ascending: true }),
        supabase.from('running_shoes').select('id, name, brand, total_km, max_km'),
      ])
      setSessions((s ?? []) as RunRow[])
      setShoes((sh ?? []) as ShoeRow[])
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const start = getStartDate(period)
    if (!start) return sessions
    return sessions.filter(s => s.date >= start)
  }, [sessions, period])

  const totalKm = filtered.reduce((a, s) => a + s.distance_km, 0)
  const totalElev = filtered.reduce((a, s) => a + (s.elevation_pos ?? 0), 0)
  const totalTime = filtered.reduce((a, s) => a + s.duration_seconds, 0)

  // Donut: sessions by type
  const typeGroups = useMemo(() => {
    const map: Record<string, number> = {}
    filtered.forEach(s => { map[s.type] = (map[s.type] || 0) + 1 })
    return Object.entries(map).map(([type, count]) => ({
      label: type, value: count,
      color: RUN_TYPE_COLORS[type as RunType]?.color || 'var(--text-muted)',
    }))
  }, [filtered])

  // Last 30 sessions for pace & BPM charts
  const last30 = useMemo(() => sessions.slice(-30), [sessions])
  const paceData = useMemo(() => last30.filter(s => s.distance_km > 0).map(s => ({
    label: new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    value: Math.round(s.duration_seconds / s.distance_km),
  })), [last30])
  const bpmData = useMemo(() => last30.filter(s => s.avg_bpm).map(s => ({
    label: new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    value: s.avg_bpm!,
  })), [last30])

  // Weekly load: last 12 weeks
  const weeklyLoad = useMemo(() => {
    const weeks: { label: string; value: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const end = new Date()
      end.setDate(end.getDate() - i * 7)
      const start = new Date(end)
      start.setDate(start.getDate() - 6)
      const startStr = start.toISOString().split('T')[0]
      const endStr = end.toISOString().split('T')[0]
      const km = sessions.filter(s => s.date >= startStr && s.date <= endStr).reduce((a, s) => a + s.distance_km, 0)
      weeks.push({
        label: `S${12 - i}`,
        value: Math.round(km * 10) / 10,
      })
    }
    return weeks
  }, [sessions])

  // Long run progression: max distance per week over last 12 weeks
  const longRunProg = useMemo(() => {
    const weeks: { label: string; value: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const end = new Date()
      end.setDate(end.getDate() - i * 7)
      const start = new Date(end)
      start.setDate(start.getDate() - 6)
      const startStr = start.toISOString().split('T')[0]
      const endStr = end.toISOString().split('T')[0]
      const weekSessions = sessions.filter(s => s.date >= startStr && s.date <= endStr)
      const maxDist = weekSessions.length > 0 ? Math.max(...weekSessions.map(s => s.distance_km)) : 0
      weeks.push({ label: `S${12 - i}`, value: Math.round(maxDist * 10) / 10 })
    }
    return weeks
  }, [sessions])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '6rem', borderRadius: '1rem' }} />)}
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Period selector */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem' }}>
        {PERIOD_OPTIONS.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)} style={{
            flex: 1, padding: '0.5rem', borderRadius: '0.625rem', fontSize: '0.8125rem', fontWeight: 600,
            border: `1px solid ${period === p.key ? 'var(--accent-green)' : 'var(--border)'}`,
            background: period === p.key ? 'var(--accent-green-glow)' : 'var(--bg-secondary)',
            color: period === p.key ? '#34d399' : 'var(--text-secondary)',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
          }}>{p.label}</button>
        ))}
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { icon: Footprints, label: 'Km total', value: `${totalKm.toFixed(1)}`, color: 'var(--accent-green)', bg: 'var(--accent-green-glow)' },
          { icon: Mountain, label: 'D+ total', value: `${totalElev}m`, color: 'var(--accent-blue)', bg: 'var(--accent-blue-glow)' },
          { icon: Clock, label: 'Temps total', value: formatDuration(totalTime).slice(0, 5), color: 'var(--accent-violet)', bg: 'var(--accent-violet-glow)' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card" style={{ flexDirection: 'column', padding: '0.875rem', gap: '0.5rem' }}>
            <div className="stat-icon" style={{ background: bg, width: '2rem', height: '2rem', borderRadius: '0.5rem' }}>
              <Icon size={14} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Donut: by type */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
          Séances par type
        </div>
        <DonutChart segments={typeGroups} />
      </div>

      {/* Pace chart */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
          Allure — 30 dernières séances
        </div>
        <LineChart data={paceData} color="var(--accent-green)" formatValue={(v) => formatPaceShort(v)} />
      </div>

      {/* BPM chart */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
          BPM moyen — 30 dernières séances
        </div>
        <LineChart data={bpmData} color="#fb7185" unit=" bpm" />
      </div>

      {/* Weekly load histogram */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
          Charge hebdomadaire (12 sem.)
        </div>
        <BarChart data={weeklyLoad} barColor="var(--accent-green)" unit="km" />
      </div>

      {/* Long run progression */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
          Progression longue sortie
        </div>
        <BarChart data={longRunProg} barColor="var(--accent-violet)" unit="km" />
      </div>

      {/* Shoes tracking */}
      {shoes.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
            Suivi chaussures
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {shoes.map(shoe => {
              const pct = Math.min((shoe.total_km / shoe.max_km) * 100, 100)
              const isWorn = shoe.total_km >= shoe.max_km
              return (
                <div key={shoe.id} style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--bg-secondary)', border: isWorn ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      👟 {shoe.name} {shoe.brand && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>· {shoe.brand}</span>}
                    </span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: isWorn ? '#f87171' : '#34d399' }}>
                      {Math.round(shoe.total_km)} / {shoe.max_km} km
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className={`progress-fill ${pct >= 100 ? '' : ''}`} style={{
                      width: `${pct}%`,
                      background: isWorn ? 'linear-gradient(90deg, #f87171, #ef4444)' : undefined,
                      boxShadow: isWorn ? '0 0 8px rgba(239,68,68,0.4)' : undefined,
                    }} />
                  </div>
                  {isWorn && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', fontSize: '0.75rem', color: '#f87171' }}>
                      <AlertTriangle size={12} /> Il est temps de changer de paire !
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
