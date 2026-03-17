'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlusCircle, Trash2, Loader2 } from 'lucide-react'

interface Shoe {
  id: string
  name: string
  brand: string | null
  total_km: number
  max_km: number
  active: boolean
}

interface ShoeManagerProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export default function ShoeManager({ selectedId, onSelect }: ShoeManagerProps) {
  const supabase = createClient()
  const [shoes, setShoes] = useState<Shoe[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newBrand, setNewBrand] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadShoes()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadShoes() {
    const { data } = await supabase
      .from('running_shoes')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
    setShoes((data ?? []) as Shoe[])
    setLoading(false)
  }

  async function addShoe() {
    if (!newName.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('running_shoes').insert({
      user_id: user.id,
      name: newName.trim(),
      brand: newBrand.trim() || null,
    } as never)
    setNewName('')
    setNewBrand('')
    setShowAdd(false)
    setSaving(false)
    loadShoes()
  }

  async function removeShoe(id: string) {
    await supabase.from('running_shoes').update({ active: false } as never).eq('id', id)
    if (selectedId === id) onSelect(null)
    loadShoes()
  }

  if (loading) return <div className="skeleton" style={{ height: '2.5rem', borderRadius: '0.625rem' }} />

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '0.5rem' }}>
        {shoes.map(shoe => {
          const selected = selectedId === shoe.id
          const kmPct = Math.min((shoe.total_km / shoe.max_km) * 100, 100)
          const isWorn = shoe.total_km >= shoe.max_km
          return (
            <button
              key={shoe.id}
              type="button"
              onClick={() => onSelect(selected ? null : shoe.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem',
                borderRadius: '0.75rem', border: `1px solid ${selected ? 'var(--accent-green)' : 'var(--border)'}`,
                background: selected ? 'var(--accent-green-glow)' : 'var(--bg-secondary)',
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: selected ? '#34d399' : 'var(--text-primary)' }}>
                  👟 {shoe.name}
                  {shoe.brand && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {shoe.brand}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--bg-card)' }}>
                    <div style={{
                      width: `${kmPct}%`, height: '100%', borderRadius: 2,
                      background: isWorn ? '#f87171' : 'var(--accent-green)',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: isWorn ? '#f87171' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {Math.round(shoe.total_km)}/{shoe.max_km}km
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeShoe(shoe.id) }}
                className="btn-icon btn-icon-danger"
                style={{ flexShrink: 0 }}
              >
                <Trash2 size={12} />
              </button>
            </button>
          )
        })}
      </div>

      {showAdd ? (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <input className="input" placeholder="Nom (ex: Pegasus 40)" value={newName} onChange={e => setNewName(e.target.value)} style={{ marginBottom: '0.375rem' }} />
            <input className="input" placeholder="Marque (optionnel)" value={newBrand} onChange={e => setNewBrand(e.target.value)} />
          </div>
          <button type="button" onClick={addShoe} disabled={saving || !newName.trim()} className="btn btn-green btn-sm">
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Ajouter'}
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setShowAdd(true)} className="btn btn-ghost btn-sm" style={{ width: '100%' }}>
          <PlusCircle size={14} /> Ajouter une paire
        </button>
      )}
    </div>
  )
}
