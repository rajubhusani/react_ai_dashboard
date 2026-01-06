import React, { useState } from 'react'

const PieChart = ({ data, size = 200 }) => {
  const [tooltip, setTooltip] = useState(null)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  console.log('🥧 PieChart received data:', data, 'size:', size)

  if (!data || data.length === 0) {
    console.log('⚠️ PieChart: No data or empty data array')
    return null
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  console.log('🥧 PieChart total:', total, 'items:', data.length)
  const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  const radius = size / 2
  const centerX = size / 2
  const centerY = size / 2

  console.log('🥧 PieChart dimensions: size=', size, 'radius=', radius, 'center=(', centerX, ',', centerY, ')')

  const createSlice = (percentage, startAngle, color) => {
    const angle = (percentage / 100) * 360
    const endAngle = startAngle + angle

    // Convert angles to radians
    const startRad = ((startAngle - 90) * Math.PI) / 180
    const endRad = ((endAngle - 90) * Math.PI) / 180

    // Calculate arc points
    const x1 = centerX + radius * Math.cos(startRad)
    const y1 = centerY + radius * Math.sin(startRad)
    const x2 = centerX + radius * Math.cos(endRad)
    const y2 = centerY + radius * Math.sin(endRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    // Create path
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')

    return pathData
  }

  const handleMouseEnter = (e, item, index) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percentage = ((item.value / total) * 100).toFixed(1)

    setTooltip({
      x: e.clientX - rect.left + rect.width / 2,
      y: e.clientY - rect.top,
      label: item.label,
      value: item.value,
      percentage: percentage
    })
    setHoveredIndex(index)
  }

  const handleMouseMove = (e) => {
    if (tooltip) {
      const rect = e.currentTarget.getBoundingClientRect()
      setTooltip(prev => ({
        ...prev,
        x: e.clientX - rect.left + rect.width / 2,
        y: e.clientY - rect.top
      }))
    }
  }

  const handleMouseLeave = () => {
    setTooltip(null)
    setHoveredIndex(null)
  }

  // Calculate cumulative percentages for each slice
  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100
    return { item, index, percentage }
  })

  let cumulativePercentage = 0
  const slicesWithAngles = slices.map(({ item, index, percentage }) => {
    const startAngle = cumulativePercentage * 3.6
    cumulativePercentage += percentage
    return { item, index, percentage, startAngle }
  })

  console.log('🥧 PieChart slices:', slicesWithAngles)

  return (
    <div style={{
      position: 'relative',
      display: 'inline-block'
    }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {slicesWithAngles.map(({ item, index, percentage, startAngle }) => {
          // Use custom color from item if provided, otherwise use default colors
          const color = item.color || defaultColors[index % defaultColors.length]
          const path = createSlice(percentage, startAngle, color)
          console.log(`🥧 Slice ${index}: ${item.label} = ${percentage.toFixed(1)}% color=${color} path="${path}"`)

          return (
            <path
              key={index}
              d={path}
              fill={color}
              stroke="white"
              strokeWidth="2"
              style={{
                cursor: 'pointer',
                opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.6,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => handleMouseEnter(e, item, index)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
          )
        })}
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
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            {tooltip.label.replace(/_/g, ' ')}
          </div>
          <div style={{ fontSize: '12px' }}>
            Count: <strong>{tooltip.value.toLocaleString()}</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#a0aec0' }}>
            {tooltip.percentage}% of total
          </div>
        </div>
      )}
    </div>
  )
}

export default PieChart

