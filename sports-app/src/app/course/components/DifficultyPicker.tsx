'use client'

import { DIFFICULTY_LABELS } from '@/lib/constants'

interface DifficultyPickerProps {
  value: number | null
  onChange: (v: number) => void
}

export default function DifficultyPicker({ value, onChange }: DifficultyPickerProps) {
  return (
    <div>
      <div className="difficulty-dots">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            className={`difficulty-dot ${value === n ? 'active' : ''}`}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
      {value && (
        <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600, marginTop: '0.375rem' }}>
          {DIFFICULTY_LABELS[value]}
        </div>
      )}
    </div>
  )
}
