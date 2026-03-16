export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell, Waves, TrendingUp, PlusCircle, Flame, ChevronRight, Clock } from 'lucide-react'
import { calculateStreak, detectMuscles, getCurrentWeekBounds, getLastWeekBounds, toDateStr } from '@/lib/dashboardUtils'
import ActivityHeatmap from '@/components/ActivityHeatmap'
import WeekGoalBar from '@/components/WeekGoalBar'
import InactivityBanner from '@/components/InactivityBanner'
import ReprendreButton from '@/components/ReprendreButton'

interface ExerciseRow { id: string; name: string }
interface WorkoutRow { id: string; name: string; date: string; duration_minutes: number | null; exercises: ExerciseRow[] }
interface SwimRow { id: string; style: string; date: string }

function Evo({ curr, prev, unit = '' }: { curr: number; prev: number; unit?: string }) {
  if (prev === 0 && curr === 0) return <span className="evo-flat">—</span>
  if (curr > prev) return <span className="evo-up">↑ +{curr - prev}{unit}</span>
  if (curr < prev) return <span className="evo-down">↓ {curr - prev}{unit}</span>
  return <span className="evo-flat">→ stable</span>
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Profile
  const { data: rawProfile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
  const profile = rawProfile as { username: string | null } | null

  // Last 30 days: all workouts + swim sessions for heatmap & streak
  const thirtyAgo = new Date(); thirtyAgo.setDate(thirtyAgo.getDate() - 30)
  const thirtyAgoStr = toDateStr(thirtyAgo)

  const [
    { data: rawAllWorkouts },
    { data: rawAllSwims },
    { count: totalWorkouts },
    { count: totalSwims },
  ] = await Promise.all([
    supabase.from('workouts').select('id, name, date, duration_minutes, exercises(id, name)')
      .eq('user_id', user.id).gte('date', thirtyAgoStr).order('date', { ascending: false }),
    supabase.from('swim_sessions').select('id, style, date')
      .eq('user_id', user.id).gte('date', thirtyAgoStr).order('date', { ascending: false }),
    supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('swim_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const recentWorkouts = ((rawAllWorkouts ?? []) as WorkoutRow[])
  const recentSwims = ((rawAllSwims ?? []) as SwimRow[])

  // All active dates for heatmap (workouts + swims)
  const allActiveDates = [
    ...recentWorkouts.map(w => w.date),
    ...recentSwims.map(s => s.date),
  ]

  // Streak
  const streak = calculateStreak(allActiveDates)

  // Days since last session for inactivity banner
  const lastSessionDate = allActiveDates.length > 0
    ? allActiveDates.slice().sort().reverse()[0]
    : null
  const daysSinceLast = lastSessionDate
    ? Math.floor((Date.now() - new Date(lastSessionDate).getTime()) / 86400000)
    : 999

  // Weekly stats
  const { start: wStart, end: wEnd } = getCurrentWeekBounds()
  const { start: lwStart, end: lwEnd } = getLastWeekBounds()

  const thisWeekWorkouts = recentWorkouts.filter(w => w.date >= toDateStr(wStart) && w.date <= toDateStr(wEnd))
  const lastWeekWorkouts = recentWorkouts.filter(w => w.date >= toDateStr(lwStart) && w.date <= toDateStr(lwEnd))
  const thisWeekSwims = recentSwims.filter(s => s.date >= toDateStr(wStart) && s.date <= toDateStr(wEnd))
  const lastWeekSwims = recentSwims.filter(s => s.date >= toDateStr(lwStart) && s.date <= toDateStr(lwEnd))

  const thisWeekTotal = thisWeekWorkouts.length + thisWeekSwims.length
  const lastWeekTotal = lastWeekWorkouts.length + lastWeekSwims.length

  const thisWeekDuration = thisWeekWorkouts.reduce((a, w) => a + (w.duration_minutes ?? 0), 0)
  const lastWeekDuration = lastWeekWorkouts.reduce((a, w) => a + (w.duration_minutes ?? 0), 0)

  // Last 5 sessions (mix muscu + swim), sorted by date
  const last5Workouts: ({ type: 'muscu' } & WorkoutRow)[] = recentWorkouts.slice(0, 5).map(w => ({ type: 'muscu', ...w }))

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
          {streak > 0 && (
            <div className="streak-badge">
              🔥 {streak}j
            </div>
          )}
        </div>
      </div>

      {/* Inactivity banner (client) */}
      <InactivityBanner daysSinceLastSession={daysSinceLast} />

      {/* Weekly goal bar (client, localStorage) */}
      <WeekGoalBar currentCount={thisWeekTotal} />

      {/* Weekly summary */}
      <div className="card" style={{ marginBottom: '1.25rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
          Semaine en cours
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
          {[
            {
              label: 'Séances', curr: thisWeekTotal, prev: lastWeekTotal,
              icon: <TrendingUp size={14} />, color: 'var(--accent-blue)',
            },
            {
              label: 'Muscu', curr: thisWeekWorkouts.length, prev: lastWeekWorkouts.length,
              icon: <Dumbbell size={14} />, color: 'var(--accent-blue)',
            },
            {
              label: 'Durée (min)', curr: thisWeekDuration, prev: lastWeekDuration,
              icon: <Clock size={14} />, color: 'var(--accent-violet)',
            },
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { icon: Dumbbell, label: 'Muscu total', value: totalWorkouts ?? 0, color: 'var(--accent-blue)', bg: 'var(--accent-blue-glow)' },
          { icon: Waves, label: 'Natation total', value: totalSwims ?? 0, color: 'var(--accent-teal)', bg: 'var(--accent-teal-glow)' },
          { icon: TrendingUp, label: 'Total séances', value: (totalWorkouts ?? 0) + (totalSwims ?? 0), color: 'var(--accent-violet)', bg: 'var(--accent-violet-glow)' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card" style={{ flexDirection: 'column', padding: '0.875rem', gap: '0.5rem' }}>
            <div className="stat-icon" style={{ background: bg, width: '2rem', height: '2rem', borderRadius: '0.5rem' }}>
              <Icon size={14} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity heatmap */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
          Activité — 30 derniers jours
        </div>
        <ActivityHeatmap activeDates={allActiveDates} />
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link href="/musculation/new" className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.08))', border: '1px solid rgba(59,130,246,0.3)' }}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PlusCircle size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Nouvelle séance</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Musculation</div>
          </div>
        </Link>
        <Link href="/natation" className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(59,130,246,0.08))', border: '1px solid rgba(20,184,166,0.3)' }}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Waves size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Générer séance</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Natation</div>
          </div>
        </Link>
      </div>

      {/* Recent workouts */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Dernières séances</h2>
          <Link href="/musculation" style={{ fontSize: '0.8125rem', color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>Voir tout →</Link>
        </div>

        {last5Workouts.length === 0 ? (
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
            {last5Workouts.map((w, index) => {
              const exoList = Array.isArray(w.exercises) ? w.exercises : []
              const muscles = detectMuscles(exoList.map(e => e.name))
              return (
                <div key={w.id} className="card" style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <Link href={`/musculation/${w.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'var(--accent-blue-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Dumbbell size={16} color="var(--accent-blue)" />
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
                      {index === 0 && <ReprendreButton workoutId={w.id} workoutName={w.name} />}
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
