'use client'

interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  barColor?: string
  unit?: string
  formatValue?: (v: number) => string
}

export default function BarChart({ data, height = 160, barColor = 'var(--accent-green)', unit = '', formatValue }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aucune donnée</span>
      </div>
    )
  }

  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height, padding: '0 0.25rem' }}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
              {d.value > 0 && (
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {formatValue ? formatValue(d.value) : `${d.value}${unit}`}
                </span>
              )}
              <div style={{
                width: '100%',
                maxWidth: '2.5rem',
                height: `${Math.max(pct, 2)}%`,
                background: d.color || barColor,
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.4s ease',
                minHeight: d.value > 0 ? '4px' : '0',
                opacity: d.value > 0 ? 1 : 0.2,
              }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '3px', marginTop: '0.375rem', padding: '0 0.25rem' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}
