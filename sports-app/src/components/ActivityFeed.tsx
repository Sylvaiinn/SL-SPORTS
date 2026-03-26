import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Dumbbell, Waves, Footprints, Clock } from 'lucide-react'
import { formatPace } from '@/lib/runUtils'

interface ProfileInfo {
  id: string
  username: string | null
  avatar_url: string | null
}

type FeedItem =
  | { kind: 'muscu'; id: string; date: string; name: string; duration_minutes: number | null; profile: ProfileInfo }
  | { kind: 'swim'; id: string; date: string; style: string; distance_m: number; profile: ProfileInfo }
  | { kind: 'run'; id: string; date: string; distance_km: number; duration_seconds: number; runType: string; profile: ProfileInfo }

function Avatar({ profile }: { profile: ProfileInfo }) {
  return (
    <div style={{
      width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
      background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {profile.avatar_url ? (
        <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'white' }}>
          {profile.username?.[0]?.toUpperCase() ?? '?'}
        </span>
      )}
    </div>
  )
}

export default async function ActivityFeed({ currentUserId }: { currentUserId: string }) {
  const supabase = await createClient()

  // Fetch other public profiles + own profile separately
  const [{ data: otherProfiles }, { data: ownProfileData }] = await Promise.all([
    supabase.from('profiles').select('id, username, avatar_url').eq('is_public', true).neq('id', currentUserId).limit(50),
    supabase.from('profiles').select('id, username, avatar_url').eq('id', currentUserId).single(),
  ])

  const ownProfile = ownProfileData as ProfileInfo | null
  const allProfiles = [...(otherProfiles ?? []), ...(ownProfile ? [ownProfile] : [])]

  if (allProfiles.length === 0) return null

  const otherIds = (otherProfiles ?? []).map((p: ProfileInfo) => p.id)
  const allIds = allProfiles.map((p: ProfileInfo) => p.id)
  const profileMap = Object.fromEntries(allProfiles.map((p: ProfileInfo) => [p.id, p])) as Record<string, ProfileInfo>

  // Fetch sessions: public workouts from others + own workouts (all) + swim/run from all
  const [
    { data: rawOtherWorkouts },
    { data: rawOwnWorkouts },
    { data: rawSwims },
    { data: rawRuns },
  ] = await Promise.all([
    otherIds.length > 0
      ? supabase.from('workouts').select('id, name, date, duration_minutes, user_id').eq('is_public', true).in('user_id', otherIds).order('date', { ascending: false }).limit(10)
      : { data: [] as { id: string; name: string; date: string; duration_minutes: number | null; user_id: string }[] },
    supabase.from('workouts').select('id, name, date, duration_minutes, user_id').eq('user_id', currentUserId).order('date', { ascending: false }).limit(10),
    supabase.from('swim_sessions').select('id, style, distance_m, date, user_id').in('user_id', allIds).order('date', { ascending: false }).limit(15),
    supabase.from('run_sessions').select('id, distance_km, duration_seconds, type, date, user_id').in('user_id', allIds).order('date', { ascending: false }).limit(15),
  ])

  // Merge workouts, deduplicate
  const workoutMap = new Map<string, { id: string; name: string; date: string; duration_minutes: number | null; user_id: string }>()
  for (const w of [...(rawOtherWorkouts ?? []), ...(rawOwnWorkouts ?? [])]) {
    if (w) workoutMap.set(w.id, w)
  }

  const items: FeedItem[] = [
    ...Array.from(workoutMap.values()).map(w => ({
      kind: 'muscu' as const,
      id: w.id, date: w.date, name: w.name,
      duration_minutes: w.duration_minutes,
      profile: profileMap[w.user_id],
    })),
    ...(rawSwims ?? []).map((s: { id: string; style: string; distance_m: number; date: string; user_id: string }) => ({
      kind: 'swim' as const,
      id: s.id, date: s.date, style: s.style, distance_m: s.distance_m,
      profile: profileMap[s.user_id],
    })),
    ...(rawRuns ?? []).map((r: { id: string; distance_km: number; duration_seconds: number; type: string; date: string; user_id: string }) => ({
      kind: 'run' as const,
      id: r.id, date: r.date, distance_km: r.distance_km,
      duration_seconds: r.duration_seconds, runType: r.type,
      profile: profileMap[r.user_id],
    })),
  ]
    .filter(item => item.profile != null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)

  if (items.length === 0) return null

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>Fil d&apos;actualité</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map(item => {
          const isSelf = item.profile.id === currentUserId
          const dateLabel = new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

          const actorEl = isSelf ? (
            <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--accent-blue)' }}>Vous</span>
          ) : (
            <Link href={`/profil/${item.profile.username}`} style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
              {item.profile.username}
            </Link>
          )

          if (item.kind === 'muscu') {
            return (
              <div key={`muscu-${item.id}`} className="card" style={{ padding: '0.75rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Avatar profile={item.profile} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {actorEl}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isSelf ? 'avez fait' : 'a fait'}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#c4b5fd' }}>{item.name}</span>
                    <span className="session-badge-muscu">Muscu</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dateLabel}</span>
                    {item.duration_minutes && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Clock size={10} /> {item.duration_minutes}min
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'var(--accent-violet-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Dumbbell size={13} color="var(--accent-violet)" />
                </div>
              </div>
            )
          }

          if (item.kind === 'swim') {
            return (
              <div key={`swim-${item.id}`} className="card" style={{ padding: '0.75rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Avatar profile={item.profile} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {actorEl}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isSelf ? 'avez nagé' : 'a nagé'}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--accent-blue)' }}>{item.distance_m}m</span>
                    <span className="session-badge-swim">Natation</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {dateLabel} · {item.style}
                  </div>
                </div>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'var(--accent-blue-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Waves size={13} color="var(--accent-blue)" />
                </div>
              </div>
            )
          }

          if (item.kind === 'run') {
            const avgPace = item.distance_km > 0 ? Math.round(item.duration_seconds / item.distance_km) : 0
            return (
              <div key={`run-${item.id}`} className="card" style={{ padding: '0.75rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Avatar profile={item.profile} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {actorEl}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isSelf ? 'avez couru' : 'a couru'}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--accent-green)' }}>{item.distance_km.toFixed(1)} km</span>
                    <span className="session-badge-run">Course</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dateLabel}</span>
                    {avgPace > 0 && <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>{formatPace(avgPace)}</span>}
                  </div>
                </div>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'var(--accent-green-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Footprints size={13} color="var(--accent-green)" />
                </div>
              </div>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}
