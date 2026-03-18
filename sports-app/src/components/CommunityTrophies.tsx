'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy } from 'lucide-react'

const TROPHY_MAP: Record<string, { icon: string; name: string }> = {
  first_workout: { icon: '🏋️', name: 'Première séance' },
  streak_7: { icon: '🔥', name: '7 jours de suite' },
  streak_30: { icon: '💎', name: '30 jours de suite' },
  ten_workouts: { icon: '💪', name: '10 séances' },
  fifty_workouts: { icon: '⭐', name: '50 séances' },
  hundred_workouts: { icon: '👑', name: '100 séances' },
  first_swim: { icon: '🏊', name: 'Première nage' },
  first_run: { icon: '🏃', name: 'Première course' },
  all_sports: { icon: '🏅', name: 'Triathlon' },
  early_bird: { icon: '🌅', name: 'Lève-tôt' },
  night_owl: { icon: '🦉', name: 'Oiseau de nuit' },
}

function timeAgo(date: string): string {
  const now = Date.now()
  const d = new Date(date).getTime()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
  return `il y a ${Math.floor(diff / 86400)}j`
}

interface TrophyRow {
  id: string
  user_id: string
  trophy_key: string
  unlocked_at: string
  profiles: {
    username: string | null
    avatar_url: string | null
    is_public: boolean
  }
}

export default function CommunityTrophies({ currentUserId }: { currentUserId: string }) {
  const [trophies, setTrophies] = useState<TrophyRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase
      .from('trophies')
      .select('id, user_id, trophy_key, unlocked_at, profiles!inner(username, avatar_url, is_public)')
      .eq('profiles.is_public', true)
      .order('unlocked_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setTrophies((data as unknown as TrophyRow[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(245, 158, 11, 0.3); }
          50% { box-shadow: 0 0 16px rgba(245, 158, 11, 0.6); }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Trophy size={16} color="var(--accent-amber)" />
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Trophées récents
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                height: '3.5rem',
                borderRadius: '0.75rem',
                background: 'var(--border)',
                opacity: 0.5,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : trophies.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
          Aucun trophée récent
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {trophies.map(trophy => {
            const def = TROPHY_MAP[trophy.trophy_key] ?? { icon: '🏆', name: trophy.trophy_key }
            const isOwn = trophy.user_id === currentUserId
            const username = trophy.profiles?.username ?? 'Utilisateur'
            const avatarUrl = trophy.profiles?.avatar_url

            return (
              <div
                key={trophy.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  border: isOwn ? '1px solid var(--accent-amber)' : '1px solid var(--border)',
                  background: isOwn ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)',
                  animation: isOwn ? 'glow-pulse 2s ease-in-out infinite' : undefined,
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'var(--accent-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '0.625rem',
                    color: 'white',
                    fontWeight: 700,
                  }}
                >
                  {!avatarUrl && username.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                      {username}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      vient de débloquer
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                    <span style={{ fontSize: '1rem', animation: isOwn ? 'sparkle 1.5s ease-in-out infinite' : undefined }}>
                      {def.icon}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: isOwn ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
                      {def.name}
                    </span>
                    {isOwn && (
                      <span style={{ fontSize: '0.6875rem', color: 'var(--accent-amber)', fontWeight: 600, marginLeft: '0.25rem' }}>
                        Félicitations !
                      </span>
                    )}
                  </div>
                </div>

                {/* Time ago */}
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {timeAgo(trophy.unlocked_at)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
