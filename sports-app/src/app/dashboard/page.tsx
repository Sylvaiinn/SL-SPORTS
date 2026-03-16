export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell, Waves, TrendingUp, Calendar, PlusCircle, ChevronRight } from 'lucide-react'

interface WorkoutRow { id: string; name: string; date: string; exercises: { id: string; name: string }[] }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile
  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()
  const profile = rawProfile as { username: string | null } | null

  // Stats
  const { count: totalWorkouts } = await supabase
    .from('workouts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: rawWorkouts } = await supabase
    .from('workouts')
    .select('id, name, date, exercises(id, name)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(5)
  const recentWorkouts = (rawWorkouts ?? []) as WorkoutRow[]

  const { count: totalSwims } = await supabase
    .from('swim_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const displayName = profile?.username ?? user.email?.split('@')[0] ?? 'Athlète'
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{greeting} 👋</p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{displayName}</h1>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ flexDirection: 'column', padding: '1rem', gap: '0.5rem' }}>
          <div className="stat-icon" style={{ background: 'var(--accent-blue-glow)', width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem' }}>
            <Dumbbell size={16} color="var(--accent-blue)" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalWorkouts ?? 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Séances muscu</div>
          </div>
        </div>
        <div className="stat-card" style={{ flexDirection: 'column', padding: '1rem', gap: '0.5rem' }}>
          <div className="stat-icon" style={{ background: 'var(--accent-teal-glow)', width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem' }}>
            <Waves size={16} color="var(--accent-teal)" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalSwims ?? 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Séances natation</div>
          </div>
        </div>
        <div className="stat-card" style={{ flexDirection: 'column', padding: '1rem', gap: '0.5rem' }}>
          <div className="stat-icon" style={{ background: 'var(--accent-violet-glow)', width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem' }}>
            <TrendingUp size={16} color="var(--accent-violet)" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{(totalWorkouts ?? 0) + (totalSwims ?? 0)}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total séances</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
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

        {recentWorkouts.length === 0 ? (
          <div className="empty-state">
            <Calendar size={40} />
            <h3>Aucune séance enregistrée</h3>
            <p style={{ fontSize: '0.875rem' }}>Commencez par créer votre première séance de musculation</p>
            <Link href="/musculation/new" className="btn btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex' }}>
              <PlusCircle size={16} /> Première séance
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {recentWorkouts.map((w) => {
              const exoList = Array.isArray(w.exercises) ? w.exercises : []
              return (
                <Link key={w.id} href={`/musculation/${w.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'var(--accent-blue-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Dumbbell size={16} color="var(--accent-blue)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{w.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                          {new Date(w.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          {exoList.length > 0 && ` · ${exoList.length} exo${exoList.length > 1 ? 's' : ''}`}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={18} color="var(--text-muted)" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
