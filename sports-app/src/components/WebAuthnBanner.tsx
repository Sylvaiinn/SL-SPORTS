'use client'

import { useState, useEffect } from 'react'
import { Fingerprint, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const DISMISS_KEY = 'webauthn_banner_dismissed'

export default function WebAuthnBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) return
    const alreadyRegistered = localStorage.getItem('webauthn_registered') === 'true'
    const dismissed = localStorage.getItem(DISMISS_KEY) === 'true'
    if (alreadyRegistered || dismissed) return
    window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then(ok => { if (ok) setVisible(true) })
      .catch(() => {})
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.75rem 1rem', borderRadius: '0.875rem',
      background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(124,58,237,0.08))',
      border: '1px solid rgba(59,130,246,0.3)',
      marginBottom: '1rem',
    }}>
      <div style={{
        width: '2rem', height: '2rem', borderRadius: '0.5rem', flexShrink: 0,
        background: 'var(--accent-blue-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Fingerprint size={14} color="var(--accent-blue)" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Active la connexion par empreinte
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
          Connecte-toi sans mot de passe depuis ton profil
        </div>
      </div>

      <Link
        href="/profil#connexion-empreinte"
        style={{
          padding: '0.4rem 0.875rem', borderRadius: '0.5rem',
          background: 'var(--accent-blue)', color: 'white',
          fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none',
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}
      >
        Activer <ArrowRight size={12} />
      </Link>

      <button
        onClick={dismiss}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', padding: '0.25rem', flexShrink: 0,
          display: 'flex', alignItems: 'center',
        }}
        title="Ignorer"
      >
        <X size={15} />
      </button>
    </div>
  )
}
