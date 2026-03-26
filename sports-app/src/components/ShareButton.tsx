'use client'

import { useState, useRef, useEffect } from 'react'
import { Share2, X, Download, Copy, Check, Image as ImageIcon } from 'lucide-react'

export interface ShareSessionData {
  type: 'muscu' | 'swim' | 'run'
  title: string
  date: string
  stats: { label: string; value: string }[]
  username?: string
  exercises?: { name: string; topSet: string }[]
}

const TYPE_CONFIG = {
  muscu: { emoji: '🏋️', label: 'Musculation', color: '#8b5cf6', glow: 'rgba(139,92,246,0.35)', gradient: ['#1a0e2e', '#0f0f1a'] },
  swim:  { emoji: '🏊', label: 'Natation',    color: '#3b82f6', glow: 'rgba(59,130,246,0.35)',  gradient: ['#0e1a2e', '#0f0f1a'] },
  run:   { emoji: '🏃', label: 'Course',      color: '#10b981', glow: 'rgba(16,185,129,0.35)',  gradient: ['#0e2820', '#0f0f1a'] },
}

// ─── Canvas image generator ───────────────────────────────────────────────────
async function generateImage(session: ShareSessionData): Promise<Blob | null> {
  const cfg = TYPE_CONFIG[session.type]
  // Logical draw space stays 1080×1080; canvas renders at 720×720 (44% fewer pixels)
  const W = 1080
  const H = 1080
  const CANVAS_SIZE = 720

  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Scale everything down uniformly — all existing draw code unchanged
  ctx.scale(CANVAS_SIZE / W, CANVAS_SIZE / H)

  // ── Background gradient ────────────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, W, H)
  bgGrad.addColorStop(0, cfg.gradient[0])
  bgGrad.addColorStop(1, cfg.gradient[1])
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // Subtle radial glow in center-top
  const radial = ctx.createRadialGradient(W / 2, 200, 0, W / 2, 200, 600)
  radial.addColorStop(0, cfg.glow)
  radial.addColorStop(1, 'transparent')
  ctx.fillStyle = radial
  ctx.fillRect(0, 0, W, H)

  // ── Top accent bar ─────────────────────────────────────────────────────────
  ctx.fillStyle = cfg.color
  roundRect(ctx, 0, 0, W, 12, 0)
  ctx.fill()

  // ── Sport pill (top-right) ─────────────────────────────────────────────────
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
  const pillText = cfg.label.toUpperCase()
  const pillW = ctx.measureText(pillText).width + 48
  const pillX = W - pillW - 60
  const pillY = 60

  ctx.fillStyle = `${cfg.color}33`
  roundRect(ctx, pillX, pillY - 22, pillW, 44, 22)
  ctx.fill()

  ctx.strokeStyle = cfg.color
  ctx.lineWidth = 2
  roundRect(ctx, pillX, pillY - 22, pillW, 44, 22)
  ctx.stroke()

  ctx.fillStyle = cfg.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(pillText, pillX + pillW / 2, pillY)

  // ── Big emoji ──────────────────────────────────────────────────────────────
  ctx.font = '160px serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(cfg.emoji, 64, 96)

  // ── Title ──────────────────────────────────────────────────────────────────
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 72px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  // Word-wrap title if > 18 chars
  const titleLines = wrapText(ctx, session.title, W - 128, 72)
  let titleY = 280
  for (const line of titleLines.slice(0, 2)) {
    ctx.fillText(line, 64, titleY)
    titleY += 84
  }

  // ── Date ──────────────────────────────────────────────────────────────────
  const dateLabel = new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const dateLabelCap = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '36px system-ui, -apple-system, sans-serif'
  ctx.fillText(dateLabelCap, 64, titleY + 16)

  // ── Stats cards or exercise list ────────────────────────────────────────────
  if (session.type === 'muscu' && session.exercises && session.exercises.length > 0) {
    // ── Compact stats line ─────────────────────────────────────────────────
    const compactY = titleY + 80
    const compactParts = session.stats.filter(s => s.value !== '-').map(s => `${s.label} : ${s.value}`)
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = '34px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(compactParts.join('  ·  '), 64, compactY)

    // ── Exercise rows ──────────────────────────────────────────────────────
    const exercises = session.exercises.slice(0, 5)
    const rowH = 64
    const rowGap = 12
    const exStartY = compactY + 58

    exercises.forEach((ex, i) => {
      const ry = exStartY + i * (rowH + rowGap)
      const rx = 64
      const rw = W - 128

      // Row background
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      roundRect(ctx, rx, ry, rw, rowH, 14)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 1
      roundRect(ctx, rx, ry, rw, rowH, 14)
      ctx.stroke()

      // Accent left bar
      ctx.fillStyle = cfg.color
      roundRect(ctx, rx, ry, 5, rowH, 3)
      ctx.fill()

      // Exercise name
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      const maxNameW = rw - 260
      let name = ex.name
      while (ctx.measureText(name).width > maxNameW && name.length > 3) name = name.slice(0, -1)
      if (name !== ex.name) name += '…'
      ctx.fillText(name, rx + 24, ry + rowH / 2)

      // Top set (right)
      ctx.fillStyle = cfg.color
      ctx.font = 'bold 34px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(ex.topSet, rx + rw - 20, ry + rowH / 2)
    })

    if (session.exercises.length > 5) {
      const moreY = exStartY + 5 * (rowH + rowGap) + 10
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '28px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(`+ ${session.exercises.length - 5} exercice${session.exercises.length - 5 > 1 ? 's' : ''}`, W / 2, moreY)
    }
  } else {
    // ── Default stat cards ───────────────────────────────────────────────
    const stats = session.stats.slice(0, 6)
    const cols = Math.min(stats.length, 3)
    const cardW = (W - 128 - (cols - 1) * 24) / cols
    const cardH = 160
    const cardStartY = titleY + 100
    const cardStartX = 64

    stats.forEach((stat, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = cardStartX + col * (cardW + 24)
      const y = cardStartY + row * (cardH + 20)

      ctx.fillStyle = 'rgba(255,255,255,0.07)'
      roundRect(ctx, x, y, cardW, cardH, 20)
      ctx.fill()

      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.lineWidth = 1.5
      roundRect(ctx, x, y, cardW, cardH, 20)
      ctx.stroke()

      ctx.fillStyle = cfg.color
      ctx.font = `bold ${stat.value.length > 7 ? 44 : 52}px system-ui, -apple-system, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(stat.value, x + cardW / 2, y + cardH / 2 - 16)

      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '28px system-ui, -apple-system, sans-serif'
      ctx.fillText(stat.label.toUpperCase(), x + cardW / 2, y + cardH / 2 + 32)
    })
  }

  // ── Separator ─────────────────────────────────────────────────────────────
  const sepY = H - 160
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(64, sepY)
  ctx.lineTo(W - 64, sepY)
  ctx.stroke()

  // ── Branding ──────────────────────────────────────────────────────────────
  // Logo circle
  const logoR = 40
  const logoX = 64 + logoR
  const logoY = sepY + 80

  const logoGrad = ctx.createLinearGradient(logoX - logoR, logoY - logoR, logoX + logoR, logoY + logoR)
  logoGrad.addColorStop(0, '#3b82f6')
  logoGrad.addColorStop(1, '#8b5cf6')
  ctx.fillStyle = logoGrad
  ctx.beginPath()
  ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('SL', logoX, logoY)

  // App name
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 42px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('SPORTS.SL', logoX + logoR + 24, logoY)

  // Username (right)
  if (session.username) {
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = '34px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`@${session.username}`, W - 64, logoY)
  }

  return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/png', 0.85))
}

// ─── Canvas helpers ────────────────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number, fontSize: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ShareButton({ session }: { session: ShareSessionData }) {
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const blobRef = useRef<Blob | null>(null)
  const generatingRef = useRef(false)

  // Pre-generate image in background after first render
  useEffect(() => {
    if (generatingRef.current || blobRef.current) return
    generatingRef.current = true

    const run = async () => {
      const blob = await generateImage(session)
      if (blob) {
        blobRef.current = blob
        setImageUrl(URL.createObjectURL(blob))
      }
      generatingRef.current = false
    }

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => run(), { timeout: 2000 })
    } else {
      const t = setTimeout(run, 300)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function openModal() {
    setOpen(true)
    // If not ready yet, generate now (fallback)
    if (!imageUrl && !generatingRef.current) {
      setGenerating(true)
      const blob = await generateImage(session)
      if (blob) {
        blobRef.current = blob
        setImageUrl(URL.createObjectURL(blob))
      }
      setGenerating(false)
    }
  }

  function closeModal() {
    setOpen(false)
  }

  async function handleNativeShare() {
    const blob = blobRef.current
    if (!blob) return
    const file = new File([blob], 'seance-sports-sl.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: session.title })
        return
      } catch { /* annulé */ }
    }
    // Fallback: partage texte
    const text = [
      `${TYPE_CONFIG[session.type].emoji} ${session.title}`,
      new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      '',
      ...session.stats.map(s => `• ${s.label} : ${s.value}`),
      '',
      '🏆 SPORTS.SL',
    ].join('\n')
    try {
      await navigator.share({ title: session.title, text })
    } catch { /* annulé */ }
  }

  function handleDownload() {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `seance-${session.type}-${session.date}.png`
    a.click()
  }

  async function handleCopyText() {
    const text = [
      `${TYPE_CONFIG[session.type].emoji} ${session.title}`,
      new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      '',
      ...session.stats.map(s => `• ${s.label} : ${s.value}`),
      '',
      '🏆 SPORTS.SL',
    ].join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cfg = TYPE_CONFIG[session.type]

  return (
    <>
      <button
        onClick={openModal}
        className="btn btn-ghost btn-sm"
        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', padding: '0.35rem 0.6rem' }}
        title="Partager la séance"
      >
        <Share2 size={14} />
        <span style={{ fontSize: '0.8125rem' }}>Partager</span>
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
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
            {/* Drag handle */}
            <div style={{ padding: '0.875rem 1.25rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: '2.5rem', height: '4px', borderRadius: '2px', background: 'var(--border)', margin: '0 auto' }} />
            </div>
            <div style={{ padding: '0 1.25rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Partager la séance</span>
              <button onClick={closeModal} className="btn-icon" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            {/* Image preview */}
            <div style={{ padding: '0 1.25rem', marginBottom: '1.25rem' }}>
              <div style={{
                borderRadius: '1rem', overflow: 'hidden',
                border: `1px solid ${cfg.glow}`,
                background: cfg.gradient[0],
                minHeight: '220px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                {generating && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem' }}>
                    <div style={{ fontSize: '2.5rem' }}>{cfg.emoji}</div>
                    <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Génération de la carte…</span>
                  </div>
                )}
                {imageUrl && !generating && (
                  <img
                    src={imageUrl}
                    alt="Carte de séance"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {/* Native share (image) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  disabled={generating || !imageUrl}
                  className="btn btn-primary btn-full"
                  style={{ background: cfg.color, borderColor: cfg.color }}
                >
                  <Share2 size={16} />
                  Partager l&apos;image
                </button>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                {/* Download */}
                <button
                  onClick={handleDownload}
                  disabled={generating || !imageUrl}
                  className="btn btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Download size={15} />
                  Télécharger
                </button>

                {/* Copy text */}
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
