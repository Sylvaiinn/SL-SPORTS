'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { parseDuration, calculateAvgPace, estimateCalories, checkRecords } from '@/lib/runUtils'
import { RUN_TYPES, RUN_SURFACES, RUN_WEATHER, RUN_TYPE_COLORS, WEATHER_ICONS, SURFACE_ICONS } from '@/lib/constants'
import type { RunType, RunSurface, RunWeather } from '@/lib/constants'
import DifficultyPicker from './DifficultyPicker'
import PaceDisplay from './PaceDisplay'
import ShoeManager from './ShoeManager'
import { Save, Loader2, ChevronDown, Trophy } from 'lucide-react'

interface RunFormProps {
  onSaved?: () => void
}

export default function RunForm({ onSaved }: RunFormProps) {
  const supabase = createClient()

  // Essential
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [type, setType] = useState<RunType>('Endurance')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  // Pace
  const [minPace, setMinPace] = useState('')
  const [maxPace, setMaxPace] = useState('')

  // Cardio
  const [avgBpm, setAvgBpm] = useState('')
  const [maxBpm, setMaxBpm] = useState('')
  const [restingBpm, setRestingBpm] = useState('')

  // Parcours
  const [elevationPos, setElevationPos] = useState('')
  const [elevationNeg, setElevationNeg] = useState('')
  const [surface, setSurface] = useState<RunSurface | ''>('')
  const [weather, setWeather] = useState<RunWeather | ''>('')

  // Details
  const [steps, setSteps] = useState('')
  const [cadence, setCadence] = useState('')
  const [shoeId, setShoeId] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<number | null>(null)

  // Notes
  const [goal, setGoal] = useState('')
  const [notes, setNotes] = useState('')

  // Competition
  const [isCompetition, setIsCompetition] = useState(false)
  const [compResult, setCompResult] = useState('')
  const [compRanking, setCompRanking] = useState('')
  const [compBib, setCompBib] = useState('')

  // Collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ essential: true })

  // State
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [userWeight, setUserWeight] = useState<number | null>(null)
  const [newRecords, setNewRecords] = useState<string[]>([])

  useEffect(() => {
    async function loadWeight() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('weight_kg').eq('id', user.id).single()
      if (data && (data as { weight_kg: number | null }).weight_kg) {
        setUserWeight((data as { weight_kg: number | null }).weight_kg)
      }
    }
    loadWeight()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleSection(key: string) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Auto-calculations
  const distanceKm = parseFloat(distance) || 0
  const durationSec = parseDuration(duration)
  const avgPaceSec = useMemo(() => calculateAvgPace(durationSec, distanceKm), [durationSec, distanceKm])
  const autoCalories = useMemo(() => userWeight ? estimateCalories(distanceKm, userWeight) : 0, [distanceKm, userWeight])

  async function handleSave() {
    if (!distance || distanceKm <= 0) { setError('Entrez une distance valide'); return }
    if (!duration || durationSec <= 0) { setError('Entrez une durée valide (mm:ss ou hh:mm:ss)'); return }
    setError('')
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')

      const sessionData = {
        user_id: user.id,
        date,
        distance_km: distanceKm,
        duration_seconds: durationSec,
        min_pace_sec: minPace ? parseDuration(minPace) : null,
        max_pace_sec: maxPace ? parseDuration(maxPace) : null,
        avg_bpm: avgBpm ? parseInt(avgBpm) : null,
        max_bpm: maxBpm ? parseInt(maxBpm) : null,
        resting_bpm: restingBpm ? parseInt(restingBpm) : null,
        elevation_pos: elevationPos ? parseInt(elevationPos) : null,
        elevation_neg: elevationNeg ? parseInt(elevationNeg) : null,
        calories: autoCalories || null,
        steps: steps ? parseInt(steps) : null,
        avg_cadence: cadence ? parseInt(cadence) : null,
        type,
        surface: surface || null,
        weather: weather || null,
        shoe_id: shoeId,
        difficulty,
        goal: goal.trim() || null,
        notes: notes.trim() || null,
        is_competition: isCompetition,
        competition_result: isCompetition ? compResult.trim() || null : null,
        competition_ranking: isCompetition ? compRanking.trim() || null : null,
        competition_bib: isCompetition ? compBib.trim() || null : null,
      }

      const { data: session, error: sErr } = await supabase
        .from('run_sessions')
        .insert(sessionData as never)
        .select()
        .single()
      if (sErr) throw sErr

      // Update shoe km
      if (shoeId && distanceKm > 0) {
        const { data: shoe } = await supabase.from('running_shoes').select('total_km').eq('id', shoeId).single()
        if (shoe) {
          await supabase.from('running_shoes').update({
            total_km: ((shoe as { total_km: number }).total_km || 0) + distanceKm,
          } as never).eq('id', shoeId)
        }
      }

      // Check records
      const { data: existingRecords } = await supabase
        .from('run_records')
        .select('distance_label, distance_km, best_pace_sec')
        .eq('user_id', user.id)
      const records = checkRecords(
        { distance_km: distanceKm, duration_seconds: durationSec, date, weather: weather || null },
        (existingRecords ?? []) as { distance_label: string; distance_km: number; best_pace_sec: number }[]
      )
      if (records.length > 0) {
        for (const rec of records) {
          await supabase.from('run_records').upsert({
            user_id: user.id,
            distance_label: rec.distance_label,
            distance_km: rec.distance_km,
            best_pace_sec: rec.best_pace_sec,
            best_session_id: (session as { id: string }).id,
            date: rec.date,
            conditions: rec.conditions || null,
          } as never, { onConflict: 'user_id,distance_label' })
        }
        setNewRecords(records.map(r => r.distance_label))
      }

      if (onSaved) onSaved()
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  function SectionHeader({ id, title, subtitle }: { id: string; title: string; subtitle?: string }) {
    return (
      <div className="collapsible-header" onClick={() => toggleSection(id)}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</div>}
        </div>
        <ChevronDown size={16} color="var(--text-muted)" className={`chevron ${openSections[id] ? 'open' : ''}`} />
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* New records celebration */}
      {newRecords.length > 0 && (
        <div style={{
          padding: '1rem', borderRadius: '0.875rem', marginBottom: '1.25rem',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(16,185,129,0.1))',
          border: '1px solid rgba(245,158,11,0.4)', textAlign: 'center',
        }}>
          <Trophy size={24} color="#fbbf24" style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontWeight: 800, color: '#fbbf24', marginBottom: '0.25rem' }}>Nouveau record !</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {newRecords.join(', ')}
          </div>
        </div>
      )}

      {/* Essential */}
      <div className="card" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader id="essential" title="Essentiel" />
        {openSections.essential !== false && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">Distance (km)</label>
                <input className="input" type="number" min="0" step="0.01" placeholder="10.5" value={distance} onChange={e => setDistance(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Durée (hh:mm:ss)</label>
                <input className="input" type="text" placeholder="01:05:30" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '0.75rem' }}>
              <label className="input-label">Date</label>
              <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            {/* Auto-calculated pace */}
            {avgPaceSec > 0 && <PaceDisplay paceSeconds={avgPaceSec} />}

            {/* Type */}
            <div style={{ marginTop: '0.75rem' }}>
              <label className="input-label">Type de séance</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.375rem' }}>
                {RUN_TYPES.map(t => {
                  const selected = type === t
                  const c = RUN_TYPE_COLORS[t]
                  return (
                    <button key={t} type="button" onClick={() => setType(t)} style={{
                      padding: '0.5rem', borderRadius: '0.625rem', border: `1px solid ${selected ? c.color : 'var(--border)'}`,
                      background: selected ? c.bg : 'var(--bg-secondary)', cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: '0.8125rem', fontWeight: selected ? 700 : 500, color: selected ? c.color : 'var(--text-secondary)',
                      transition: 'all 0.2s',
                    }}>{t}</button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Allure */}
      <div className="card" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader id="pace" title="Allure" subtitle="Min & max optionnels" />
        {openSections.pace && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="input-group">
              <label className="input-label">Allure min (mm:ss)</label>
              <input className="input" type="text" placeholder="4:30" value={minPace} onChange={e => setMinPace(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Allure max (mm:ss)</label>
              <input className="input" type="text" placeholder="6:00" value={maxPace} onChange={e => setMaxPace(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Cardio */}
      <div className="card" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader id="cardio" title="Cardio" subtitle="BPM (optionnel)" />
        {openSections.cardio && (
          <div className="grid-2-3" style={{ gap: '0.75rem' }}>
            <div className="input-group">
              <label className="input-label">BPM moy.</label>
              <input className="input" type="number" placeholder="145" value={avgBpm} onChange={e => setAvgBpm(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">BPM max</label>
              <input className="input" type="number" placeholder="175" value={maxBpm} onChange={e => setMaxBpm(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">BPM repos</label>
              <input className="input" type="number" placeholder="60" value={restingBpm} onChange={e => setRestingBpm(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Parcours */}
      <div className="card" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader id="parcours" title="Parcours" subtitle="Dénivelé, surface, météo" />
        {openSections.parcours && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">D+ (m)</label>
                <input className="input" type="number" min="0" placeholder="150" value={elevationPos} onChange={e => setElevationPos(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">D- (m)</label>
                <input className="input" type="number" min="0" placeholder="140" value={elevationNeg} onChange={e => setElevationNeg(e.target.value)} />
              </div>
            </div>

            <label className="input-label">Surface</label>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {RUN_SURFACES.map(s => (
                <button key={s} type="button" onClick={() => setSurface(surface === s ? '' : s)} style={{
                  padding: '0.375rem 0.75rem', borderRadius: '0.625rem',
                  border: `1px solid ${surface === s ? 'var(--accent-green)' : 'var(--border)'}`,
                  background: surface === s ? 'var(--accent-green-glow)' : 'var(--bg-secondary)',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8125rem',
                  color: surface === s ? '#34d399' : 'var(--text-secondary)', transition: 'all 0.2s',
                }}>{SURFACE_ICONS[s]} {s}</button>
              ))}
            </div>

            <label className="input-label">Météo</label>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {RUN_WEATHER.map(w => (
                <button key={w} type="button" onClick={() => setWeather(weather === w ? '' : w)} style={{
                  padding: '0.375rem 0.75rem', borderRadius: '0.625rem',
                  border: `1px solid ${weather === w ? 'var(--accent-amber)' : 'var(--border)'}`,
                  background: weather === w ? 'rgba(245,158,11,0.1)' : 'var(--bg-secondary)',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8125rem',
                  color: weather === w ? '#fbbf24' : 'var(--text-secondary)', transition: 'all 0.2s',
                }}>{WEATHER_ICONS[w]} {w}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="card" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader id="details" title="Détails" subtitle="Pas, cadence, chaussures, difficulté" />
        {openSections.details && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">Nombre de pas</label>
                <input className="input" type="number" min="0" placeholder="8500" value={steps} onChange={e => setSteps(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Cadence (pas/min)</label>
                <input className="input" type="number" min="0" placeholder="175" value={cadence} onChange={e => setCadence(e.target.value)} />
              </div>
            </div>

            {autoCalories > 0 && (
              <div style={{
                padding: '0.5rem 0.75rem', borderRadius: '0.625rem', marginBottom: '0.75rem',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                fontSize: '0.8125rem', color: '#fbbf24',
              }}>
                🔥 ~{autoCalories} kcal estimées
              </div>
            )}

            <div className="input-group" style={{ marginBottom: '0.75rem' }}>
              <label className="input-label">Chaussures</label>
              <ShoeManager selectedId={shoeId} onSelect={setShoeId} />
            </div>

            <div className="input-group">
              <label className="input-label">Difficulté ressentie</label>
              <DifficultyPicker value={difficulty} onChange={setDifficulty} />
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="card" style={{ marginBottom: '0.75rem' }}>
        <SectionHeader id="notes" title="Objectif & Notes" />
        {openSections.notes && (
          <div>
            <div className="input-group" style={{ marginBottom: '0.75rem' }}>
              <label className="input-label">Objectif de la séance</label>
              <input className="input" type="text" placeholder="Ex: Sortie longue, préparer le semi..." value={goal} onChange={e => setGoal(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Notes / ressenti</label>
              <textarea className="input" rows={3} placeholder="Comment ça s'est passé ?" value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          </div>
        )}
      </div>

      {/* Competition */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>🏅 Compétition</div>
          <button type="button" onClick={() => setIsCompetition(!isCompetition)} style={{
            width: '3rem', height: '1.5rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
            background: isCompetition ? 'var(--accent-green)' : 'var(--border)', transition: 'all 0.2s',
            position: 'relative',
          }}>
            <div style={{
              width: '1.125rem', height: '1.125rem', borderRadius: '50%', background: 'white',
              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
              left: isCompetition ? 'calc(100% - 1.3125rem)' : '0.1875rem', transition: 'left 0.2s',
            }} />
          </button>
        </div>
        {isCompetition && (
          <div className="grid-2-3" style={{ gap: '0.75rem', marginTop: '0.5rem' }}>
            <div className="input-group">
              <label className="input-label">Résultat</label>
              <input className="input" type="text" placeholder="1:45:30" value={compResult} onChange={e => setCompResult(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Classement</label>
              <input className="input" type="text" placeholder="42/300" value={compRanking} onChange={e => setCompRanking(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Dossard</label>
              <input className="input" type="text" placeholder="1234" value={compBib} onChange={e => setCompBib(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: '0.75rem', borderRadius: '0.625rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <button onClick={handleSave} disabled={saving} className="btn btn-green btn-lg btn-full">
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {saving ? 'Sauvegarde...' : 'Sauvegarder la séance'}
      </button>
    </div>
  )
}
