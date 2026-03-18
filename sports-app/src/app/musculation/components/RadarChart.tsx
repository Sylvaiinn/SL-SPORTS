'use client'

interface RadarDataPoint {
  label: string
  value: number
}

interface RadarChartProps {
  data: RadarDataPoint[]
  size?: number
  color?: string
}

export default function RadarChart({ data, size = 300, color }: RadarChartProps) {
  const fillColor = color ?? 'var(--accent-blue)'
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.35
  const labelOffset = radius + 28

  // If all values are 0 or no data
  if (!data.length || data.every(d => d.value === 0)) {
    return (
      <div style={{ width: '100%', maxWidth: 320, margin: '0 auto', textAlign: 'center' }}>
        <div
          className="card"
          style={{
            padding: '2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pas de données</span>
        </div>
      </div>
    )
  }

  const n = data.length
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const angleStep = (2 * Math.PI) / n
  // Start from top (-PI/2)
  const startAngle = -Math.PI / 2

  function polarToXY(angle: number, r: number): [number, number] {
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  }

  // Grid levels: 20%, 40%, 60%, 80%, 100%
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0]

  function polygonPoints(radiusFraction: number): string {
    return data
      .map((_, i) => {
        const angle = startAngle + i * angleStep
        const [x, y] = polarToXY(angle, radius * radiusFraction)
        return `${x},${y}`
      })
      .join(' ')
  }

  // Data polygon
  const dataPoints = data.map((d, i) => {
    const angle = startAngle + i * angleStep
    const r = (d.value / maxValue) * radius
    return polarToXY(angle, r)
  })

  const dataPolygon = dataPoints.map(([x, y]) => `${x},${y}`).join(' ')

  // Label positions
  const labels = data.map((d, i) => {
    const angle = startAngle + i * angleStep
    const [x, y] = polarToXY(angle, labelOffset)
    return { ...d, x, y }
  })

  const gradientId = `radar-fill-${data.length}-${maxValue}`

  return (
    <div style={{ width: '100%', maxWidth: 320, margin: '0 auto' }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={fillColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={fillColor} stopOpacity={0.05} />
          </linearGradient>
        </defs>

        {/* Grid lines (axis lines from center to each vertex) */}
        {data.map((_, i) => {
          const angle = startAngle + i * angleStep
          const [x, y] = polarToXY(angle, radius)
          return (
            <line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="var(--border)"
              strokeOpacity={0.4}
              strokeWidth={1}
            />
          )
        })}

        {/* Grid polygons */}
        {levels.map((level, i) => (
          <polygon
            key={`grid-${i}`}
            points={polygonPoints(level)}
            fill="none"
            stroke="var(--border)"
            strokeOpacity={level === 1 ? 0.5 : 0.25}
            strokeWidth={level === 1 ? 1.5 : 1}
          />
        ))}

        {/* Data fill polygon */}
        <polygon
          points={dataPolygon}
          fill={`url(#${gradientId})`}
          stroke={fillColor}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data dots */}
        {dataPoints.map(([x, y], i) => (
          <circle
            key={`dot-${i}`}
            cx={x}
            cy={y}
            r={4}
            fill={fillColor}
            stroke="var(--bg-card)"
            strokeWidth={2}
          />
        ))}

        {/* Labels */}
        {labels.map((l, i) => {
          // Determine text-anchor based on position
          const angle = startAngle + i * angleStep
          const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
          let anchor: 'middle' | 'start' | 'end' = 'middle'
          if (normalizedAngle > 0.1 && normalizedAngle < Math.PI - 0.1) anchor = 'start'
          else if (normalizedAngle > Math.PI + 0.1 && normalizedAngle < 2 * Math.PI - 0.1) anchor = 'end'

          return (
            <text
              key={`label-${i}`}
              x={l.x}
              y={l.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill="var(--text-secondary)"
              fontSize={11}
              fontWeight={600}
              fontFamily="inherit"
            >
              {l.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
