import React, { useState, useRef, useEffect, useCallback } from 'react'

const GroupedBarChart = ({ data, series, height = 200 }) => {
  const [tooltip, setTooltip] = useState(null)
  const [hoveredBar, setHoveredBar] = useState(null)
  const [containerWidth, setContainerWidth] = useState(1200)
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const tooltipRef = useRef(null)
  const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 })

  // Measure tooltip size after it renders
  useEffect(() => {
    if (tooltipRef.current) {
      setTooltipSize({
        width: tooltipRef.current.offsetWidth,
        height: tooltipRef.current.offsetHeight
      })
    }
  }, [tooltip])

  // Calculate tooltip position to prevent overflow
  const getTooltipLeft = useCallback(() => {
    if (!tooltip) return 0
    const padding = 10
    const cw = containerRef.current ? containerRef.current.offsetWidth : containerWidth
    const tooltipW = tooltipSize.width || 160 // fallback estimate

    // Check if tooltip would overflow right edge
    if (tooltip.x + padding + tooltipW > cw) {
      // Flip to left of cursor
      return Math.max(0, tooltip.x - tooltipW - padding)
    }
    // Default: right of cursor
    return tooltip.x + padding
  }, [tooltip, tooltipSize.width, containerWidth])

  // Measure container width on mount and resize
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        if (width > 0) {
          setContainerWidth(Math.max(width - 70, 800))
        }
      }
    }

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

  // Calculate max value across all series
  const allValues = data.flatMap(item => 
    series.map(s => typeof item[s.dataKey] === 'number' ? item[s.dataKey] : 0)
  )
  const maxValue = Math.max(...allValues, 1)
  const minValue = 0
  const range = maxValue - minValue || 1

  const paddingTop = 20
  const paddingBottom = 40
  const paddingLeft = 50
  const paddingRight = 20
  const chartWidth = containerWidth
  const chartHeight = height - paddingTop - paddingBottom

  // Calculate bar dimensions
  const groupWidth = chartWidth / data.length
  const barWidth = Math.min(30, (groupWidth - 20) / series.length)
  const groupSpacing = (chartWidth - (groupWidth * data.length)) / (data.length + 1)

  const groups = data.map((item, groupIndex) => {
    const groupX = groupSpacing + groupIndex * (groupWidth + groupSpacing)
    const bars = series.map((s, seriesIndex) => {
      const value = typeof item[s.dataKey] === 'number' ? item[s.dataKey] : 0
      const barHeight = ((value - minValue) / range) * chartHeight
      const x = groupX + seriesIndex * barWidth + (groupWidth - series.length * barWidth) / 2
      const y = chartHeight - barHeight
      return {
        x,
        y,
        width: barWidth,
        height: Math.max(0, barHeight),
        value,
        color: s.color,
        label: s.label,
        dataKey: s.dataKey
      }
    })
    return { groupX, bars, data: item, groupIndex }
  })

  const handleBarMouseEnter = (e, bar, groupData) => {
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setHoveredBar({ dataKey: bar.dataKey, groupIndex: groupData.groupIndex })
    setTooltip({
      x: mouseX,
      y: mouseY,
      bar,
      data: groupData.data
    })
  }

  const handleBarMouseMove = (e) => {
    if (!tooltip) return
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    setTooltip(prev => ({ ...prev, x: mouseX, y: mouseY }))
  }

  const handleBarMouseLeave = () => {
    setHoveredBar(null)
    setTooltip(null)
  }

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

        {/* Grouped Bars */}
        <g transform={`translate(0, ${paddingTop})`}>
          {groups.map((group, groupIndex) => (
            <g key={groupIndex}>
              {group.bars.map((bar, barIndex) => (
                <rect
                  key={barIndex}
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  fill={bar.color}
                  opacity={
                    hoveredBar && hoveredBar.dataKey === bar.dataKey && hoveredBar.groupIndex === groupIndex
                      ? 1
                      : 0.85
                  }
                  style={{
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  rx="2"
                  ry="2"
                  onMouseEnter={(e) => handleBarMouseEnter(e, bar, group)}
                  onMouseMove={handleBarMouseMove}
                  onMouseLeave={handleBarMouseLeave}
                />
              ))}
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
          {groups.map((group, index) => {
            const dateStr = group.data.period || group.data.time
            if (!dateStr) return null

            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return null

            const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

            // Show every nth label to avoid crowding
            const showEvery = data.length > 20 ? 3 : data.length > 10 ? 2 : 1
            const shouldShow = index % showEvery === 0 || index === data.length - 1

            if (!shouldShow) return null

            return (
              <text
                key={index}
                x={group.groupX + groupWidth / 2}
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
          ref={tooltipRef}
          style={{
            position: 'absolute',
            left: getTooltipLeft(),
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
              const dateStr = tooltip.data.period || tooltip.data.time
              if (!dateStr) return ''

              const date = new Date(dateStr)
              if (isNaN(date.getTime())) return dateStr

              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            })()}
          </div>
          <div style={{ color: tooltip.bar.color }}>
            {tooltip.bar.label}: <strong>{tooltip.bar.value.toLocaleString()}</strong>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '12px',
        flexWrap: 'wrap'
      }}>
        {series.map((s, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: s.color,
              borderRadius: '2px'
            }} />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GroupedBarChart

