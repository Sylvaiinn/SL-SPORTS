'use client'

import { useState, useEffect, startTransition } from 'react'
import { Settings } from 'lucide-react'

interface WeekGoalBarProps {
  currentCount: number
}

export default function WeekGoalBar({ currentCount }: WeekGoalBarProps) {
  const [goal, setGoal] = useState(4)
  const [editing, setEditing] = useState(false)
  const [tempGoal, setTempGoal] = useState(4)

  useEffect(() => {
    const stored = localStorage.getItem('weeklyGoal')
    if (stored) {
      const n = parseInt(stored)
      startTransition(() => {
        setGoal(n)
        setTempGoal(n)
      })
    }
  }, [])

  function saveGoal() {
    const n = Math.max(1, Math.min(14, tempGoal))
    setGoal(n)
    localStorage.setItem('weeklyGoal', String(n))
    setEditing(false)
  }

  const pct = Math.min(100, Math.round((currentCount / goal) * 100))
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
          {editing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <input
                type="number"
                min={1} max={14}
                value={tempGoal}
                onChange={e => setTempGoal(parseInt(e.target.value) || 1)}
                className="input"
                style={{ width: '3.5rem', padding: '0.25rem 0.5rem', textAlign: 'center' }}
              />
              <button onClick={saveGoal} className="btn btn-primary btn-sm" style={{ padding: '0.25rem 0.6rem' }}>OK</button>
              <button onClick={() => setEditing(false)} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem 0.6rem' }}>✕</button>
            </div>
          ) : (
            <>
              <span style={{ fontWeight: 800, fontSize: '1.125rem', color: complete ? '#34d399' : 'var(--text-primary)' }}>
                {currentCount}/{goal}
              </span>
              <button onClick={() => setEditing(true)} className="btn-icon" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', width: '1.75rem', height: '1.75rem' }}>
                <Settings size={13} />
              </button>
            </>
          )}
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
