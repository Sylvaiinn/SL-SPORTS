'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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

const PAGE_SIZE = 10

function timeAgo(date: string): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
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
  profiles: { username: string | null; avatar_url: string | null; is_public: boolean }
}

export default function CommunityTrophies({ currentUserId }: { currentUserId: string }) {
  const [trophies, setTrophies] = useState<TrophyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const fetchPage = useCallback(async (pageIndex: number) => {
    const isFirst = pageIndex === 0
    if (isFirst) setLoading(true)
    else setLoadingMore(true)

    // Step 1 — fetch trophies (no FK to profiles, so no join)
    const { data: rawTrophies } = await supabase
      .from('trophies')
      .select('id, user_id, trophy_key, unlocked_at')
      .order('unlocked_at', { ascending: false })
      .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1)

    if (!rawTrophies || rawTrophies.length === 0) {
      if (isFirst) { setTrophies([]); setLoading(false) }
      else setLoadingMore(false)
      setHasMore(false)
      return
    }

    // Step 2 — fetch profiles for those user_ids, filter is_public
    const userIds = [...new Set(rawTrophies.map((t: { user_id: string }) => t.user_id))]
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, is_public')
      .in('id', userIds)
      .eq('is_public', true)

    const profileMap: Record<string, { username: string | null; avatar_url: string | null; is_public: boolean }> = {}
    for (const p of (profilesData ?? []) as { id: string; username: string | null; avatar_url: string | null; is_public: boolean }[]) {
      profileMap[p.id] = p
    }

    // Keep only trophies from public profiles
    const rows: TrophyRow[] = (rawTrophies as { id: string; user_id: string; trophy_key: string; unlocked_at: string }[])
      .filter(t => profileMap[t.user_id])
      .map(t => ({ ...t, profiles: profileMap[t.user_id] }))

    setTrophies(prev => isFirst ? rows : [...prev, ...rows])
    setHasMore(rawTrophies.length === PAGE_SIZE)
    if (isFirst) setLoading(false)
    else setLoadingMore(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchPage(0) }, [fetchPage])

  // Load more on scroll to bottom
  function handleScroll() {
    const el = scrollRef.current
    if (!el || loadingMore || !hasMore) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      const next = page + 1
      setPage(next)
      fetchPage(next)
    }
  }

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <style>{`
        @keyframes sparkle { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.1)} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 8px rgba(245,158,11,0.3)} 50%{box-shadow:0 0 18px rgba(245,158,11,0.6)} }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Trophy size={16} color="var(--accent-amber)" />
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Trophées récents de la communauté
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '3.5rem', borderRadius: '0.75rem', opacity: 0.4 + i * 0.1 }} />
          ))}
        </div>
      ) : trophies.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
          Aucun trophée récent dans la communauté
        </p>
      ) : (
        /* Scrollable list */
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            maxHeight: '22rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            paddingRight: '0.25rem',
            /* subtle scrollbar */
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border) transparent',
          }}
        >
          {trophies.map(trophy => {
            const def = TROPHY_MAP[trophy.trophy_key] ?? { icon: '🏆', name: trophy.trophy_key }
            const isOwn = trophy.user_id === currentUserId
            const username = trophy.profiles?.username ?? 'Utilisateur'
            const avatarUrl = trophy.profiles?.avatar_url

            return (
              <div
                key={trophy.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.75rem', borderRadius: '0.75rem', flexShrink: 0,
                  border: isOwn ? '1px solid rgba(245,158,11,0.5)' : '1px solid var(--border)',
                  background: isOwn ? 'rgba(245,158,11,0.07)' : 'var(--bg-secondary)',
                  animation: isOwn ? 'glow-pulse 2s ease-in-out infinite' : undefined,
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0,
                  overflow: 'hidden',
                  background: avatarUrl ? undefined : 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', color: 'white', fontWeight: 800,
                }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : username.charAt(0).toUpperCase()
                  }
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{username}</span>
                    {' '}a débloqué{' '}
                    <span style={{ fontSize: '1rem', animation: isOwn ? 'sparkle 1.5s ease-in-out infinite' : undefined }}>
                      {def.icon}
                    </span>
                    {' '}
                    <span style={{ fontWeight: 700, color: isOwn ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
                      {def.name}
                    </span>
                    {isOwn && <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}> 🎉 Félicitations !</span>}
                  </div>
                </div>

                {/* Time */}
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {timeAgo(trophy.unlocked_at)}
                </span>
              </div>
            )
          })}

          {/* Load more indicator */}
          {loadingMore && (
            <div style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Chargement…
            </div>
          )}
          {!hasMore && trophies.length > 0 && (
            <div style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              — Fin de la liste —
            </div>
          )}
        </div>
      )}
    </div>
  )
}
