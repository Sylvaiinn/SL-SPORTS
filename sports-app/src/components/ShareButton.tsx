'use client'

import { useState, useRef } from 'react'
import { Share2, X, Download, Copy, Check, Loader2 } from 'lucide-react'

export interface ShareSessionData {
  type: 'muscu' | 'swim' | 'run'
  title: string
  date: string
  stats: { label: string; value: string }[]
  username?: string
  exercises?: { name: string; topSet: string }[]
}

const TYPE_CONFIG = {
  muscu: { emoji: '🏋️', label: 'Musculation', color: '#8b5cf6', bg: '#1a0e2e' },
  swim:  { emoji: '🏊', label: 'Natation',    color: '#3b82f6', bg: '#0e1a2e' },
  run:   { emoji: '🏃', label: 'Course',      color: '#10b981', bg: '#0e2820' },
}

function buildShareText(session: ShareSessionData): string {
  const cfg = TYPE_CONFIG[session.type]
  const date = new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const lines = [
    `${cfg.emoji} ${session.title}`,
    date,
    '',
    ...session.stats.filter(s => s.value && s.value !== '-').map(s => `${s.label} : ${s.value}`),
  ]
  if (session.exercises?.length) {
    lines.push('')
    session.exercises.slice(0, 5).forEach(ex => lines.push(`• ${ex.name} — ${ex.topSet}`))
  }
  lines.push('', '🏆 SPORTS.SL')
  return lines.join('\n')
}

