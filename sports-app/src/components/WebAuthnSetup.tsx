'use client'

import { useState, useEffect } from 'react'
import { startRegistration } from '@simplewebauthn/browser'
import { Fingerprint, CheckCircle, Loader2 } from 'lucide-react'

export default function WebAuthnSetup() {
  const [supported, setSupported] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // WebAuthn supported and platform authenticator available (fingerprint/face)
    if (typeof window === 'undefined' || !window.PublicKeyCredential) return
    window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then(ok => setSupported(ok))
      .catch(() => {})

    setRegistered(localStorage.getItem('webauthn_registered') === 'true')
  }, [])

  if (!supported) return null

  async function handleRegister() {
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const optRes = await fetch('/api/webauthn/register-options', { method: 'POST' })
      if (!optRes.ok) throw new Error(await optRes.text())
      const options = await optRes.json()

      const attestation = await startRegistration({ optionsJSON: options })

      const verRes = await fetch('/api/webauthn/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attestation),
      })
      if (!verRes.ok) throw new Error(await verRes.text())

      localStorage.setItem('webauthn_registered', 'true')
      setRegistered(true)
      setSuccess(true)
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? String(e)
      if (!msg.includes('cancel') && !msg.includes('abort') && !msg.includes('NotAllowed')) {
        setError("L'activation a échoué. Réessaie.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      padding: '0.75rem 1rem',
      borderRadius: '0.875rem',
      background: registered ? 'rgba(16,185,129,0.07)' : 'var(--bg-secondary)',
      border: `1px solid ${registered ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
      display: 'flex', alignItems: 'center', gap: '0.75rem',
    }}>
      <div style={{
        width: '2rem', height: '2rem', borderRadius: '0.5rem', flexShrink: 0,
        background: registered ? 'rgba(16,185,129,0.15)' : 'var(--accent-blue-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {registered
          ? <CheckCircle size={14} color="var(--accent-green)" />
          : <Fingerprint size={14} color="var(--accent-blue)" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {registered ? 'Empreinte activée' : 'Connexion par empreinte'}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
          {registered
            ? 'Tu peux te connecter sans mot de passe'
            : 'Active pour te connecter avec ton empreinte ou Face ID'}
        </div>
        {success && <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)', marginTop: '0.2rem' }}>✓ Activée avec succès !</div>}
        {error && <div style={{ fontSize: '0.72rem', color: '#f87171', marginTop: '0.2rem' }}>{error}</div>}
      </div>
      {!registered && (
        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: 'none',
            background: 'var(--accent-blue)', color: 'white',
            fontSize: '0.8rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', opacity: loading ? 0.7 : 1, flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: '0.375rem',
          }}
        >
          {loading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          {loading ? 'Activation...' : 'Activer'}
        </button>
      )}
    </div>
  )
}
