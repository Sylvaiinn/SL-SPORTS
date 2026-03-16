export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import { User, Mail, Calendar, Dumbbell, Waves, TrendingUp, Award } from 'lucide-react'

interface ProfileRow { username: string | null; avatar_url?: string | null; created_at?: string }
interface LastWorkout { date: string }

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = rawProfile as ProfileRow | null

  const { count: totalWorkouts } = await supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  const { count: totalSwims } = await supabase.from('swim_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user.id)

  const { data: rawLastWorkout } = await supabase.from('workouts').select('date').eq('user_id', user.id).order('date', { ascending: false }).limit(1).single()
  const lastWorkout = rawLastWorkout as LastWorkout | null

  const displayName = profile?.username ?? user.email?.split('@')[0] ?? 'Athlète'
  const memberSince = new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Profil</h1>
        <p>Vos informations et statistiques</p>
      </div>

      {/* Avatar + Identity */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.08))' }}>
        <div style={{
          width: '4rem', height: '4rem', borderRadius: '1rem',
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          fontSize: '1.5rem', fontWeight: 800, color: 'white',
          boxShadow: '0 0 30px var(--accent-blue-glow)',
        }}>
          {displayName[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{displayName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            <Mail size={13} /> {user.email}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <Calendar size={13} /> Membre depuis {memberSince}
          </div>
        </div>
      </div>

      {/* Stats */}
      <h2 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Statistiques</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { icon: Dumbbell, label: 'Séances muscu', value: totalWorkouts ?? 0, color: 'var(--accent-blue)', bg: 'var(--accent-blue-glow)' },
          { icon: Waves, label: 'Séances natation', value: totalSwims ?? 0, color: 'var(--accent-teal)', bg: 'var(--accent-teal-glow)' },
          { icon: TrendingUp, label: 'Total séances', value: (totalWorkouts ?? 0) + (totalSwims ?? 0), color: 'var(--accent-violet)', bg: 'var(--accent-violet-glow)' },
          { icon: Award, label: 'Dernière séance', value: lastWorkout ? new Date(lastWorkout.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—', color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.1)' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.625rem' }}>
            <div className="stat-icon" style={{ background: bg, width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem' }}>
              <Icon size={16} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Account info */}
      <h2 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Compte</h2>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.25rem 0' }}>
          <User size={16} color="var(--text-muted)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Identifiant</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{user.id.slice(0, 8)}...</div>
          </div>
        </div>
      </div>

      <LogoutButton />
    </div>
  )
}
