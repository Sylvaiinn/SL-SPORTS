export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell, PlusCircle, Calendar, ChevronRight } from 'lucide-react'
import ExportCSVButton from '@/components/ExportCSVButton'

export default async function MuscuPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workouts } = await supabase
    .from('workouts')
    .select('id, name, date, notes, exercises(id, name, sets(id))')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Musculation</h1>
          <p>Historique de vos séances</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
          <ExportCSVButton />
          <Link href="/musculation/new" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
            <PlusCircle size={15} /> Nouvelle
          </Link>
        </div>
      </div>

      {!workouts || workouts.length === 0 ? (
        <div className="empty-state">
          <Dumbbell size={44} />
          <h3>Aucune séance enregistrée</h3>
          <p>Créez votre première séance pour commencer à suivre vos progrès</p>
          <Link href="/musculation/new" className="btn btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex' }}>
            <PlusCircle size={16} /> Commencer
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {workouts.map((w) => {
            const exoList = Array.isArray(w.exercises) ? w.exercises : []
            const totalSets = exoList.reduce((acc, ex) => acc + (Array.isArray(ex.sets) ? ex.sets.length : 0), 0)
            return (
              <Link key={w.id} href={`/musculation/${w.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '3rem', height: '3rem', borderRadius: '0.875rem', background: 'linear-gradient(135deg, var(--accent-blue-glow), var(--accent-violet-glow))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(59,130,246,0.2)' }}>
                    <Dumbbell size={18} color="var(--accent-blue)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{w.name}</div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} />
                        {new Date(w.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <span className="badge badge-blue">{exoList.length} exo{exoList.length > 1 ? 's' : ''}</span>
                      <span className="badge badge-violet">{totalSets} série{totalSets > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
