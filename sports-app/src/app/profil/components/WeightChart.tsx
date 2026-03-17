'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import LineChart from '@/components/LineChart'
import { PlusCircle, Loader2 } from 'lucide-react'

interface WeightEntry {
  id: string
  date: string
  weight_kg: number
}

interface WeightChartProps {
  userId: string
  initialWeight: number | null
}

export default function WeightChart({ userId, initialWeight }: WeightChartProps) {
  const supabase = createClient()
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [newWeight, setNewWeight] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadEntries()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadEntries() {
    const { data } = await supabase
      .from('weight_entries')
      .select('id, date, weight_kg')
      .eq('user_id', userId)
      .order('date', { ascending: true })
    setEntries((data ?? []) as WeightEntry[])
    setLoading(false)
  }

  async function addEntry() {
    const w = parseFloat(newWeight)
    if (!w || w < 20 || w > 300) return
    setSaving(true)
    await supabase.from('weight_entries').insert({
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      weight_kg: w,
    } as never)
    // Also update profile weight
    await supabase.from('profiles').update({ weight_kg: w } as never).eq('id', userId)
    setNewWeight('')
    setSaving(false)
    loadEntries()
  }

  const chartData = entries.map(e => ({
    label: new Date(e.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    value: e.weight_kg,
  }))

  const current = entries.length > 0 ? entries[entries.length - 1].weight_kg : initialWeight
  const min = entries.length > 0 ? Math.min(...entries.map(e => e.weight_kg)) : null
  const max = entries.length > 0 ? Math.max(...entries.map(e => e.weight_kg)) : null

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
        Suivi du poids
      </div>

      {/* Current stats */}
      {current && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.5rem 0.75rem', borderRadius: '0.625rem', background: 'var(--accent-blue-glow)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Actuel</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#60a5fa' }}>{current} kg</div>
          </div>
          {min !== null && (
            <div style={{ padding: '0.5rem 0.75rem', borderRadius: '0.625rem', background: 'var(--accent-green-glow)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Min</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#34d399' }}>{min} kg</div>
            </div>
          )}
          {max !== null && (
            <div style={{ padding: '0.5rem 0.75rem', borderRadius: '0.625rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Max</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fb7185' }}>{max} kg</div>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      {!loading && chartData.length > 1 && (
        <div style={{ marginBottom: '1rem' }}>
          <LineChart data={chartData} color="var(--accent-blue)" unit=" kg" />
        </div>
      )}

      {loading && <div className="skeleton" style={{ height: '8rem', marginBottom: '1rem' }} />}

      {/* Add weight */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input className="input" type="number" min="20" step="0.1" placeholder="Poids actuel (kg)" value={newWeight}
          onChange={e => setNewWeight(e.target.value)} style={{ flex: 1 }}
          onKeyDown={e => e.key === 'Enter' && addEntry()} />
        <button onClick={addEntry} disabled={saving || !newWeight} className="btn btn-primary btn-sm">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
          Ajouter
        </button>
      </div>
    </div>
  )
}
