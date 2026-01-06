import React from 'react'
import DonutChart from './DonutChart'
import './SearchTrafficLarge.css'

const SearchTrafficLarge = () => {
  const data = [
    { label: 'Desktop', value: 3, color: '#06b6d4' },
    { label: 'Tablet', value: 27, color: '#10b981' },
    { label: 'Mobile', value: 12, color: '#3b82f6' }
  ]

  return (
    <div className="widget search-traffic-large">
      <div className="widget-header">
        <h3>Search Traffic</h3>
      </div>
      
      <div className="large-chart-container">
        <DonutChart data={data} centerValue="59,503" centerLabel="Users" size={180} />
      </div>
      
      <div className="large-legend">
        {data.map((item, index) => (
          <div key={index} className="large-legend-item">
            <div className="legend-color" style={{ backgroundColor: item.color }}></div>
            <span className="legend-percentage">{item.value}%</span>
            <span className="legend-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchTrafficLarge
