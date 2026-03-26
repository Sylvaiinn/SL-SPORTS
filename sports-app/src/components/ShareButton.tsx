'use client'

import { useState } from 'react'
import { Share2, X, Copy, Check } from 'lucide-react'

export interface ShareSessionData {
  type: 'muscu' | 'swim' | 'run'
  title: string
  date: string
  stats: { label: string; value: string }[]
  username?: string
}

const TYPE_CONFIG = {
  muscu: { emoji: '🏋️', color: 'var(--accent-violet)', bg: 'var(--accent-violet-glow)', border: 'rgba(139,92,246,0.35)', label: 'Musculation' },
  swim:  { emoji: '🏊', color: 'var(--accent-blue)',   bg: 'var(--accent-blue-glow)',   border: 'rgba(59,130,246,0.35)',  label: 'Natation' },
  run:   { emoji: '🏃', color: 'var(--accent-green)',  bg: 'var(--accent-green-glow)',  border: 'rgba(16,185,129,0.35)', label: 'Course' },
}

export default function ShareButton({ session }: { session: ShareSessionData }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const cfg = TYPE_CONFIG[session.type]
  const dateLabel = new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const shareText = [
    `${cfg.emoji} ${session.title}`,
    `📅 ${dateLabel}`,
    '',
    ...session.stats.map(s => `• ${s.label} : ${s.value}`),
    '',
    '🏆 SPORTS.SL — suivi sportif',
  ].join('\n')

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: session.title, text: shareText })
        return
      } catch {
        // cancelled or not supported, fall through to modal
      }
    }
    setOpen(true)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button
        onClick={handleShare}
        className="btn btn-ghost btn-sm"
        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)' }}
        title="Partager la séance"
      >
        <Share2 size={15} />
        Partager
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            padding: '0 0 env(safe-area-inset-bottom)',
          }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="fade-in"
            style={{
              width: '100%', maxWidth: '480px',
              background: 'var(--bg-secondary)', borderRadius: '1.25rem 1.25rem 0 0',
              border: '1px solid var(--border)', padding: '1.25rem',
            }}
          >
            {/* Handle */}
            <div style={{ width: '2.5rem', height: '4px', borderRadius: '2px', background: 'var(--border)', margin: '0 auto 1.25rem' }} />

            {/* Card preview */}
            <div style={{
              border: `1px solid ${cfg.border}`,
              borderRadius: '1rem',
              background: cfg.bg,
              padding: '1.25rem',
              marginBottom: '1.25rem',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Top stripe */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: cfg.color, borderRadius: '1rem 1rem 0 0' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{cfg.emoji}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{session.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{dateLabel}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: session.stats.length >= 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {session.stats.map(s => (
                  <div key={s.label} style={{ background: 'var(--bg-card)', borderRadius: '0.625rem', padding: '0.5rem 0.625rem', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: cfg.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {session.username && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>@{session.username}</span>
                )}
                <span style={{ fontSize: '0.7rem', color: cfg.color, fontWeight: 700, marginLeft: 'auto' }}>SPORTS.SL</span>
              </div>
            </div>

            {/* Actions */}
            <button onClick={handleCopy} className="btn btn-primary btn-full" style={{ marginBottom: '0.625rem' }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copié !' : 'Copier le texte'}
            </button>
            <button onClick={() => setOpen(false)} className="btn btn-ghost btn-full">
              <X size={16} /> Fermer
            </button>
          </div>
        </div>
      )}
    </>
  )
}
