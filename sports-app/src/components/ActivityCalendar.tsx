'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

// Sport dot config
const SPORTS = [
  { key: 'muscu',    color: '#7C3AED', label: 'Muscu'    },
  { key: 'natation', color: '#3B82F6', label: 'Natation' },
  { key: 'course',   color: '#10B981', label: 'Course'   },
] as const

type SportKey = (typeof SPORTS)[number]['key']

interface DayData {
  muscu: boolean
  natation: boolean
  course: boolean
}

function toYMD(d: Date): string {
  return d.toISOString().split('T')[0]
}

function getMonthBounds(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return { start: toYMD(start), end: toYMD(end) }
}

// Returns Monday-aligned calendar cells (null = padding)
function buildCalendarCells(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1 // Monday=0
  const cells: (number | null)[] = Array(startOffset).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  // Pad to full week rows
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function ActivityCalendar() {
  const supabase = createClient()
  const today = new Date()

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [data, setData] = useState<Record<string, DayData>>({})
  const [loading, setLoading] = useState(true)

  const fetchMonth = useCallback(async (y: number, m: number) => {
    setLoading(true)
    const { start, end } = getMonthBounds(y, m)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [
      { data: workouts },
      { data: swims },
      { data: runs },
    ] = await Promise.all([
      supabase.from('workouts').select('date').eq('user_id', user.id).gte('date', start).lte('date', end),
      supabase.from('swim_sessions').select('date').eq('user_id', user.id).gte('date', start).lte('date', end),
      supabase.from('run_sessions').select('date').eq('user_id', user.id).gte('date', start).lte('date', end),
    ])

    const map: Record<string, DayData> = {}
    const ensure = (d: string) => { if (!map[d]) map[d] = { muscu: false, natation: false, course: false } }

    for (const w of workouts ?? []) { ensure(w.date); map[w.date].muscu = true }
    for (const s of swims ?? [])    { ensure(s.date); map[s.date].natation = true }
    for (const r of runs ?? [])     { ensure(r.date); map[r.date].course = true }

    setData(map)
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchMonth(year, month) }, [year, month, fetchMonth])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
    if (isCurrentMonth) return
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const cells = buildCalendarCells(year, month)
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
  const todayDay = today.getDate()
  const monthLabel = new Date(year, month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Header: nav + month label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Activité
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={prevMonth} className="btn-icon" style={{ width: '1.75rem', height: '1.75rem', background: 'var(--bg-secondary)' }}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', minWidth: '7rem', textAlign: 'center', textTransform: 'capitalize' }}>
            {monthLabel}
          </span>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="btn-icon"
            style={{ width: '1.75rem', height: '1.75rem', background: 'var(--bg-secondary)', opacity: isCurrentMonth ? 0.3 : 1 }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.25rem' }}>
        {DAYS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.25rem 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
          {Array(35).fill(null).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: '0.5rem', opacity: 0.3 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
          {cells.map((day, i) => {
            if (day === null) return <div key={`pad-${i}`} />

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayData = data[dateStr]
            const hasActivity = !!dayData
            const isToday = isCurrentMonth && day === todayDay
            const activeSports = hasActivity
              ? SPORTS.filter(s => dayData[s.key as SportKey])
              : []

            return (
              <div
                key={dateStr}
                style={{
                  aspectRatio: '1',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.125rem',
                  position: 'relative',
                  border: isToday
                    ? '1.5px solid var(--accent-blue)'
                    : hasActivity
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid transparent',
                  background: hasActivity
                    ? 'var(--bg-secondary)'
                    : 'transparent',
                  transition: 'background 0.15s',
                }}
                title={hasActivity ? activeSports.map(s => s.label).join(' + ') : ''}
              >
                {/* Day number */}
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: isToday ? 800 : hasActivity ? 600 : 400,
                  color: isToday ? 'var(--accent-blue)' : hasActivity ? 'var(--text-primary)' : 'var(--text-muted)',
                  lineHeight: 1,
                }}>
                  {day}
                </span>

                {/* Sport dots */}
                {activeSports.length > 0 && (
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {activeSports.map(s => (
                      <div
                        key={s.key}
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: s.color,
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '0.875rem' }}>
        {SPORTS.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
