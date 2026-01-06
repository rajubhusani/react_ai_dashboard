import React, { useState, useRef } from 'react'

const AreaChart = ({ data, dataKey = 'count', color = '#10b981', height = 200, tooltipLabel = 'Count', tooltipFormatter = null }) => {
  const [tooltip, setTooltip] = useState(null)
  const [containerWidth, setContainerWidth] = useState(1200)
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  // Measure container width on mount and resize
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        if (width > 0) {
          setContainerWidth(Math.max(width - 70, 800)) // Subtract padding, minimum 800
        }
      }
    }

    // Try multiple times to ensure DOM is ready
    updateWidth()
    const timer1 = setTimeout(updateWidth, 10)
    const timer2 = setTimeout(updateWidth, 100)

    window.addEventListener('resize', updateWidth)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      window.removeEventListener('resize', updateWidth)
    }
  }, [data])

  if (!data || data.length === 0) return null

  const values = data.map(item => item[dataKey]).filter(v => v !== undefined && v !== null && !isNaN(v))

  // If no valid values, return null
  if (values.length === 0) return null

  const maxValue = Math.max(...values)
  const minValue = Math.min(...values, 0)
  const range = maxValue - minValue || 1

  const paddingTop = 20
  const paddingBottom = 30 // Increased for x-axis labels
  const paddingLeft = 50
  const paddingRight = 20
  const chartWidth = containerWidth
  const chartHeight = height - paddingTop - paddingBottom

  const points = data.map((item, index) => {
    const value = item[dataKey]
    // Handle invalid values
    if (value === undefined || value === null || isNaN(value)) {
      return null
    }

    // Handle single data point case
    const x = data.length === 1 ? chartWidth / 2 : (index / (data.length - 1)) * chartWidth
    const y = chartHeight - ((value - minValue) / range) * chartHeight

    // Ensure y is valid
    const validY = isNaN(y) ? chartHeight / 2 : y

    return { x, y: validY, value, data: item }
  }).filter(p => p !== null)

  // If no valid points after filtering, return null
  if (points.length === 0) return null

  // Create line path
  const linePath = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    return `L ${point.x} ${point.y}`
  }).join(' ')

  // Create area path (line + bottom)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`

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
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`-${paddingLeft} 0 ${chartWidth + paddingLeft + paddingRight} ${height}`}
        preserveAspectRatio="xMinYMid meet"
        style={{ overflow: 'visible', display: 'block' }}
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

        <g transform={`translate(0, ${paddingTop})`}>
          {/* Area fill with gradient */}
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Area */}
          <path
            d={areaPath}
            fill={`url(#gradient-${color.replace('#', '')})`}
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Dots */}
          {points.map((point, index) => (
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

        {/* X-axis labels */}
        <g transform={`translate(0, ${paddingTop + chartHeight})`}>
          {(() => {
            // Show max 5 labels to avoid crowding
            const maxLabels = 5;
            const step = Math.max(1, Math.floor(data.length / maxLabels));
            const indices = [];

            // Always show first and last
            indices.push(0);
            for (let i = step; i < data.length - 1; i += step) {
              indices.push(i);
            }
            if (data.length > 1) {
              indices.push(data.length - 1);
            }

            return indices.map((index) => {
              const item = data[index];
              const point = points[index];
              if (!point || !item) return null;

              const dateStr = item.time || item.period;
              if (!dateStr) return null;

              const date = new Date(dateStr);
              if (isNaN(date.getTime())) return null;

              const label = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });

              return (
                <text
                  key={index}
                  x={point.x}
                  y="15"
                  fontSize="10"
                  fill="#6b7280"
                  textAnchor="middle"
                  vectorEffect="non-scaling-stroke"
                >
                  {label}
                </text>
              );
            });
          })()}
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
              const dateStr = tooltip.data.time || tooltip.data.period;
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
            {tooltipLabel}: <strong>
              {tooltipFormatter ? tooltipFormatter(tooltip.value) : tooltip.value.toLocaleString()}
            </strong>
          </div>
        </div>
      )}
    </div>
  )
}

export default AreaChart

