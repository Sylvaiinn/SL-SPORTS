'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { startAuthentication } from '@simplewebauthn/browser'
import {
  Dumbbell, Mail, Lock, User, AlertCircle, Loader2,
  CheckCircle, ArrowLeft, Eye, EyeOff, Fingerprint,
} from 'lucide-react'

type Mode = 'login' | 'signup' | 'forgot'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [biometricStep, setBiometricStep] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<'email-sent' | 'reset-sent' | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) return
    const registered = localStorage.getItem('webauthn_registered') === 'true'
    if (!registered) return
    window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then(ok => setBiometricAvailable(ok))
      .catch(() => {})
  }, [])

  async function handleBiometric() {
    setBiometricLoading(true)
    setError('')
    setBiometricStep('Étape 1/4 : challenge…')
    try {
      const optRes = await fetch('/api/webauthn/login-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!optRes.ok) {
        const e = await optRes.json().catch(() => ({}))
        throw new Error(`[1/4 challenge] ${e.error ?? optRes.status}`)
      }
      const options = await optRes.json()

      setBiometricStep('Étape 2/4 : empreinte…')
      let assertion
      try {
        assertion = await startAuthentication({ optionsJSON: options })
      } catch (webauthnErr) {
        const msg = (webauthnErr as { message?: string })?.message ?? String(webauthnErr)
        if (msg.includes('cancel') || msg.includes('abort') || msg.includes('NotAllowed')) return
        throw new Error(`[2/4 WebAuthn] ${msg}`)
      }

      setBiometricStep('Étape 3/4 : vérification serveur…')
      const verRes = await fetch('/api/webauthn/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assertion),
      })
      const verData = await verRes.json()
      if (!verRes.ok) throw new Error(`[3/4 verify] ${verData.error ?? verRes.status}`)

      setBiometricStep('Étape 4/4 : ouverture de session…')
      window.location.href = verData.action_link
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? String(e)
      setError(msg)
    } finally {
      setBiometricLoading(false)
      setBiometricStep('')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })
        if (resetError) throw resetError
        setSuccess('reset-sent')

      } else if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        })
        if (signUpError) throw signUpError
        setSuccess('email-sent')

      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        router.push('/dashboard?tuto=1')
        router.refresh()
      }
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e?.message ?? 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  /* ─── Success screens ─── */
  if (success) {
    const isReset = success === 'reset-sent'
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-primary)' }}>
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }} className="fade-in">
          <div style={{
            width: '5rem', height: '5rem', borderRadius: '1.5rem',
            background: isReset ? 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(59,130,246,0.1))' : 'linear-gradient(135deg, rgba(20,184,166,0.3), rgba(20,184,166,0.1))',
            border: `2px solid ${isReset ? 'var(--accent-blue)' : 'var(--accent-teal)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: `0 0 40px ${isReset ? 'var(--accent-blue-glow)' : 'var(--accent-teal-glow)'}`,
          }}>
            <CheckCircle size={36} color={isReset ? 'var(--accent-blue)' : 'var(--accent-teal)'} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            {isReset ? 'Email de réinitialisation envoyé' : 'Vérifiez votre email !'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
            {isReset ? 'Un lien de réinitialisation a été envoyé à :' : 'Un email de confirmation a été envoyé à :'}
          </p>
          <p style={{ color: isReset ? 'var(--accent-blue)' : 'var(--accent-teal)', fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem' }}>
            {email}
          </p>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {isReset ? (
                <>📬 Cliquez sur le lien dans l&apos;email pour choisir un nouveau mot de passe.<br />⏳ Le lien expire après 1 heure.<br />📁 Vérifiez vos <strong style={{ color: 'var(--text-primary)' }}>spams</strong> si besoin.</>
              ) : (
                <>📬 Cliquez sur le lien dans l&apos;email pour activer votre compte.<br />⏳ Le lien expire après 24 heures.<br />📁 Vérifiez vos <strong style={{ color: 'var(--text-primary)' }}>spams</strong> si besoin.</>
              )}
            </p>
          </div>
          <button
            onClick={() => { setSuccess(null); setMode('login') }}
            className="btn btn-ghost btn-full"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-primary)' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '4rem', height: '4rem', borderRadius: '1.25rem',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', boxShadow: '0 0 40px rgba(59,130,246,0.3)',
          }}>
            <Dumbbell size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>SPORTS.SL</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {mode === 'login' && 'Connectez-vous à votre compte'}
            {mode === 'signup' && 'Créez votre compte gratuit'}
            {mode === 'forgot' && 'Réinitialiser le mot de passe'}
          </p>
        </div>

        {/* Mode toggle (login / signup only) */}
        {mode !== 'forgot' && (
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '0.875rem', padding: '0.25rem', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s',
                  background: mode === m ? 'var(--accent-blue)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--text-muted)',
                }}
              >
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>
        )}

        {/* Back arrow for forgot mode */}
        {mode === 'forgot' && (
          <button
            onClick={() => { setMode('login'); setError('') }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem', fontFamily: 'inherit', marginBottom: '1.5rem', padding: 0 }}
          >
            <ArrowLeft size={16} /> Retour à la connexion
          </button>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {mode === 'signup' && (
            <div className="input-group">
              <label className="input-label">
                <User size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Pseudo
              </label>
              <input className="input" type="text" placeholder="Ex: SylvainL" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username" />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">
              <Mail size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Email
            </label>
            <input className="input" type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          {mode !== 'forgot' && (
            <div className="input-group">
              <label className="input-label">
                <Lock size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    padding: '0.25rem', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', fontSize: '0.8125rem', fontFamily: 'inherit', padding: 0, marginTop: '0.25rem', alignSelf: 'flex-end', display: 'block', marginLeft: 'auto' }}
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <div style={{ padding: '0.75rem', borderRadius: '0.625rem', background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.25)', fontSize: '0.8125rem', color: 'var(--accent-teal)', lineHeight: 1.5 }}>
              📧 Après inscription, un email de confirmation vous sera envoyé.
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.625rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.875rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: '0.25rem' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading
              ? 'Chargement...'
              : mode === 'login'
                ? 'Se connecter'
                : mode === 'signup'
                  ? 'Créer mon compte'
                  : 'Envoyer le lien'}
          </button>
        </form>

        {/* Fingerprint / WebAuthn login */}
        {mode === 'login' && biometricAvailable && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>ou</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>
            <button
              onClick={handleBiometric}
              disabled={biometricLoading}
              style={{
                width: '100%', padding: '0.875rem', borderRadius: '0.875rem',
                border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                cursor: biometricLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                fontFamily: 'inherit', fontSize: '0.9375rem', fontWeight: 600,
                color: 'var(--text-primary)', transition: 'border-color 0.2s',
                opacity: biometricLoading ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!biometricLoading) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.5)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}
            >
              {biometricLoading
                ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                : <Fingerprint size={20} color="var(--accent-blue)" />}
              {biometricStep || (biometricLoading ? 'Vérification...' : 'Se connecter avec l\'empreinte')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
