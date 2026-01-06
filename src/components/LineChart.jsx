import React, { useState, useRef } from 'react'

const LineChart = ({ data, dataKey, color = '#3b82f6', height = 200, showDots = true }) => {
  const [tooltip, setTooltip] = useState(null)
  const svgRef = useRef(null)

  if (!data || data.length === 0) return null

  const values = data.map(item => item[dataKey])
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const range = maxValue - minValue || 1

  const paddingTop = 20
  const paddingBottom = 20
  const paddingLeft = 50
  const paddingRight = 20
  const chartWidth = 1000
  const chartHeight = height - paddingTop - paddingBottom

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * chartWidth
    const y = chartHeight - ((item[dataKey] - minValue) / range) * chartHeight
    return { x, y, value: item[dataKey], data: item }
  })

  const pathData = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    return `L ${point.x} ${point.y}`
  }).join(' ')

  const handleMouseMove = (e) => {
    if (!svgRef.current) return

    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const svgX = (mouseX / rect.width) * (chartWidth + paddingLeft + paddingRight) - paddingLeft

    // Find closest point
    let closestPoint = null
    let minDistance = Infinity

    points.forEach(point => {
      const distance = Math.abs(point.x - svgX)
      if (distance < minDistance) {
        minDistance = distance
        closestPoint = point
      }
    })

    if (closestPoint && minDistance < 50) {
      setTooltip({
        x: mouseX,
        y: e.clientY - rect.top,
        value: closestPoint.value,
        data: closestPoint.data
      })
    } else {
      setTooltip(null)
    }
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`-${paddingLeft} 0 ${chartWidth + paddingLeft + paddingRight} ${height}`}
        preserveAspectRatio="none"
        style={{ overflow: 'visible' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Grid lines */}
        <g opacity="0.1" transform={`translate(0, ${paddingTop})`}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1="0"
              y1={chartHeight * ratio}
              x2={chartWidth}
              y2={chartHeight * ratio}
              stroke="#6b7280"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>

        {/* Line path and dots */}
        <g transform={`translate(0, ${paddingTop})`}>
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Dots */}
          {showDots && points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="white"
              stroke={color}
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              style={{ cursor: 'pointer' }}
            />
          ))}
        </g>

        {/* Y-axis labels */}
        <g transform={`translate(0, ${paddingTop})`}>
          {[maxValue, (maxValue + minValue) / 2, minValue].map((value, i) => (
            <text
              key={i}
              x="-10"
              y={(chartHeight * i) / 2}
              fontSize="11"
              fill="#6b7280"
              textAnchor="end"
              dominantBaseline="middle"
              vectorEffect="non-scaling-stroke"
            >
              {Math.round(value).toLocaleString()}
            </text>
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            background: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transform: 'translateY(-100%)'
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            {(() => {
              const dateStr = tooltip.data.period || tooltip.data.time;
              if (!dateStr) return '';

              const date = new Date(dateStr);
              if (isNaN(date.getTime())) return dateStr; // Return raw string if invalid

              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
            })()}
          </div>
          <div style={{ color: color }}>
            Value: <strong>{tooltip.value.toLocaleString()}</strong>
          </div>
        </div>
      )}
    </div>
  )
}

export default LineChart

