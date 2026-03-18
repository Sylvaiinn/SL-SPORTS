'use client'

import { useState, useEffect } from 'react'
import { startRegistration } from '@simplewebauthn/browser'
import { Fingerprint, CheckCircle, Loader2 } from 'lucide-react'

export default function WebAuthnSetup() {
  const [supported, setSupported] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
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
    <div
      id="connexion-empreinte"
      style={{
        padding: '1rem',
        borderRadius: '0.875rem',
        background: registered
          ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.04))'
          : 'var(--bg-secondary)',
        border: `1px solid ${registered ? 'rgba(16,185,129,0.35)' : 'var(--border)'}`,
        transition: 'all 0.3s',
      }}
    >
      {/* Label section */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
        Sécurité
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* Icon */}
        <div style={{
          width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', flexShrink: 0,
          background: registered ? 'rgba(16,185,129,0.15)' : 'var(--accent-blue-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${registered ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.2)'}`,
        }}>
          {registered
            ? <CheckCircle size={18} color="var(--accent-green)" />
            : <Fingerprint size={18} color="var(--accent-blue)" />}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: registered ? 'var(--accent-green)' : 'var(--text-primary)' }}>
            {registered ? '✓ Empreinte activée' : 'Connexion par empreinte'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {registered
              ? 'Tu peux te connecter sans saisir ton mot de passe'
              : 'Active pour te connecter avec ton empreinte ou Face ID'}
          </div>
          {error && (
            <div style={{ fontSize: '0.72rem', color: '#f87171', marginTop: '0.25rem' }}>
              {error}
            </div>
          )}
        </div>

        {/* Action */}
        {registered ? (
          <div style={{
            padding: '0.4rem 0.75rem', borderRadius: '0.5rem',
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
            fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-green)',
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}>
            <CheckCircle size={13} /> Activée
          </div>
        ) : (
          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none',
              background: 'var(--accent-blue)', color: 'white',
              fontSize: '0.8rem', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: loading ? 0.7 : 1, flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: '0.375rem',
            }}
          >
            {loading && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Activation...' : 'Activer'}
          </button>
        )}
      </div>
    </div>
  )
}
