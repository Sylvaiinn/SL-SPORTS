// src/lib/runUtils.ts

import { RECORD_DISTANCES } from './constants'

/** Format seconds/km to "mm:ss /km" */
export function formatPace(secondsPerKm: number): string {
  if (!secondsPerKm || secondsPerKm <= 0) return '--:--'
  const min = Math.floor(secondsPerKm / 60)
  const sec = Math.round(secondsPerKm % 60)
  return `${min}:${sec.toString().padStart(2, '0')} /km`
}

/** Format total seconds to "hh:mm:ss" */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

/** Parse "hh:mm:ss" or "mm:ss" to total seconds */
export function parseDuration(input: string): number {
  const parts = input.split(':').map(Number)
  if (parts.some(isNaN)) return 0
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return 0
}

/** Calculate average pace in seconds/km */
export function calculateAvgPace(durationSeconds: number, distanceKm: number): number {
  if (!distanceKm || distanceKm <= 0) return 0
  return Math.round(durationSeconds / distanceKm)
}

/** Estimate calories burned (running formula: ~1.036 × weight × distance) */
export function estimateCalories(distanceKm: number, weightKg: number): number {
  if (!distanceKm || !weightKg) return 0
  return Math.round(1.036 * weightKg * distanceKm)
}

/** Format pace seconds to compact "mm:ss" (no /km suffix) */
export function formatPaceShort(secondsPerKm: number): string {
  if (!secondsPerKm || secondsPerKm <= 0) return '--:--'
  const min = Math.floor(secondsPerKm / 60)
  const sec = Math.round(secondsPerKm % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export interface RecordUpdate {
  distance_label: string
  distance_km: number
  best_pace_sec: number
  date: string
  conditions?: string
}

/** Check if a session sets new records for any standard distance */
export function checkRecords(
  session: { distance_km: number; duration_seconds: number; date: string; weather?: string | null },
  existingRecords: { distance_label: string; distance_km: number; best_pace_sec: number }[]
): RecordUpdate[] {
  const updates: RecordUpdate[] = []
  const avgPace = calculateAvgPace(session.duration_seconds, session.distance_km)
  if (avgPace <= 0) return updates

  for (const rd of RECORD_DISTANCES) {
    if (session.distance_km >= rd.km) {
      const existing = existingRecords.find(r => r.distance_label === rd.label)
      if (!existing || avgPace < existing.best_pace_sec) {
        updates.push({
          distance_label: rd.label,
          distance_km: rd.km,
          best_pace_sec: avgPace,
          date: session.date,
          conditions: session.weather || undefined,
        })
      }
    }
  }

  return updates
}
