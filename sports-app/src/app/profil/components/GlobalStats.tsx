'use client'

import DonutChart from '@/components/DonutChart'
import { Dumbbell, Waves, Footprints, Clock, Flame, Trophy, TrendingUp } from 'lucide-react'

interface GlobalStatsProps {
  totalWorkouts: number
  totalSwims: number
  totalRuns: number
  totalRunKm: number
  totalSwimM: number
  totalWeightKg: number
  totalDuration: number
  currentStreak: number
  bestStreak: number
}

export default function GlobalStats({
  totalWorkouts, totalSwims, totalRuns,
  totalRunKm, totalSwimM, totalWeightKg,
  totalDuration, currentStreak, bestStreak,
}: GlobalStatsProps) {
  const totalSessions = totalWorkouts + totalSwims + totalRuns
  const totalSwimKm = totalSwimM / 1000

  return (
    <div>
      {/* Streak */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="stat-card" style={{ flex: 1, padding: '0.875rem', gap: '0.75rem' }}>
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem' }}>
            <Flame size={16} color="#fbbf24" />
          </div>
          <div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800 }}>{currentStreak}j</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Streak actuel</div>
          </div>
        </div>
        <div className="stat-card" style={{ flex: 1, padding: '0.875rem', gap: '0.75rem' }}>
          <div className="stat-icon" style={{ background: 'var(--accent-violet-glow)', width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem' }}>
            <Trophy size={16} color="var(--accent-violet)" />
          </div>
          <div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800 }}>{bestStreak}j</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Meilleur streak</div>
          </div>
        </div>
      </div>

      {/* All-sports donut */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
          Répartition des séances
        </div>
        <DonutChart segments={[
          { label: 'Musculation', value: totalWorkouts, color: 'var(--accent-blue)' },
          { label: 'Natation', value: totalSwims, color: 'var(--accent-teal)' },
          { label: 'Course', value: totalRuns, color: 'var(--accent-green)' },
        ]} />
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { icon: TrendingUp, label: 'Séances totales', value: `${totalSessions}`, color: 'var(--accent-violet)', bg: 'var(--accent-violet-glow)' },
          { icon: Clock, label: 'Temps total', value: `${Math.round(totalDuration / 60)}h`, color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.15)' },
          { icon: Footprints, label: 'Km courus', value: `${totalRunKm.toFixed(1)}`, color: 'var(--accent-green)', bg: 'var(--accent-green-glow)' },
          { icon: Waves, label: 'Km nagés', value: `${totalSwimKm.toFixed(1)}`, color: 'var(--accent-teal)', bg: 'var(--accent-teal-glow)' },
          { icon: Dumbbell, label: 'Poids soulevé', value: totalWeightKg > 1000 ? `${(totalWeightKg / 1000).toFixed(1)}t` : `${Math.round(totalWeightKg)}kg`, color: 'var(--accent-blue)', bg: 'var(--accent-blue-glow)' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card" style={{ flexDirection: 'column', padding: '0.875rem', gap: '0.5rem' }}>
            <div className="stat-icon" style={{ background: bg, width: '2rem', height: '2rem', borderRadius: '0.5rem' }}>
              <Icon size={14} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
