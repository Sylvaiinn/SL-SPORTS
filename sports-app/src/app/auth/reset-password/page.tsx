'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Dumbbell, Lock, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Supabase sets the session from the URL hash on page load
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2500)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e?.message ?? 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-primary)' }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="fade-in">

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
            Nouveau mot de passe
          </p>
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Mot de passe mis à jour !
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Redirection vers le dashboard…
            </p>
          </div>
        ) : !ready ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <Loader2 size={32} style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite', color: 'var(--accent-blue)' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Vérification du lien…
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Si rien ne se passe, le lien a peut-être expiré. <br />
              <button
                onClick={() => router.push('/login')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', fontFamily: 'inherit', fontSize: '0.8rem', padding: 0, marginTop: '0.5rem' }}
              >
                Demander un nouveau lien
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">
                  <Lock size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />
                  Nouveau mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 caractères"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    style={{ paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">
                  <Lock size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />
                  Confirmer le mot de passe
                </label>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              {/* Strength indicator */}
              {password.length > 0 && (
                <div>
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '3px', borderRadius: '999px',
                        background: password.length >= i * 3
                          ? (password.length >= 12 ? 'var(--accent-green)' : password.length >= 8 ? 'var(--accent-blue)' : 'var(--accent-amber)')
                          : 'var(--border)',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: password.length >= 12 ? 'var(--accent-green)' : password.length >= 8 ? 'var(--accent-blue)' : 'var(--accent-amber)' }}>
                    {password.length >= 12 ? '🔒 Mot de passe fort' : password.length >= 8 ? '🔑 Mot de passe correct' : '⚠️ Mot de passe faible'}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.625rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.875rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Mise à jour…' : 'Définir le nouveau mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
