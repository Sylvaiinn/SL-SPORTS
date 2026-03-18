export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { calculateLevel } from '@/lib/trophyEngine'
import { TROPHY_DEFINITIONS } from '@/lib/trophyEngine'
import { MapPin, Lock, Dumbbell, Waves, Footprints, Trophy, Calendar, Eye } from 'lucide-react'

interface ProfileRow {
  id: string; username: string | null; avatar_url: string | null; bio: string | null
  city: string | null; main_goal: string | null; banner_color: string | null
  banner_url: string | null; is_public: boolean; created_at: string
}

interface PublicWorkout {
  id: string; name: string; date: string; duration_minutes: number | null
  exercises: { name: string }[]
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', decodeURIComponent(username))
    .single()

  if (!rawProfile) notFound()
  const profile = rawProfile as ProfileRow

  const level = calculateLevel(0) // Will compute below

  // If private, show minimal info
  if (!profile.is_public) {
    return (
      <div className="page-enter" style={{ textAlign: 'center', paddingTop: '3rem' }}>
        {/* Banner */}
        <div className="profile-banner" style={{
          background: profile.banner_url
            ? `url(${profile.banner_url}) center/cover`
            : `linear-gradient(135deg, ${profile.banner_color || '#3b82f6'}, ${profile.banner_color || '#3b82f6'}88)`,
          borderRadius: '1rem',
        }} />

        <div style={{ marginTop: '-2rem', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto',
            border: '3px solid var(--bg-primary)', overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>
                {profile.username?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginTop: '0.75rem' }}>{profile.username}</h2>
          <span className="badge" style={{ background: `${level.color}20`, color: level.color, border: `1px solid ${level.color}50`, marginTop: '0.5rem' }}>
            {level.label}
          </span>
        </div>

        <div className="card" style={{ marginTop: '1.5rem', padding: '2rem' }}>
          <Lock size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Profil privé</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Ce profil est privé. Seules les informations de base sont visibles.</p>
        </div>
      </div>
    )
  }

  // Public profile - fetch stats
  const [
    { count: totalWorkouts },
    { count: totalSwims },
    { count: totalRuns },
    { data: rawTrophies },
    { data: rawPublicWorkouts },
  ] = await Promise.all([
    supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('swim_sessions').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('run_sessions').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('trophies').select('trophy_key').eq('user_id', profile.id),
    supabase.from('workouts').select('id, name, date, duration_minutes, exercises(name)')
      .eq('user_id', profile.id).eq('is_public', true).order('date', { ascending: false }).limit(10),
  ])

  const nWorkouts = totalWorkouts ?? 0
  const nSwims = totalSwims ?? 0
  const nRuns = totalRuns ?? 0
  const totalSessions = nWorkouts + nSwims + nRuns
  const userLevel = calculateLevel(totalSessions)
  const unlockedKeys = ((rawTrophies ?? []) as { trophy_key: string }[]).map(t => t.trophy_key)
  const publicWorkouts = (rawPublicWorkouts ?? []) as PublicWorkout[]

  return (
    <div className="page-enter">
      {/* Banner */}
      <div className="profile-banner" style={{
        background: profile.banner_url
          ? `url(${profile.banner_url}) center/cover`
          : `linear-gradient(135deg, ${profile.banner_color || '#3b82f6'}, ${profile.banner_color || '#3b82f6'}88)`,
        borderRadius: '1rem',
      }} />

      {/* Avatar + info */}
      <div className="card" style={{ borderRadius: '0 0 1rem 1rem', borderTop: 'none', position: 'relative', paddingTop: '3rem', marginBottom: '1.25rem' }}>
        <div style={{ position: 'absolute', top: '-2.5rem', left: '1.25rem' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--bg-primary)', overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>
                {profile.username?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem' }}>{profile.username}</h2>
            <span className="badge" style={{ background: `${userLevel.color}20`, color: userLevel.color, border: `1px solid ${userLevel.color}50` }}>
              {userLevel.label}
            </span>
          </div>
          {profile.bio && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>{profile.bio}</p>}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {profile.city && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={12} /> {profile.city}
              </span>
            )}
            {profile.main_goal && <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{profile.main_goal}</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { icon: Dumbbell, label: 'Muscu', value: nWorkouts, color: 'var(--accent-violet)', bg: 'var(--accent-violet-glow)' },
          { icon: Waves, label: 'Natation', value: nSwims, color: 'var(--accent-blue)', bg: 'var(--accent-blue-glow)' },
          { icon: Footprints, label: 'Course', value: nRuns, color: 'var(--accent-green)', bg: 'var(--accent-green-glow)' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card" style={{ flexDirection: 'column', padding: '0.875rem', gap: '0.5rem' }}>
            <div className="stat-icon" style={{ background: bg, width: '2rem', height: '2rem', borderRadius: '0.5rem' }}>
              <Icon size={14} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800 }}>{value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Trophies */}
      {unlockedKeys.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Trophy size={14} color="#fbbf24" /> Trophées
          </div>
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            {TROPHY_DEFINITIONS.filter(t => unlockedKeys.includes(t.key)).map(trophy => (
              <div key={trophy.key} style={{
                padding: '0.5rem 0.75rem', borderRadius: '0.75rem',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                display: 'flex', alignItems: 'center', gap: '0.375rem',
              }}>
                <span style={{ fontSize: '1.25rem' }}>{trophy.icon}</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{trophy.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Public workouts */}
      {publicWorkouts.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Dumbbell size={14} color="var(--accent-blue)" /> Séances publiques
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {publicWorkouts.map(w => {
              const exoNames = Array.isArray(w.exercises) ? w.exercises.map((e: { name: string }) => e.name) : []
              return (
                <div key={w.id} style={{
                  padding: '0.75rem', borderRadius: '0.75rem',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{w.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                      <Eye size={11} /> Public
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={11} />
                      {new Date(w.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {w.duration_minutes && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.duration_minutes} min</span>
                    )}
                  </div>
                  {exoNames.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      {exoNames.slice(0, 4).map((name: string) => (
                        <span key={name} className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '0.125rem 0.4rem' }}>{name}</span>
                      ))}
                      {exoNames.length > 4 && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+{exoNames.length - 4}</span>
                      )}
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
