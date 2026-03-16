'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Dumbbell, Mail, Lock, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/dashboard`,
          },
        })
        if (signUpError) throw signUpError
        // Don't redirect — Supabase requires email confirmation first
        setEmailSent(true)
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e?.message ?? 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  // After signup: show confirmation screen
  if (emailSent) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-primary)' }}>
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }} className="fade-in">
          <div style={{
            width: '5rem', height: '5rem', borderRadius: '1.5rem',
            background: 'linear-gradient(135deg, rgba(20,184,166,0.3), rgba(20,184,166,0.1))',
            border: '2px solid var(--accent-teal)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 40px var(--accent-teal-glow)',
          }}>
            <CheckCircle size={36} color="var(--accent-teal)" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Vérifiez votre email !
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
            Un email de confirmation a été envoyé à :
          </p>
          <p style={{ color: 'var(--accent-teal)', fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem' }}>
            {email}
          </p>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              📬 Cliquez sur le lien dans l&apos;email pour activer votre compte.<br />
              ⏳ Le lien expire après 24 heures.<br />
              📁 Vérifiez aussi vos <strong style={{ color: 'var(--text-primary)' }}>spams</strong> si vous ne voyez rien.
            </p>
          </div>
          <button
            onClick={() => { setEmailSent(false); setMode('login') }}
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
            margin: '0 auto 1rem', boxShadow: '0 0 40px rgba(59,130,246,0.3)'
          }}>
            <Dumbbell size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>SPORTS.SL</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {mode === 'login' ? 'Connectez-vous à votre compte' : 'Créez votre compte gratuit'}
          </p>
        </div>

        {/* Toggle */}
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'signup' && (
            <div className="input-group">
              <label className="input-label"><User size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Pseudo</label>
              <input className="input" type="text" placeholder="Ex: SylvainL" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
          )}
          <div className="input-group">
            <label className="input-label"><Mail size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Email</label>
            <input className="input" type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label"><Lock size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Mot de passe</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          {mode === 'signup' && (
            <div style={{ padding: '0.75rem', borderRadius: '0.625rem', background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.25)', fontSize: '0.8125rem', color: 'var(--accent-teal)', lineHeight: 1.5 }}>
              📧 Après inscription, un email de confirmation vous sera envoyé. Cliquez sur le lien pour activer votre compte.
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.625rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.875rem' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  )
}
