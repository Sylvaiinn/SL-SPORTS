'use client'

import { useRouter } from 'next/navigation'
import { Bell, XCircle } from 'lucide-react'
import { useState } from 'react'

interface InactivityBannerProps {
  daysSinceLastSession: number
}

export default function InactivityBanner({ daysSinceLastSession }: InactivityBannerProps) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || daysSinceLastSession < 2) return null

  const msg =
    daysSinceLastSession === 2
      ? "Cela fait 2 jours sans séance 💪 Envie d'y retourner ?"
      : daysSinceLastSession <= 5
      ? `${daysSinceLastSession} jours sans séance — allez, on repart !`
      : `${daysSinceLastSession} jours d'inactivité — votre corps vous appelle !`

  return (
    <div className="inactivity-banner">
      <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bell size={16} color="#fbbf24" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fbbf24' }}>{msg}</div>
        <button
          onClick={() => router.push('/musculation/new')}
          style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.2)' }}
        >
          Créer une séance →
        </button>
      </div>
      <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
        <XCircle size={18} />
      </button>
    </div>
  )
}
