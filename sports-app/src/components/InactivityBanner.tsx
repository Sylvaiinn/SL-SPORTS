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

  if (dismissed) return null

  // Aucune séance enregistrée : proposer de démarrer
  if (daysSinceLastSession >= 999) {
    return (
      <div className="inactivity-banner" style={{ borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.08)' }}>
        <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bell size={16} color="var(--accent-blue)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-blue)' }}>Bienvenue ! Prêt à commencer ?</div>
          <button
            onClick={() => router.push('/musculation/new')}
            style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.2)' }}
          >
            Créer ma première séance →
          </button>
        </div>
        <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
          <XCircle size={18} />
        </button>
      </div>
    )
  }

  if (daysSinceLastSession < 2) return null

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
