type SparklineProps = {
  points: number[]
  width?: number
  height?: number
  domain?: [number, number]
  className?: string
}

export function Sparkline({
  points,
  width = 120,
  height = 28,
  domain,
  className,
}: SparklineProps) {
  if (points.length === 0) return null

  const [lo, hi] = domain ?? autoDomain(points)
  const span = hi - lo || 1
  const stepX = points.length === 1 ? 0 : width / (points.length - 1)

  const coords = points.map((v, i) => {
    const x = points.length === 1 ? width / 2 : i * stepX
    const y = height - ((v - lo) / span) * height
    return [x, y] as const
  })

  const path =
    points.length === 1
      ? ''
      : coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')

  const last = coords[coords.length - 1]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-hidden="true"
    >
      {path && (
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <circle cx={last[0]} cy={last[1]} r={2} fill="currentColor" />
    </svg>
  )
}

function autoDomain(points: number[]): [number, number] {
  let lo = points[0]
  let hi = points[0]
  for (const v of points) {
    if (v < lo) lo = v
    if (v > hi) hi = v
  }
  if (lo === hi) {
    const pad = Math.max(1, Math.abs(lo) * 0.1)
    return [lo - pad, hi + pad]
  }
  const pad = (hi - lo) * 0.1
  return [lo - pad, hi + pad]
}
