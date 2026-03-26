'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'

interface WeekGoalBarProps {
  currentCount: number
  goal: number
}

export default function WeekGoalBar({ currentCount, goal }: WeekGoalBarProps) {
  const pct = Math.min(100, Math.round((currentCount / Math.max(1, goal)) * 100))
  const complete = currentCount >= goal
  const remaining = Math.max(0, goal - currentCount)

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
            🎯 Objectif semaine
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            {complete
              ? <span style={{ color: '#34d399', fontWeight: 700 }}>✓ Objectif atteint cette semaine !</span>
              : <>{remaining} séance{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}</>
            }
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 800, fontSize: '1.125rem', color: complete ? '#34d399' : 'var(--text-primary)' }}>
            {currentCount}/{goal}
          </span>
          <Link
            href="/profil"
            className="btn-icon"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', width: '1.75rem', height: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem', textDecoration: 'none' }}
            title="Modifier l'objectif dans le profil"
          >
            <Pencil size={13} />
          </Link>
        </div>
      </div>

      <div className="progress-track">
        <div
          className={`progress-fill ${complete ? 'complete' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>0</span>
        <span style={{ fontSize: '0.7rem', color: complete ? '#34d399' : 'var(--text-muted)', fontWeight: complete ? 700 : 400 }}>{pct}%</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{goal}</span>
      </div>
    </div>
  )
}
