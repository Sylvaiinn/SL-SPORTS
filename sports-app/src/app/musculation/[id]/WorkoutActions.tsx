'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Trash2, Loader2, X } from 'lucide-react'
import Link from 'next/link'

export default function WorkoutActions({ workoutId }: { workoutId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('workouts').delete().eq('id', workoutId)
    router.push('/musculation')
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Link
        href={`/musculation/${workoutId}/edit`}
        className="btn btn-ghost btn-sm"
        style={{ gap: '0.4rem' }}
      >
        <Pencil size={14} /> Modifier
      </Link>

      {!confirmDelete ? (
        <button onClick={() => setConfirmDelete(true)} className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
          <Trash2 size={14} /> Supprimer
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Confirmer ?</span>
          <button onClick={handleDelete} disabled={deleting} className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {deleting ? '...' : 'Oui'}
          </button>
          <button onClick={() => setConfirmDelete(false)} className="btn-icon" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