// ─── Canvas pour téléchargement uniquement ───────────────────────────────────
async function generateDownloadImage(session: ShareSessionData): Promise<Blob | null> {
  const cfg = TYPE_CONFIG[session.type]
  const S = 540
  const canvas = document.createElement('canvas')
  canvas.width = S; canvas.height = S
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Background
  ctx.fillStyle = cfg.bg
  ctx.fillRect(0, 0, S, S)

  // Top bar
  ctx.fillStyle = cfg.color
  ctx.fillRect(0, 0, S, 6)

  const P = 28  // padding
  let y = 24

  // Emoji + title
  ctx.font = '52px serif'
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  ctx.fillText(cfg.emoji, P, y)
  y += 60

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.fillText(session.title.slice(0, 30) + (session.title.length > 30 ? '…' : ''), P, y)
  y += 36

  // Date
  const date = new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '16px system-ui, sans-serif'
  ctx.fillText(date.charAt(0).toUpperCase() + date.slice(1), P, y)
  y += 30

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(P, y); ctx.lineTo(S - P, y); ctx.stroke()
  y += 18

  if (session.exercises?.length) {
    // Stats line
    const parts = session.stats.filter(s => s.value && s.value !== '-').slice(0, 3).map(s => `${s.label}: ${s.value}`)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '14px system-ui, sans-serif'
    ctx.fillText(parts.join('  ·  '), P, y)
    y += 26

    // Exercises
    session.exercises.slice(0, 5).forEach(ex => {
      ctx.fillStyle = cfg.color
      ctx.fillRect(P, y + 4, 3, 20)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 16px system-ui, sans-serif'
      ctx.textAlign = 'left'
      const maxW = S - P * 2 - 120
      let name = ex.name
      while (ctx.measureText(name).width > maxW && name.length > 3) name = name.slice(0, -1)
      if (name !== ex.name) name += '…'
      ctx.fillText(name, P + 12, y + 5)

      ctx.fillStyle = cfg.color
      ctx.font = 'bold 16px system-ui, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(ex.topSet, S - P, y + 5)

      ctx.textAlign = 'left'
      y += 30
    })
  } else {
    // Stats grid
    const stats = session.stats.filter(s => s.value && s.value !== '-').slice(0, 6)
    const cols = Math.min(stats.length, 3)
    const cellW = (S - P * 2 - (cols - 1) * 10) / cols
    stats.forEach((stat, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = P + col * (cellW + 10)
      const cy = y + row * 70

      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.beginPath(); ctx.roundRect(x, cy, cellW, 60, 8); ctx.fill()

      ctx.fillStyle = cfg.color
      ctx.font = `bold ${stat.value.length > 6 ? 18 : 22}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(stat.value, x + cellW / 2, cy + 22)

      ctx.fillStyle = 'rgba(255,255,255,0.45)'
      ctx.font = '12px system-ui, sans-serif'
      ctx.fillText(stat.label, x + cellW / 2, cy + 44)
    })
    y += Math.ceil(stats.length / cols) * 70
  }

  // Branding
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = 'bold 14px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('SPORTS.SL', S / 2, S - 14)

  return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/jpeg', 0.88))
}

// ─── HTML Card Preview ────────────────────────────────────────────────────────
function CardPreview({ session }: { session: ShareSessionData }) {
  const cfg = TYPE_CONFIG[session.type]
  const date = new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const stats = session.stats.filter(s => s.value && s.value !== '-')

  return (
    <div style={{
      borderRadius: '0.875rem', overflow: 'hidden',
      background: cfg.bg,
      border: `1px solid ${cfg.color}44`,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Accent bar */}
      <div style={{ height: '4px', background: cfg.color }} />

      <div style={{ padding: '1rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{cfg.emoji}</span>
              <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#fff' }}>{session.title}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>
              {date.charAt(0).toUpperCase() + date.slice(1)}
            </span>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: cfg.color, background: `${cfg.color}22`, border: `1px solid ${cfg.color}55`, padding: '0.2rem 0.5rem', borderRadius: '99px' }}>
            {cfg.label.toUpperCase()}
          </span>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '0.625rem' }} />

        {/* Exercises or stats */}
        {session.exercises?.length ? (
          <>
            {stats.length > 0 && (
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>
                {stats.slice(0, 3).map(s => `${s.label}: ${s.value}`).join('  ·  ')}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {session.exercises.slice(0, 4).map((ex, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.5rem', borderRadius: '0.375rem', background: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '3px', height: '1rem', borderRadius: '2px', background: cfg.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '0.75rem', color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: cfg.color, flexShrink: 0 }}>{ex.topSet}</span>
                </div>
              ))}
              {(session.exercises?.length ?? 0) > 4 && (
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                  +{(session.exercises?.length ?? 0) - 4} exercice{(session.exercises?.length ?? 0) - 4 > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, 1fr)`, gap: '0.375rem' }}>
            {stats.slice(0, 6).map(s => (
              <div key={s.label} style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: cfg.color }}>{s.value}</div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Branding */}
        <div style={{ marginTop: '0.625rem', textAlign: 'center', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', fontWeight: 700, letterSpacing: '0.08em' }}>
          SPORTS.SL
        </div>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ShareButton({ session }: { session: ShareSessionData }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const cfg = TYPE_CONFIG[session.type]
  const shareText = buildShareText(session)

  async function handleNativeShare() {
    if (typeof navigator === 'undefined' || !('share' in navigator)) return
    try {
      await navigator.share({ title: session.title, text: shareText })
    } catch { /* annulé */ }
  }

  async function handleDownload() {
    setDownloading(true)
    const blob = await generateDownloadImage(session)
    setDownloading(false)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seance-${session.type}-${session.date}.jpg`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleCopyText() {
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-ghost btn-sm"
        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', padding: '0.35rem 0.6rem' }}
        title="Partager la séance"
      >
        <Share2 size={14} />
        <span style={{ fontSize: '0.8125rem' }}>Partager</span>
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="fade-in"
            style={{
              width: '100%', maxWidth: '520px',
              background: 'var(--bg-secondary)',
              borderRadius: '1.5rem 1.5rem 0 0',
              border: '1px solid var(--border)',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)',
            }}
          >
            <div style={{ padding: '0.875rem 1.25rem 0' }}>
              <div style={{ width: '2.5rem', height: '4px', borderRadius: '2px', background: 'var(--border)', margin: '0 auto' }} />
            </div>
            <div style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Partager la séance</span>
              <button onClick={() => setOpen(false)} className="btn-icon" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            {/* Prévisualisation HTML — instantanée */}
            <div style={{ padding: '0 1.25rem', marginBottom: '1.25rem' }}>
              <CardPreview session={session} />
            </div>

            {/* Boutons */}
            <div style={{ padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="btn btn-primary btn-full"
                  style={{ background: cfg.color, borderColor: cfg.color }}
                >
                  <Share2 size={16} />
                  Partager
                </button>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  {downloading ? 'Génération…' : 'Image'}
                </button>

                <button
                  onClick={handleCopyText}
                  className="btn btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {copied ? <Check size={15} color="#34d399" /> : <Copy size={15} />}
                  {copied ? 'Copié !' : 'Copier texte'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
