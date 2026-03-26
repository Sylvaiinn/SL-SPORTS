'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Dumbbell, Waves, Footprints, Clock, Weight, ChevronRight } from 'lucide-react'
import { formatPace, formatDuration } from '@/lib/runUtils'

interface WorkoutRow { id: string; name: string; date: string; duration_minutes: number | null; volume_total_kg: number | null }
interface SwimRow { id: string; style: string; distance_m: number; date: string }
interface RunRow { id: string; distance_km: number; duration_seconds: number; type: string; date: string }

type SportTab = 'muscu' | 'run' | 'swim'

function dateLabel(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })
}

export default function ProfileSessions({ userId }: { userId: string }) {
  const supabase = createClient()
  const [tab, setTab] = useState<SportTab>('muscu')
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([])
  const [swims, setSwims] = useState<SwimRow[]>([])
  const [runs, setRuns] = useState<RunRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: w }, { data: s }, { data: r }] = await Promise.all([
        supabase.from('workouts').select('id, name, date, duration_minutes, volume_total_kg').eq('user_id', userId).order('date', { ascending: false }).limit(50),
        supabase.from('swim_sessions').select('id, style, distance_m, date').eq('user_id', userId).order('date', { ascending: false }).limit(50),
        supabase.from('run_sessions').select('id, distance_km, duration_seconds, type, date').eq('user_id', userId).order('date', { ascending: false }).limit(50),
      ])
      setWorkouts((w ?? []) as WorkoutRow[])
      setSwims((s ?? []) as SwimRow[])
      setRuns((r ?? []) as RunRow[])
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const tabs: { id: SportTab; label: string; icon: React.ReactNode; count: number; color: string; activeColor: string }[] = [
    { id: 'muscu', label: 'Muscu', icon: <Dumbbell size={14} />, count: workouts.length, color: 'var(--accent-violet)', activeColor: 'var(--accent-violet)' },
    { id: 'run', label: 'Course', icon: <Footprints size={14} />, count: runs.length, color: 'var(--accent-green)', activeColor: 'var(--accent-green)' },
    { id: 'swim', label: 'Natation', icon: <Waves size={14} />, count: swims.length, color: 'var(--accent-blue)', activeColor: 'var(--accent-blue)' },
  ]

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h2 className="section-title" style={{ marginBottom: '0.875rem' }}>Mes séances</h2>

      {/* Tab bar */}
      <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '0.875rem', padding: '0.25rem', marginBottom: '1rem', border: '1px solid var(--border)', gap: '0.25rem' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '0.5rem 0.25rem', borderRadius: '0.625rem', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8125rem',
              fontWeight: tab === t.id ? 700 : 500,
              background: tab === t.id ? t.activeColor : 'transparent',
              color: tab === t.id ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
              transition: 'all 0.2s',
            }}
          >
            {t.icon} {t.label}
            {t.count > 0 && (
              <span style={{
                fontSize: '0.65rem', fontWeight: 700,
                background: tab === t.id ? 'rgba(255,255,255,0.25)' : 'var(--bg-card)',
                color: tab === t.id ? 'white' : 'var(--text-muted)',
                borderRadius: '0.75rem', padding: '0.1rem 0.35rem', minWidth: '1.2rem', textAlign: 'center',
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '3.5rem', borderRadius: '0.75rem' }} />)}
        </div>
      ) : (
        <>
          {/* Muscu */}
          {tab === 'muscu' && (
            workouts.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <Dumbbell size={32} />
                <p>Aucune séance de musculation</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {workouts.map(w => (
                  <Link key={w.id} href={`/musculation/${w.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: '0.75rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'var(--accent-violet-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Dumbbell size={13} color="var(--accent-violet)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dateLabel(w.date)}</span>
                          {w.duration_minutes && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                              <Clock size={10} /> {w.duration_minutes}min
                            </span>
                          )}
                          {w.volume_total_kg && w.volume_total_kg > 0 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-violet)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                              <Weight size={10} /> {Math.round(w.volume_total_kg)}kg
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={14} color="var(--text-muted)" />
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}

          {/* Course */}
          {tab === 'run' && (
            runs.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <Footprints size={32} />
                <p>Aucune séance de course</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {runs.map(r => {
                  const avgPace = r.distance_km > 0 ? Math.round(r.duration_seconds / r.distance_km) : 0
                  return (
                    <div key={r.id} className="card" style={{ padding: '0.75rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'var(--accent-green-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Footprints size={13} color="var(--accent-green)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--accent-green)' }}>{r.distance_km.toFixed(2)} km</span>
                          <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{r.type}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dateLabel(r.date)}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDuration(r.duration_seconds)}</span>
                          {avgPace > 0 && <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>{formatPace(avgPace)}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {/* Natation */}
          {tab === 'swim' && (
            swims.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <Waves size={32} />
                <p>Aucune séance de natation</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {swims.map(s => (
                  <div key={s.id} className="card" style={{ padding: '0.75rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'var(--accent-blue-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Waves size={13} color="var(--accent-blue)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--accent-blue)' }}>{s.distance_m} m</span>
                        <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{s.style}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dateLabel(s.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}
