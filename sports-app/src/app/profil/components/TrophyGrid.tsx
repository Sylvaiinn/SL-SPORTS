'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TROPHY_DEFINITIONS, checkTrophies, calculateLevel, nextLevelProgress, type TrophyStats } from '@/lib/trophyEngine'

interface TrophyGridProps {
  stats: TrophyStats
  initialUnlocked: string[]
}

export default function TrophyGrid({ stats, initialUnlocked }: TrophyGridProps) {
  const supabase = createClient()
  const [unlockedKeys, setUnlockedKeys] = useState<string[]>(initialUnlocked)
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([])

  const level = calculateLevel(stats.totalSessions)
  const nextLevel = nextLevelProgress(stats.totalSessions)

  useEffect(() => {
    async function unlock() {
      const newTrophies = checkTrophies(stats, unlockedKeys)
      if (newTrophies.length === 0) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      for (const key of newTrophies) {
        await supabase.from('trophies').insert({ user_id: user.id, trophy_key: key } as never)
      }
      setUnlockedKeys(prev => [...prev, ...newTrophies])
      setNewlyUnlocked(newTrophies)
    }
    unlock()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      {/* Level badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Trophées & Niveau
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem' }}>
            <span style={{
              padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.875rem',
              background: `${level.color}20`, color: level.color, border: `1px solid ${level.color}50`,
            }}>
              {level.label}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {unlockedKeys.length}/{TROPHY_DEFINITIONS.length} trophées
            </span>
          </div>
        </div>
      </div>

      {/* Next level progress */}
      {nextLevel && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
            <span>Prochain : {nextLevel.label}</span>
            <span>{nextLevel.current}/{nextLevel.target}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(nextLevel.current / nextLevel.target) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Trophy grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
        {TROPHY_DEFINITIONS.map(trophy => {
          const isUnlocked = unlockedKeys.includes(trophy.key)
          const isNew = newlyUnlocked.includes(trophy.key)
          const progress = trophy.progress(stats)

          return (
            <div key={trophy.key} className={`trophy-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              style={isNew ? { animation: 'trophyGlow 0.5s ease' } : {}}>
              <span className="trophy-icon">{trophy.icon}</span>
              <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {trophy.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {trophy.description}
              </div>
              {!isUnlocked && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div className="progress-track" style={{ height: 4 }}>
                    <div className="progress-fill" style={{ width: `${(progress.current / progress.target) * 100}%` }} />
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {progress.current}/{progress.target}
                  </div>
                </div>
              )}
              {isNew && (
                <div style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 700, marginTop: '0.25rem' }}>
                  ✨ Débloqué !
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
