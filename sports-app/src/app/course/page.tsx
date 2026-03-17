'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { PlusCircle, History, BarChart3, Trophy } from 'lucide-react'
import RunForm from './components/RunForm'
import RunHistory from './components/RunHistory'
import RunStats from './components/RunStats'
import RunRecords from './components/RunRecords'

type Tab = 'new' | 'history' | 'stats' | 'records'

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ size?: number; fill?: string }> }[] = [
  { key: 'new', label: 'Nouvelle', icon: PlusCircle },
  { key: 'history', label: 'Historique', icon: History },
  { key: 'stats', label: 'Stats', icon: BarChart3 },
  { key: 'records', label: 'Records', icon: Trophy },
]

export default function CoursePage() {
  const [activeTab, setActiveTab] = useState<Tab>('new')

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Course à pied</h1>
        <p>Suivi de vos séances de running</p>
      </div>

      {/* Tab bar */}
      <div className="tab-bar">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`tab-bar-item ${activeTab === key ? 'active' : ''}`}
            style={activeTab === key ? { background: 'var(--accent-green)' } : {}}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'new' && <RunForm onSaved={() => setActiveTab('history')} />}
      {activeTab === 'history' && <RunHistory />}
      {activeTab === 'stats' && <RunStats />}
      {activeTab === 'records' && <RunRecords />}
    </div>
  )
}
