'use client'

interface ActivityHeatmapProps {
  activeDates: string[]  // array of 'YYYY-MM-DD' strings
}

function getLevel(count: number): number {
  if (count === 0) return 0
  if (count === 1) return 2
  if (count === 2) return 3
  return 4
}

export default function ActivityHeatmap({ activeDates }: ActivityHeatmapProps) {
  // Build the last 30 days
  const cells: { dateStr: string; label: string; count: number }[] = []
  const now = new Date()

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const count = activeDates.filter(dt => dt === dateStr).length
    cells.push({
      dateStr,
      label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      count,
    })
  }

  return (
    <div>
      <div className="heatmap-grid">
        {cells.map(({ dateStr, label, count }) => (
          <div
            key={dateStr}
            className={`heatmap-cell heatmap-${getLevel(count)}`}
            title={`${label} : ${count} séance${count !== 1 ? 's' : ''}`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {cells[0].label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {[0, 1, 2, 3, 4].map(l => (
            <div key={l} className={`heatmap-cell heatmap-${l}`} style={{ width: '10px', height: '10px' }} />
          ))}
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>Actif</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Aujourd&apos;hui
        </span>
      </div>
    </div>
  )
}
