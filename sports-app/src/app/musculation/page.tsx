'use client'

import { useState } from 'react'
import { Dumbbell, PlusCircle, LayoutGrid, History, BarChart3 } from 'lucide-react'
import WorkoutForm from './components/WorkoutForm'
import TemplateManager from './components/TemplateManager'
import WorkoutHistory from './components/WorkoutHistory'
import WorkoutStats from './components/WorkoutStats'

const TABS = [
  { id: 'new', label: 'Nouvelle', icon: PlusCircle },
  { id: 'templates', label: 'Templates', icon: LayoutGrid },
  { id: 'history', label: 'Historique', icon: History },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
] as const

type TabId = (typeof TABS)[number]['id']

interface SelectedTemplate {
  id: string
  name: string
  exercises_json: { name: string; sets: number; reps: string; muscle_groups: string[] }[]
  [key: string]: unknown
}

export default function MuscuPage() {
  const [tab, setTab] = useState<TabId>('new')
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<SelectedTemplate | null>(null)

  function handleSessionSaved() {
    setRefreshKey(k => k + 1)
    setTab('history')
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'var(--accent-violet-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Dumbbell size={18} color="var(--accent-violet)" />
          </div>
          <div>
            <h1>Musculation</h1>
            <p>Suivi de vos séances</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tab-bar" style={{ overflowX: 'auto' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`tab-bar-item ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
            style={tab === id ? { background: 'var(--accent-violet)', color: 'white' } : {}}
          >
            <Icon size={14} />
            <span style={{ fontSize: '0.8125rem' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {/* Bug #6 fix: utiliser display:none plutôt que key={tab} pour ne pas détruire l'état
          du WorkoutForm (workout en cours) à chaque changement d'onglet */}
      <div className="fade-in">
        <div style={{ display: tab === 'new' ? 'block' : 'none' }}>
          <WorkoutForm onSaved={handleSessionSaved} initialTemplate={selectedTemplate} onTemplateConsumed={() => setSelectedTemplate(null)} />
        </div>
        {tab === 'templates' && <TemplateManager onUseTemplate={(tpl) => { setSelectedTemplate(tpl as unknown as SelectedTemplate); setTab('new') }} key={refreshKey} />}
        {tab === 'history' && <WorkoutHistory key={refreshKey} />}
        {tab === 'stats' && <WorkoutStats key={refreshKey} />}
      </div>
    </div>
  )
}
