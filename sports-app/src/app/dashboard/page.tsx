export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell, Waves, Footprints, TrendingUp, PlusCircle, Flame, ChevronRight, Clock } from 'lucide-react'
import { calculateStreak, detectMuscles, getCurrentWeekBounds, getLastWeekBounds, toDateStr } from '@/lib/dashboardUtils'
import { formatPace } from '@/lib/runUtils'
import ActivityCalendar from '@/components/ActivityCalendar'
import WeekGoalBar from '@/components/WeekGoalBar'
import InactivityBanner from '@/components/InactivityBanner'
import ReprendreButton from '@/components/ReprendreButton'
import CommunityTrophies from '@/components/CommunityTrophies'
import TutorialButton from '@/components/TutorialButton'
import WebAuthnBanner from '@/components/WebAuthnBanner'

interface ExerciseRow { id: string; name: string }
interface WorkoutRow { id: string; name: string; date: string; duration_minutes: number | null; exercises: ExerciseRow[] }
interface SwimRow { id: string; style: string; date: string }
interface RunRow { id: string; date: string; distance_km: number; duration_seconds: number; type: string }

function Evo({ curr, prev, unit = '' }: { curr: number; prev: number; unit?: string }) {
  if (prev === 0 && curr === 0) return <span className="evo-flat">—</span>
  if (curr > prev) return <span className="evo-up">↑ +{curr - prev}{unit}</span>
  if (curr < prev) return <span className="evo-down">↓ {curr - prev}{unit}</span>
  return <span className="evo-flat">→ stable</span>
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ tuto?: string }> }) {
  const sp = await searchParams
  const showTutorial = sp.tuto === '1'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Profile
  const { data: rawProfile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
  const profile = rawProfile as { username: string | null } | null

  // Last 30 days
  const thirtyAgo = new Date(); thirtyAgo.setDate(thirtyAgo.getDate() - 30)
  const thirtyAgoStr = toDateStr(thirtyAgo)

  const [
    { data: rawAllWorkouts },
    { data: rawAllSwims },
    { data: rawAllRuns },
    { count: totalWorkouts },
    { count: totalSwims },
    { count: totalRuns },
  ] = await Promise.all([
    supabase.from('workouts').select('id, name, date, duration_minutes, exercises(id, name)')
      .eq('user_id', user.id).gte('date', thirtyAgoStr).order('date', { ascending: false }),
    supabase.from('swim_sessions').select('id, style, date')
      .eq('user_id', user.id).gte('date', thirtyAgoStr).order('date', { ascending: false }),
    supabase.from('run_sessions').select('id, date, distance_km, duration_seconds, type')
      .eq('user_id', user.id).gte('date', thirtyAgoStr).order('date', { ascending: false }),
    supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('swim_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('run_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const recentWorkouts = ((rawAllWorkouts ?? []) as WorkoutRow[])
  const recentSwims = ((rawAllSwims ?? []) as SwimRow[])
  const recentRuns = ((rawAllRuns ?? []) as RunRow[])

  // All active dates for heatmap (workouts + swims + runs)
  const allActiveDates = [
    ...recentWorkouts.map(w => w.date),
    ...recentSwims.map(s => s.date),
    ...recentRuns.map(r => r.date),
  ]

  // Streak
  const streak = calculateStreak(allActiveDates)

  // Days since last session
  const lastSessionDate = allActiveDates.length > 0
    ? allActiveDates.slice().sort().reverse()[0]
    : null
  const now = new Date()
  const daysSinceLast = lastSessionDate
    ? Math.floor((now.getTime() - new Date(lastSessionDate).getTime()) / 86400000)
    : 999

  // Weekly stats
  const { start: wStart, end: wEnd } = getCurrentWeekBounds()
  const { start: lwStart, end: lwEnd } = getLastWeekBounds()

  const thisWeekWorkouts = recentWorkouts.filter(w => w.date >= toDateStr(wStart) && w.date <= toDateStr(wEnd))
  const lastWeekWorkouts = recentWorkouts.filter(w => w.date >= toDateStr(lwStart) && w.date <= toDateStr(lwEnd))
  const thisWeekSwims = recentSwims.filter(s => s.date >= toDateStr(wStart) && s.date <= toDateStr(wEnd))
  const lastWeekSwims = recentSwims.filter(s => s.date >= toDateStr(lwStart) && s.date <= toDateStr(lwEnd))
  const thisWeekRuns = recentRuns.filter(r => r.date >= toDateStr(wStart) && r.date <= toDateStr(wEnd))
  const lastWeekRuns = recentRuns.filter(r => r.date >= toDateStr(lwStart) && r.date <= toDateStr(lwEnd))

  const thisWeekTotal = thisWeekWorkouts.length + thisWeekSwims.length + thisWeekRuns.length
  const lastWeekTotal = lastWeekWorkouts.length + lastWeekSwims.length + lastWeekRuns.length

  const thisWeekDuration = thisWeekWorkouts.reduce((a, w) => a + (w.duration_minutes ?? 0), 0)
  const lastWeekDuration = lastWeekWorkouts.reduce((a, w) => a + (w.duration_minutes ?? 0), 0)

  // Last 5 sessions (all sports merged, sorted by date)
  type RecentSession =
    | { type: 'muscu'; id: string; date: string; name: string; exercises: ExerciseRow[]; duration_minutes: number | null }
    | { type: 'swim'; id: string; date: string; style: string }
    | { type: 'run'; id: string; date: string; distance_km: number; duration_seconds: number; runType: string }

  const allRecent: RecentSession[] = [
    ...recentWorkouts.slice(0, 5).map(w => ({ type: 'muscu' as const, ...w })),
    ...recentSwims.slice(0, 5).map(s => ({ type: 'swim' as const, ...s })),
    ...recentRuns.slice(0, 5).map(r => ({ type: 'run' as const, id: r.id, date: r.date, distance_km: r.distance_km, duration_seconds: r.duration_seconds, runType: r.type })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  const displayName = profile?.username ?? user.email?.split('@')[0] ?? 'Athlète'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{greeting} 👋</p>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{displayName}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {streak > 0 && (
              <div className="streak-badge">
                🔥 {streak}j
              </div>
            )}
            <TutorialButton autoOpen={showTutorial} />
          </div>
        </div>
      </div>

      {/* WebAuthn fingerprint activation banner */}
      <WebAuthnBanner />

      {/* Inactivity banner */}
      <InactivityBanner daysSinceLastSession={daysSinceLast} />

      {/* Weekly goal bar */}
      <WeekGoalBar currentCount={thisWeekTotal} />

      {/* Weekly summary */}
      <div className="card" style={{ marginBottom: '1.25rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
          Semaine en cours
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
          {[
            { label: 'Séances', curr: thisWeekTotal, prev: lastWeekTotal, icon: <TrendingUp size={14} />, color: 'var(--accent-blue)' },
            { label: 'Muscu', curr: thisWeekWorkouts.length, prev: lastWeekWorkouts.length, icon: <Dumbbell size={14} />, color: 'var(--accent-violet)' },
            { label: 'Durée (min)', curr: thisWeekDuration, prev: lastWeekDuration, icon: <Clock size={14} />, color: 'var(--accent-violet)' },
          ].map(({ label, curr, prev, icon, color }) => (
            <div key={label} style={{ background: 'var(--bg-card)', borderRadius: '0.75rem', padding: '0.75rem', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color, marginBottom: '0.3rem', fontSize: '0.7rem' }}>
                {icon} {label}
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{curr}</div>
              <Evo curr={curr} prev={prev} />
            </div>
          ))}
        </div>
      </div>

      {/* Stats global */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { icon: Dumbbell, label: 'Muscu', value: totalWorkouts ?? 0, color: 'var(--accent-violet)', bg: 'var(--accent-violet-glow)', border: 'rgba(124,58,237,0.25)' },
          { icon: Waves, label: 'Nata', value: totalSwims ?? 0, color: 'var(--accent-blue)', bg: 'var(--accent-blue-glow)', border: 'rgba(59,130,246,0.25)' },
          { icon: Footprints, label: 'Course', value: totalRuns ?? 0, color: 'var(--accent-green)', bg: 'var(--accent-green-glow)', border: 'rgba(16,185,129,0.25)' },
          { icon: TrendingUp, label: 'Total', value: (totalWorkouts ?? 0) + (totalSwims ?? 0) + (totalRuns ?? 0), color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
        ].map(({ icon: Icon, label, value, color, bg, border }) => (
          <div key={label} style={{
            background: bg, border: `1px solid ${border}`,
            borderRadius: '0.875rem', padding: '0.625rem 0.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
          }}>
            <Icon size={14} color={color} />
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.6rem', color, fontWeight: 600, letterSpacing: '0.02em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Activity calendar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <ActivityCalendar />
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.625rem', marginBottom: '1.5rem' }}>
        <Link href="/musculation" className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(124,58,237,0.08))', border: '1px solid rgba(124,58,237,0.3)', padding: '1rem 0.5rem' }}>
          <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: 'var(--accent-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Dumbbell size={16} color="white" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Muscu</div>
          </div>
        </Link>
        <Link href="/natation" className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.08))', border: '1px solid rgba(59,130,246,0.3)', padding: '1rem 0.5rem' }}>
          <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Waves size={16} color="white" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Natation</div>
          </div>
        </Link>
        <Link href="/course" className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.08))', border: '1px solid rgba(16,185,129,0.3)', padding: '1rem 0.5rem' }}>
          <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Footprints size={16} color="white" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Course</div>
          </div>
        </Link>
      </div>

      {/* Recent sessions (all sports) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Dernières séances</h2>
        </div>

        {allRecent.length === 0 ? (
          <div className="empty-state">
            <Flame size={40} />
            <h3>Aucune séance</h3>
            <p style={{ fontSize: '0.875rem' }}>Commencez par créer votre première séance</p>
            <Link href="/musculation/new" className="btn btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex' }}>
              <PlusCircle size={16} /> Première séance
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {allRecent.map((session, index) => {
              if (session.type === 'muscu') {
                const w = session
                const exoList = Array.isArray(w.exercises) ? w.exercises : []
                const muscles = detectMuscles(exoList.map(e => e.name))
                return (
                  <div key={w.id} className="card" style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <Link href={`/musculation/${w.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'var(--accent-violet-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Dumbbell size={16} color="var(--accent-violet)" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '10rem' }}>{w.name}</span>
                            <span className="session-badge-muscu">Muscu</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {new Date(w.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>
                            {w.duration_minutes && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <Clock size={11} /> {w.duration_minutes}min
                              </span>
                            )}
                            {muscles && <span style={{ fontSize: '0.7rem', color: 'var(--accent-violet)', fontWeight: 500 }}>{muscles}</span>}
                          </div>
                        </div>
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                        {index === 0 && session.type === 'muscu' && <ReprendreButton workoutId={w.id} workoutName={w.name} />}
                        <ChevronRight size={16} color="var(--text-muted)" />
                      </div>
                    </div>
                  </div>
                )
              }

              if (session.type === 'swim') {
                return (
                  <Link key={session.id} href="/natation/historique" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'var(--accent-blue-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Waves size={16} color="var(--accent-blue)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Séance {session.style}</span>
                          <span className="session-badge-swim">Natation</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  </Link>
                )
              }

              if (session.type === 'run') {
                const avgPace = session.distance_km > 0 ? Math.round(session.duration_seconds / session.distance_km) : 0
                return (
                  <Link key={session.id} href="/course" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'var(--accent-green-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Footprints size={16} color="var(--accent-green)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{session.distance_km.toFixed(1)} km</span>
                          <span className="session-badge-run">Course</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                          {avgPace > 0 && (
                            <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>{formatPace(avgPace)}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  </Link>
                )
              }

              return null
            })}
          </div>
        )}
      </div>

      {/* Community trophies */}
      <div style={{ marginTop: '1.5rem' }}>
        <CommunityTrophies currentUserId={user.id} />
      </div>

    </div>
  )
}
