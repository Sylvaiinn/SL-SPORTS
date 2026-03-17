'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MAIN_GOALS } from '@/lib/constants'
import { Save, Loader2, X } from 'lucide-react'

interface ProfileData {
  username: string | null
  bio: string | null
  city: string | null
  age: number | null
  weight_kg: number | null
  height_cm: number | null
  main_goal: string | null
}

interface ProfileEditorProps {
  userId: string
  initial: ProfileData
  onSaved: (data: ProfileData) => void
  onClose: () => void
}

export default function ProfileEditor({ userId, initial, onSaved, onClose }: ProfileEditorProps) {
  const supabase = createClient()
  const [form, setForm] = useState<ProfileData>({ ...initial })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const { error: err } = await supabase.from('profiles').update({
        username: form.username?.trim() || null,
        bio: form.bio?.trim() || null,
        city: form.city?.trim() || null,
        age: form.age,
        weight_kg: form.weight_kg,
        height_cm: form.height_cm,
        main_goal: form.main_goal,
      } as never).eq('id', userId)
      if (err) throw err
      onSaved(form)
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card fade-in" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Modifier le profil</h3>
        <button onClick={onClose} className="btn-icon" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}><X size={16} /></button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="input-group">
          <label className="input-label">Pseudo</label>
          <input className="input" value={form.username || ''} onChange={e => update('username', e.target.value)} placeholder="MonPseudo" />
        </div>

        <div className="input-group">
          <label className="input-label">Bio</label>
          <textarea className="input" rows={2} value={form.bio || ''} onChange={e => update('bio', e.target.value)} placeholder="Courte bio..." style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="input-group">
            <label className="input-label">Ville</label>
            <input className="input" value={form.city || ''} onChange={e => update('city', e.target.value)} placeholder="Paris" />
          </div>
          <div className="input-group">
            <label className="input-label">Âge</label>
            <input className="input" type="number" min="10" max="100" value={form.age ?? ''} onChange={e => update('age', e.target.value ? parseInt(e.target.value) : null)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="input-group">
            <label className="input-label">Poids (kg)</label>
            <input className="input" type="number" min="30" step="0.1" value={form.weight_kg ?? ''} onChange={e => update('weight_kg', e.target.value ? parseFloat(e.target.value) : null)} />
          </div>
          <div className="input-group">
            <label className="input-label">Taille (cm)</label>
            <input className="input" type="number" min="100" max="250" value={form.height_cm ?? ''} onChange={e => update('height_cm', e.target.value ? parseInt(e.target.value) : null)} />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Objectif principal</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
            {MAIN_GOALS.map(g => (
              <button key={g} type="button" onClick={() => update('main_goal', form.main_goal === g ? null : g)} style={{
                padding: '0.5rem', borderRadius: '0.625rem', fontSize: '0.8125rem', fontWeight: 600,
                border: `1px solid ${form.main_goal === g ? 'var(--accent-blue)' : 'var(--border)'}`,
                background: form.main_goal === g ? 'var(--accent-blue-glow)' : 'var(--bg-secondary)',
                color: form.main_goal === g ? '#60a5fa' : 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}>{g}</button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '0.8125rem', marginTop: '0.75rem' }}>{error}</div>
      )}

      <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  )
}
