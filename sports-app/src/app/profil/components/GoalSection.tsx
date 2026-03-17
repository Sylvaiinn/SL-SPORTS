'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Target, Check } from 'lucide-react'

interface GoalSectionProps {
  userId: string
  weeklyGoal: number
  currentWeekSessions: number
}

export default function GoalSection({ userId, weeklyGoal, currentWeekSessions }: GoalSectionProps) {
  const supabase = createClient()
  const [goal, setGoal] = useState(weeklyGoal)
  const [editing, setEditing] = useState(false)

  const pct = Math.min((currentWeekSessions / Math.max(goal, 1)) * 100, 100)
  const remaining = Math.max(goal - currentWeekSessions, 0)
  const achieved = currentWeekSessions >= goal

  async function saveGoal() {
    await supabase.from('profiles').update({ weekly_goal: goal } as never).eq('id', userId)
    setEditing(false)
  }

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Target size={14} color="var(--accent-blue)" /> Objectif hebdomadaire
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-blue)',
          }}>
            {goal} séances/sem. ✏️
          </button>
        )}
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
          <span>{currentWeekSessions} / {goal} cette semaine</span>
          <span>{achieved ? '✅ Objectif atteint !' : `${remaining} restante${remaining > 1 ? 's' : ''}`}</span>
        </div>
        <div className="progress-track">
          <div className={`progress-fill ${achieved ? 'complete' : ''}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      {editing && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={() => setGoal(g => Math.max(1, g - 1))}
              disabled={goal <= 1}
              style={{
                width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                background: goal <= 1 ? 'var(--bg-secondary)' : 'var(--accent-blue)',
                color: goal <= 1 ? 'var(--text-muted)' : 'white',
                border: 'none', fontSize: '1.25rem', fontWeight: 800, cursor: goal <= 1 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              −
            </button>
            <span style={{ fontSize: '2rem', fontWeight: 800, minWidth: '2.5rem', textAlign: 'center' }}>
              {goal}
            </span>
            <button
              onClick={() => setGoal(g => Math.min(14, g + 1))}
              disabled={goal >= 14}
              style={{
                width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                background: goal >= 14 ? 'var(--bg-secondary)' : 'var(--accent-blue)',
                color: goal >= 14 ? 'var(--text-muted)' : 'white',
                border: 'none', fontSize: '1.25rem', fontWeight: 800, cursor: goal >= 14 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              +
            </button>
          </div>
          <button onClick={saveGoal} className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem', padding: '0.625rem' }}>
            <Check size={16} /> Enregistrer
          </button>
        </div>
      )}
    </div>
  )
}
