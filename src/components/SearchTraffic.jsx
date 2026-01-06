import React from 'react'
import DonutChart from './DonutChart'
import './SearchTraffic.css'

const SearchTraffic = () => {
  const data = [
    { label: 'Referral', value: 3, color: '#06b6d4' },
    { label: 'Direct', value: 27, color: '#10b981' },
    { label: 'Organic Search', value: 12, color: '#3b82f6' },
    { label: 'Paid Search', value: 21, color: '#8b5cf6' },
    { label: 'Social Media', value: 16, color: '#f59e0b' }
  ]

  return (
    <div className="widget search-traffic">
      <div className="widget-header">
        <h3>Search Traffic</h3>
      </div>
      
      <div className="chart-container">
        <DonutChart data={data} centerValue="471" centerLabel="Total" />
      </div>
      
      <div className="legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: item.color }}></div>
            <span className="legend-percentage">{item.value}%</span>
            <span className="legend-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchTraffic
