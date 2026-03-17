'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPace } from '@/lib/runUtils'
import { RECORD_DISTANCES } from '@/lib/constants'
import { Trophy, Calendar, Cloud } from 'lucide-react'

interface RecordRow {
  id: string
  distance_label: string
  distance_km: number
  best_pace_sec: number
  date: string
  conditions: string | null
}

interface SessionMatch {
  id: string
  date: string
  distance_km: number
  duration_seconds: number
}

export default function RunRecords() {
  const supabase = createClient()
  const [records, setRecords] = useState<RecordRow[]>([])
  const [sessions, setSessions] = useState<SessionMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedLabel, setExpandedLabel] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: r }, { data: s }] = await Promise.all([
        supabase.from('run_records').select('*').order('distance_km', { ascending: true }),
        supabase.from('run_sessions').select('id, date, distance_km, duration_seconds').order('date', { ascending: false }),
      ])
      setRecords((r ?? []) as RecordRow[])
      setSessions((s ?? []) as SessionMatch[])
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: '5rem', borderRadius: '1rem' }} />)}
      </div>
    )
  }

  function getAttemptsForDistance(distKm: number) {
    const tolerance = distKm * 0.05
    return sessions.filter(s => s.distance_km >= distKm - tolerance)
      .map(s => ({
        ...s,
        pace: s.distance_km > 0 ? Math.round(s.duration_seconds / s.distance_km) : 0,
      }))
      .sort((a, b) => a.pace - b.pace)
      .slice(0, 10)
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {RECORD_DISTANCES.map(rd => {
          const record = records.find(r => r.distance_label === rd.label)
          const isExpanded = expandedLabel === rd.label
          const attempts = isExpanded ? getAttemptsForDistance(rd.km) : []

          return (
            <div key={rd.label} className="card" style={{ cursor: 'pointer' }} onClick={() => setExpandedLabel(isExpanded ? null : rd.label)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{
                  width: '3rem', height: '3rem', borderRadius: '0.875rem',
                  background: record ? 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(16,185,129,0.1))' : 'var(--bg-secondary)',
                  border: record ? '1px solid rgba(245,158,11,0.3)' : '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {record ? <Trophy size={18} color="#fbbf24" /> : <Trophy size={18} color="var(--text-muted)" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{rd.label}</span>
                    {record && <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>🏆 Record</span>}
                  </div>
                  {record ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#34d399' }}>{formatPace(record.best_pace_sec)}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Calendar size={11} /> {new Date(record.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {record.conditions && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Cloud size={11} /> {record.conditions}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Pas encore de record — courez au moins {rd.km}km !
                    </div>
                  )}
                </div>
              </div>

              {/* Attempts history */}
              {isExpanded && attempts.length > 0 && (
                <div style={{ marginTop: '0.875rem', borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }} onClick={e => e.stopPropagation()}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Meilleures tentatives
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {attempts.map((a, i) => (
                      <div key={a.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.375rem 0.625rem', borderRadius: '0.5rem',
                        background: i === 0 ? 'rgba(245,158,11,0.08)' : 'var(--bg-secondary)',
                        border: i === 0 ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: i === 0 ? '#fbbf24' : 'var(--text-muted)', width: '1.25rem' }}>#{i + 1}</span>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            {new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{a.distance_km.toFixed(2)}km</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: i === 0 ? '#34d399' : 'var(--text-primary)' }}>
                            {formatPace(a.pace)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
