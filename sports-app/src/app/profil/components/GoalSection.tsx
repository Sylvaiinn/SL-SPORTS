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
        {editing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <input type="number" min="1" max="14" value={goal} onChange={e => setGoal(parseInt(e.target.value) || 1)}
              className="input" style={{ width: '3rem', padding: '0.25rem 0.375rem', textAlign: 'center', fontSize: '0.875rem' }} />
            <button onClick={saveGoal} className="btn btn-primary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
              <Check size={14} />
            </button>
          </div>
        ) : (
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
    </div>
  )
}
