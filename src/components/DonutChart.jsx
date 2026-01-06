import React from 'react'

const DonutChart = ({ data, centerValue, centerLabel, size = 120 }) => {
  const radius = size / 2 - 20
  const innerRadius = radius * 0.6
  const circumference = 2 * Math.PI * radius
  
  let cumulativePercentage = 0
  
  const createArc = (percentage, startAngle) => {
    const angle = (percentage / 100) * 360
    const endAngle = startAngle + angle
    
    const x1 = size / 2 + radius * Math.cos((startAngle - 90) * Math.PI / 180)
    const y1 = size / 2 + radius * Math.sin((startAngle - 90) * Math.PI / 180)
    const x2 = size / 2 + radius * Math.cos((endAngle - 90) * Math.PI / 180)
    const y2 = size / 2 + radius * Math.sin((endAngle - 90) * Math.PI / 180)
    
    const largeArcFlag = angle > 180 ? 1 : 0
    
    const innerX1 = size / 2 + innerRadius * Math.cos((startAngle - 90) * Math.PI / 180)
    const innerY1 = size / 2 + innerRadius * Math.sin((startAngle - 90) * Math.PI / 180)
    const innerX2 = size / 2 + innerRadius * Math.cos((endAngle - 90) * Math.PI / 180)
    const innerY2 = size / 2 + innerRadius * Math.sin((endAngle - 90) * Math.PI / 180)
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${innerX2} ${innerY2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1} Z`
  }
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg width={size} height={size}>
        {data.map((item, index) => {
          const startAngle = cumulativePercentage * 3.6
          const path = createArc(item.value, startAngle)
          cumulativePercentage += item.value
          
          return (
            <path
              key={index}
              d={path}
              fill={item.color}
              stroke="white"
              strokeWidth="2"
            />
          )
        })}
      </svg>
      
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: size > 150 ? '24px' : '18px',
          fontWeight: '700',
          color: '#111827',
          lineHeight: '1'
        }}>
          {centerValue}
        </div>
        <div style={{
          fontSize: size > 150 ? '12px' : '10px',
          color: '#6b7280',
          marginTop: '2px'
        }}>
          {centerLabel}
        </div>
      </div>
    </div>
  )
}

export default DonutChart
