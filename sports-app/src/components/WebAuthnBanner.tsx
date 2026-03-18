'use client'

import { useState, useEffect } from 'react'
import { startRegistration } from '@simplewebauthn/browser'
import { Fingerprint, X, Loader2 } from 'lucide-react'

const DISMISS_KEY = 'webauthn_banner_dismissed'

export default function WebAuthnBanner() {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

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

  async function handleActivate() {
    setLoading(true)
    try {
      const optRes = await fetch('/api/webauthn/register-options', { method: 'POST' })
      if (!optRes.ok) throw new Error()
      const options = await optRes.json()
      const attestation = await startRegistration({ optionsJSON: options })
      const verRes = await fetch('/api/webauthn/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attestation),
      })
      if (!verRes.ok) throw new Error()
      localStorage.setItem('webauthn_registered', 'true')
      setDone(true)
      setTimeout(() => setVisible(false), 2000)
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? ''
      if (!msg.includes('cancel') && !msg.includes('abort') && !msg.includes('NotAllowed')) {
        dismiss()
      } else {
        setLoading(false)
      }
    }
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
        {done ? (
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-green)' }}>
            ✓ Connexion par empreinte activée !
          </div>
        ) : (
          <>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Active la connexion par empreinte
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              Connecte-toi sans mot de passe avec ton empreinte digitale
            </div>
          </>
        )}
      </div>

      {!done && (
        <button
          onClick={handleActivate}
          disabled={loading}
          style={{
            padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: 'none',
            background: 'var(--accent-blue)', color: 'white',
            fontSize: '0.8rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', opacity: loading ? 0.7 : 1, flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: '0.375rem',
          }}
        >
          {loading && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Activation...' : 'Activer'}
        </button>
      )}

      {!done && (
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
      )}
    </div>
  )
}
