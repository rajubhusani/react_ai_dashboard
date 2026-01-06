import React, { useState, useRef } from 'react'

const BarChart = ({ data, dataKey = 'count', color = '#3b82f6', height = 200, showValues = false, label = 'Count' }) => {
  const [tooltip, setTooltip] = useState(null)
  const [hoveredIndex, setHoveredIndex] = useState(null)
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

  // Validate data
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
        No data available
      </div>
    )
  }

  // Validate dataKey exists in data
  const values = data.map(item => {
    const value = item[dataKey]
    return typeof value === 'number' ? value : 0
  })

  const maxValue = Math.max(...values, 1) // Ensure at least 1
  const minValue = 0 // Bar charts typically start at 0
  const range = maxValue - minValue || 1

  const paddingTop = 20
  const paddingBottom = 40 // Increased for X-axis labels
  const paddingLeft = 50
  const paddingRight = 20
  const chartWidth = containerWidth
  const chartHeight = height - paddingTop - paddingBottom

  // Calculate bar width and spacing to distribute evenly across chart width
  const maxBarWidth = 60 // Maximum width for each bar
  const minBarSpacing = 20 // Minimum space between bars

  // Calculate available space per bar (including spacing)
  const spacePerBar = chartWidth / data.length

  // Calculate bar width (leave space for spacing)
  const barWidth = Math.min(maxBarWidth, spacePerBar - minBarSpacing)

  // Calculate actual spacing to center bars
  const actualSpacing = (chartWidth - (barWidth * data.length)) / (data.length + 1)

  const bars = data.map((item, index) => {
    const x = actualSpacing + index * (barWidth + actualSpacing)
    const value = typeof item[dataKey] === 'number' ? item[dataKey] : 0
    const barHeight = ((value - minValue) / range) * chartHeight
    const y = chartHeight - barHeight
    return { x, y, width: barWidth, height: Math.max(0, barHeight), value, data: item, index }
  })

  const handleBarMouseEnter = (e, bar) => {
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setHoveredIndex(bar.index)
    setTooltip({
      x: mouseX,
      y: mouseY,
      value: bar.value,
      data: bar.data
    })
  }

  const handleBarMouseMove = (e) => {
    if (!tooltip) return

    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setTooltip(prev => ({
      ...prev,
      x: mouseX,
      y: mouseY
    }))
  }

  const handleBarMouseLeave = () => {
    setHoveredIndex(null)
    setTooltip(null)
  }

  // Use full chart width for viewBox
  const viewBoxWidth = chartWidth

  return (
    <div ref={containerRef} style={{ position: 'relative', minHeight: `${height}px`, overflowX: 'auto', width: '100%' }}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`-${paddingLeft} 0 ${viewBoxWidth + paddingLeft + paddingRight} ${height}`}
        preserveAspectRatio="xMinYMid meet"
        style={{ overflow: 'visible', display: 'block', minWidth: '100%' }}
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

        {/* Bars */}
        <g transform={`translate(0, ${paddingTop})`}>
          {bars.map((bar, index) => (
            <g key={index}>
                <rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  fill={color}
                  opacity={hoveredIndex === bar.index ? 1 : 0.85}
                  style={{
                    cursor: 'pointer',
                    transition: 'opacity 0.2s, transform 0.2s'
                  }}
                  rx="2"
                  ry="2"
                  onMouseEnter={(e) => handleBarMouseEnter(e, bar)}
                  onMouseMove={handleBarMouseMove}
                  onMouseLeave={handleBarMouseLeave}
                />
                {showValues && bar.height > 20 && (
                  <text
                    x={bar.x + bar.width / 2}
                    y={bar.y - 5}
                    fontSize="10"
                    fill="#6b7280"
                    textAnchor="middle"
                    vectorEffect="non-scaling-stroke"
                    style={{ pointerEvents: 'none' }}
                  >
                    {bar.value.toLocaleString()}
                  </text>
                )}
              </g>
            ))}
        </g>

        {/* Y-axis labels */}
        <g transform={`translate(0, ${paddingTop})`}>
          {[maxValue, maxValue / 2, minValue].map((value, i) => (
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
        <g transform={`translate(0, ${paddingTop + chartHeight + 10})`}>
          {bars.map((bar, index) => {
            const dateStr = bar.data.period || bar.data.time
            if (!dateStr) return null

            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return null

            // Format date based on number of data points
            let formattedDate
            if (data.length > 30) {
              // Show only month/day for many data points
              formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            } else if (data.length > 15) {
              // Show month/day for moderate data points
              formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            } else {
              // Show full date for few data points
              formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }

            // Show every nth label to avoid crowding
            const showEvery = data.length > 20 ? 3 : data.length > 10 ? 2 : 1
            const shouldShow = index % showEvery === 0 || index === data.length - 1

            if (!shouldShow) return null

            return (
              <text
                key={index}
                x={bar.x + bar.width / 2}
                y="0"
                fontSize="10"
                fill="#6b7280"
                textAnchor="middle"
                vectorEffect="non-scaling-stroke"
                style={{ pointerEvents: 'none' }}
              >
                {formattedDate}
              </text>
            )
          })}
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
              if (isNaN(date.getTime())) return dateStr;
              
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
            })()}
          </div>
          <div style={{ color: color }}>
            {label}: <strong>
              {dataKey === 'retentionRate'
                ? `${tooltip.value.toFixed(1)}%`
                : tooltip.value.toLocaleString()}
            </strong>
          </div>
          {tooltip.data.activeUsers && tooltip.data.totalUsers && (
            <div style={{ fontSize: '11px', color: '#d1d5db', marginTop: '4px' }}>
              Active: {tooltip.data.activeUsers.toLocaleString()} / {tooltip.data.totalUsers.toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BarChart

