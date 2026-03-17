'use client'

import { formatPace } from '@/lib/runUtils'
import { Timer } from 'lucide-react'

interface PaceDisplayProps {
  paceSeconds: number
  label?: string
}

export default function PaceDisplay({ paceSeconds, label = 'Allure moy.' }: PaceDisplayProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.625rem 0.875rem', borderRadius: '0.75rem',
      background: 'var(--accent-green-glow)', border: '1px solid rgba(16,185,129,0.3)',
    }}>
      <Timer size={16} color="var(--accent-green)" />
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#34d399' }}>{formatPace(paceSeconds)}</div>
      </div>
    </div>
  )
}
