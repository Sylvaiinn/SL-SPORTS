'use client'

interface LineChartProps {
  data: { label: string; value: number }[]
  color?: string
  height?: number
  formatValue?: (v: number) => string
  unit?: string
}

export default function LineChart({ data, color = 'var(--accent-green)', height = 160, formatValue, unit = '' }: LineChartProps) {
  if (data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aucune donnée</span>
      </div>
    )
  }

  const padding = { top: 20, right: 10, bottom: 30, left: 10 }
  const width = 500
  const chartHeight = height - padding.top - padding.bottom
  const chartWidth = width - padding.left - padding.right

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth
    const y = padding.top + chartHeight - ((d.value - min) / range) * chartHeight
    return { x, y, ...d }
  })

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

  const gradientId = `lineGrad-${color.replace(/[^a-zA-Z0-9]/g, '')}`
  const areaPath = `M${points[0].x},${padding.top + chartHeight} ${points.map(p => `L${p.x},${p.y}`).join(' ')} L${points[points.length - 1].x},${padding.top + chartHeight} Z`

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = padding.top + chartHeight * (1 - pct)
        return <line key={pct} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--border)" strokeWidth="0.5" />
      })}
      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradientId})`} />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="var(--bg-card)" strokeWidth="1.5" />
      ))}
      {/* Labels */}
      {points.filter((_, i) => i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)).map((p, i) => (
        <text key={i} x={p.x} y={height - 5} textAnchor="middle"
          style={{ fill: 'var(--text-muted)', fontSize: '10px' }}>
          {p.label}
        </text>
      ))}
      {/* Min/Max labels */}
      <text x={width - padding.right} y={padding.top - 5} textAnchor="end"
        style={{ fill: 'var(--text-secondary)', fontSize: '10px' }}>
        {formatValue ? formatValue(max) : `${max}${unit}`}
      </text>
      <text x={width - padding.right} y={padding.top + chartHeight + 12} textAnchor="end"
        style={{ fill: 'var(--text-muted)', fontSize: '10px' }}>
        {formatValue ? formatValue(min) : `${min}${unit}`}
      </text>
    </svg>
  )
}
