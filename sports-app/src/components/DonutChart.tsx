'use client'

interface DonutSegment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  size?: number
  strokeWidth?: number
}

export default function DonutChart({ segments, size = 140, strokeWidth = 18 }: DonutChartProps) {
  const total = segments.reduce((a, s) => a + s.value, 0)
  if (total === 0) {
    return (
      <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aucune donnée</span>
      </div>
    )
  }

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offsets = segments.reduce<number[]>((acc, _, i) => {
    const prev = i === 0 ? 0 : acc[i - 1] + (segments[i - 1].value / total) * circumference
    acc.push(prev)
    return acc
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--bg-secondary)" strokeWidth={strokeWidth}
        />
        {segments.map((seg, i) => {
          const dashLen = (seg.value / total) * circumference
          return (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={-offsets[i]}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: 'all 0.6s ease' }}
            />
          )
        })}
        <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
          style={{ fill: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 800 }}>
          {total}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{seg.label}</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginLeft: 'auto' }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
