'use client'

import { useState } from 'react'
import { MUSCLE_COLORS } from '@/lib/muscuConstants'

interface MuscleMapProps {
  data: Record<string, number>
  onSelect?: (muscle: string) => void
}

interface MuscleZone {
  name: string
  view: 'front' | 'back'
  shape: 'ellipse' | 'rect'
  x: number
  y: number
  w: number
  h: number
  rx?: number
}

// Zones positioned on a ~120x260 body outline per view
const MUSCLE_ZONES: MuscleZone[] = [
  // Front view
  { name: 'Pectoraux', view: 'front', shape: 'ellipse', x: 60, y: 78, w: 52, h: 24 },
  { name: 'Épaules', view: 'front', shape: 'ellipse', x: 25, y: 62, w: 16, h: 14 },
  { name: 'Épaules', view: 'front', shape: 'ellipse', x: 95, y: 62, w: 16, h: 14 },
  { name: 'Biceps', view: 'front', shape: 'ellipse', x: 18, y: 100, w: 12, h: 26 },
  { name: 'Biceps', view: 'front', shape: 'ellipse', x: 102, y: 100, w: 12, h: 26 },
  { name: 'Abdominaux', view: 'front', shape: 'rect', x: 44, y: 106, w: 32, h: 38, rx: 6 },
  { name: 'Quadriceps', view: 'front', shape: 'ellipse', x: 42, y: 178, w: 16, h: 40 },
  { name: 'Quadriceps', view: 'front', shape: 'ellipse', x: 78, y: 178, w: 16, h: 40 },

  // Back view
  { name: 'Dos', view: 'back', shape: 'ellipse', x: 60, y: 82, w: 40, h: 32 },
  { name: 'Triceps', view: 'back', shape: 'ellipse', x: 18, y: 100, w: 12, h: 26 },
  { name: 'Triceps', view: 'back', shape: 'ellipse', x: 102, y: 100, w: 12, h: 26 },
  { name: 'Fessiers', view: 'back', shape: 'ellipse', x: 60, y: 148, w: 38, h: 22 },
  { name: 'Ischio-jambiers', view: 'back', shape: 'ellipse', x: 42, y: 190, w: 14, h: 36 },
  { name: 'Ischio-jambiers', view: 'back', shape: 'ellipse', x: 78, y: 190, w: 14, h: 36 },
  { name: 'Mollets', view: 'back', shape: 'ellipse', x: 42, y: 234, w: 10, h: 22 },
  { name: 'Mollets', view: 'back', shape: 'ellipse', x: 78, y: 234, w: 10, h: 22 },
]

function getOpacity(intensity: number): number {
  if (intensity <= 0) return 0
  if (intensity <= 0.33) return 0.3
  if (intensity <= 0.66) return 0.6
  return 1
}

function BodyOutline() {
  return (
    <g opacity={0.15} stroke="var(--text-muted)" strokeWidth={1.5} fill="none">
      {/* Head */}
      <ellipse cx={60} cy={24} rx={16} ry={18} />
      {/* Neck */}
      <rect x={53} y={40} width={14} height={12} rx={4} />
      {/* Torso */}
      <path d="M30,55 Q28,52 25,54 L14,80 L14,130 Q14,145 30,148 L38,150 Q44,152 44,158 L44,148 L28,145 Q18,142 18,130 L18,80 Z" />
      <path d="M90,55 Q92,52 95,54 L106,80 L106,130 Q106,145 90,148 L82,150 Q76,152 76,158 L76,148 L92,145 Q102,142 102,130 L102,80 Z" />
      {/* Torso center */}
      <path d="M30,55 L90,55 Q95,55 95,58 L95,140 Q95,148 88,150 L76,155 L76,158 L44,158 L44,155 L32,150 Q25,148 25,140 L25,58 Q25,55 30,55 Z" />
      {/* Arms */}
      <path d="M14,80 Q6,110 10,140 Q12,148 16,148 Q20,148 20,140 Q18,110 24,82" />
      <path d="M106,80 Q114,110 110,140 Q108,148 104,148 Q100,148 100,140 Q102,110 96,82" />
      {/* Legs */}
      <path d="M44,158 L36,220 Q34,245 36,260 L50,260 Q50,245 48,220 L54,158" />
      <path d="M76,158 L84,220 Q86,245 84,260 L70,260 Q70,245 72,220 L66,158" />
    </g>
  )
}

export default function MuscleMap({ data, onSelect }: MuscleMapProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  function renderZone(zone: MuscleZone, index: number) {
    const intensity = data[zone.name] ?? 0
    const opacity = getOpacity(intensity)
    const baseColor = MUSCLE_COLORS[zone.name] ?? '#ffffff'
    const fillColor = intensity <= 0 ? 'rgba(255,255,255,0.05)' : baseColor
    const isHovered = hovered === `${zone.view}-${zone.name}-${index}`
    const hoverKey = `${zone.view}-${zone.name}-${index}`

    const commonProps = {
      style: {
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        filter: isHovered ? 'brightness(1.3)' : 'none',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        transformOrigin: `${zone.x}px ${zone.y}px`,
      } as React.CSSProperties,
      fill: fillColor,
      fillOpacity: intensity <= 0 ? 1 : opacity,
      stroke: intensity > 0 ? baseColor : 'rgba(255,255,255,0.1)',
      strokeWidth: intensity > 0 ? 1.5 : 0.5,
      onMouseEnter: () => setHovered(hoverKey),
      onMouseLeave: () => setHovered(null),
      onClick: () => onSelect?.(zone.name),
    }

    if (zone.shape === 'ellipse') {
      return (
        <ellipse
          key={`${zone.view}-${zone.name}-${index}`}
          cx={zone.x}
          cy={zone.y}
          rx={zone.w / 2}
          ry={zone.h / 2}
          {...commonProps}
        />
      )
    }

    return (
      <rect
        key={`${zone.view}-${zone.name}-${index}`}
        x={zone.x - zone.w / 2}
        y={zone.y - zone.h / 2}
        width={zone.w}
        height={zone.h}
        rx={zone.rx ?? 4}
        {...commonProps}
      />
    )
  }

  const frontZones = MUSCLE_ZONES.filter(z => z.view === 'front')
  const backZones = MUSCLE_ZONES.filter(z => z.view === 'back')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          width: '100%',
          maxWidth: 400,
        }}
      >
        {/* Front view */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg viewBox="0 0 120 270" width="100%" style={{ maxWidth: 150, overflow: 'visible' }}>
            <BodyOutline />
            {frontZones.map((zone, i) => renderZone(zone, i))}
          </svg>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginTop: '0.25rem',
            }}
          >
            Vue avant
          </span>
        </div>

        {/* Back view */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg viewBox="0 0 120 270" width="100%" style={{ maxWidth: 150, overflow: 'visible' }}>
            <BodyOutline />
            {backZones.map((zone, i) => renderZone(zone, i))}
          </svg>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginTop: '0.25rem',
            }}
          >
            Vue arrière
          </span>
        </div>
      </div>

      {/* Hovered muscle name tooltip */}
      {hovered && (
        <div
          className="badge badge-blue fade-in"
          style={{ fontSize: '0.8125rem', padding: '0.25rem 0.75rem' }}
        >
          {hovered.split('-').slice(1, -1).join('-')}
        </div>
      )}
    </div>
  )
}
