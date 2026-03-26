'use client'

import { useState } from 'react'
import { formatPace, formatDuration } from '@/lib/runUtils'
import { RUN_TYPE_COLORS, WEATHER_ICONS, SURFACE_ICONS, DIFFICULTY_LABELS } from '@/lib/constants'
import type { RunType, RunWeather, RunSurface } from '@/lib/constants'
import { ChevronDown, Heart, Mountain, Footprints, Copy, Trash2, Loader2 } from 'lucide-react'
import ShareButton from '@/components/ShareButton'

export interface RunSessionRow {
  id: string
  date: string
  distance_km: number
  duration_seconds: number
  min_pace_sec: number | null
  max_pace_sec: number | null
  avg_bpm: number | null
  max_bpm: number | null
  resting_bpm: number | null
  elevation_pos: number | null
  elevation_neg: number | null
  calories: number | null
  steps: number | null
  avg_cadence: number | null
  type: string
  surface: string | null
  weather: string | null
  difficulty: number | null
  goal: string | null
  notes: string | null
  is_competition: boolean
  competition_result: string | null
  competition_ranking: string | null
  competition_bib: string | null
}

interface RunSessionCardProps {
  session: RunSessionRow
  onDuplicate?: () => void
  onDelete?: () => void
  deleting?: boolean
}

export default function RunSessionCard({ session, onDuplicate, onDelete, deleting }: RunSessionCardProps) {
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const s = session
  const avgPace = s.distance_km > 0 ? Math.round(s.duration_seconds / s.distance_km) : 0
  const typeColors = RUN_TYPE_COLORS[s.type as RunType] || RUN_TYPE_COLORS.Endurance

  return (
    <div className="card" style={{ padding: '0.875rem 1rem', cursor: 'pointer' }} onClick={() => setOpen(v => !v)}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              {s.distance_km.toFixed(2)} km
            </span>
            <span className={`badge ${typeColors.badge}`} style={{ fontSize: '0.7rem' }}>{s.type}</span>
            {s.is_competition && <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>🏅 Compétition</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDuration(s.duration_seconds)}</span>
            {avgPace > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399' }}>{formatPace(avgPace)}</span>}
            {s.avg_bpm && <span style={{ fontSize: '0.7rem', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.15rem' }}><Heart size={10} />{s.avg_bpm}</span>}
            {s.difficulty && (
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)' }}>
                {'●'.repeat(s.difficulty)}{'○'.repeat(5 - s.difficulty)}
              </span>
            )}
          </div>
        </div>
        <ChevronDown size={16} color="var(--text-muted)" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
      </div>

      {open && (
        <div style={{ marginTop: '0.875rem', borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }} onClick={e => e.stopPropagation()}>
          {/* Detail grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {[
              { label: 'Allure moy.', value: avgPace > 0 ? formatPace(avgPace) : '-' },
              { label: 'Allure min', value: s.min_pace_sec ? formatPace(s.min_pace_sec) : '-' },
              { label: 'Allure max', value: s.max_pace_sec ? formatPace(s.max_pace_sec) : '-' },
              { label: 'BPM moy.', value: s.avg_bpm ? `${s.avg_bpm}` : '-' },
              { label: 'BPM max', value: s.max_bpm ? `${s.max_bpm}` : '-' },
              { label: 'Calories', value: s.calories ? `${s.calories} kcal` : '-' },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>{label}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {s.elevation_pos != null && <span className="badge badge-green"><Mountain size={10} /> D+ {s.elevation_pos}m</span>}
            {s.elevation_neg != null && <span className="badge badge-green"><Mountain size={10} /> D- {s.elevation_neg}m</span>}
            {s.surface && <span className="badge badge-gray">{SURFACE_ICONS[s.surface as RunSurface]} {s.surface}</span>}
            {s.weather && <span className="badge badge-gray">{WEATHER_ICONS[s.weather as RunWeather]} {s.weather}</span>}
            {s.steps && <span className="badge badge-gray"><Footprints size={10} /> {s.steps.toLocaleString()} pas</span>}
            {s.avg_cadence && <span className="badge badge-gray">{s.avg_cadence} pas/min</span>}
            {s.difficulty && <span className="badge badge-green">{DIFFICULTY_LABELS[s.difficulty]}</span>}
          </div>

          {/* Competition */}
          {s.is_competition && (
            <div style={{ padding: '0.625rem', borderRadius: '0.625rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.25rem' }}>🏅 Compétition</div>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {s.competition_result && <span>Résultat: <b>{s.competition_result}</b></span>}
                {s.competition_ranking && <span>Classement: <b>{s.competition_ranking}</b></span>}
                {s.competition_bib && <span>Dossard: <b>{s.competition_bib}</b></span>}
              </div>
            </div>
          )}

          {/* Goal & Notes */}
          {s.goal && (
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Objectif:</span> {s.goal}
            </div>
          )}
          {s.notes && (
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
              {s.notes}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <ShareButton session={{
              type: 'run',
              title: `${s.type} — ${s.distance_km.toFixed(2)} km`,
              date: s.date,
              stats: [
                { label: 'Distance', value: `${s.distance_km.toFixed(2)} km` },
                { label: 'Durée', value: formatDuration(s.duration_seconds) },
                { label: 'Allure', value: avgPace > 0 ? formatPace(avgPace) : '-' },
                { label: 'BPM moy.', value: s.avg_bpm ? `${s.avg_bpm}` : '-' },
                { label: 'Calories', value: s.calories ? `${s.calories} kcal` : '-' },
                { label: 'D+', value: s.elevation_pos ? `${s.elevation_pos}m` : '-' },
              ]
            }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {onDuplicate && (
                <button onClick={onDuplicate} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                  <Copy size={14} /> Dupliquer
                </button>
              )}
              {onDelete && (
                confirmDelete ? (
                  <div style={{ display: 'flex', gap: '0.375rem', flex: 1 }}>
                    <button onClick={onDelete} disabled={deleting} className="btn btn-danger btn-sm" style={{ flex: 1 }}>
                      {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      Confirmer
                    </button>
                    <button onClick={() => setConfirmDelete(false)} className="btn btn-ghost btn-sm">Annuler</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(true)} className="btn btn-danger btn-sm" style={{ flex: 1 }}>
                    <Trash2 size={14} /> Supprimer
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
