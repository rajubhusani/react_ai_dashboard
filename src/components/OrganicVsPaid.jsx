import React from 'react'
import './OrganicVsPaid.css'

const OrganicVsPaid = () => {
  const data = [
    { month: 'Apr 12', paid: 30, organic: 25 },
    { month: 'Mar 13', paid: 35, organic: 28 },
    { month: 'Apr 14', paid: 45, organic: 40 },
    { month: 'Apr 15', paid: 55, organic: 35 },
    { month: 'Apr 16', paid: 40, organic: 45 },
    { month: 'Apr 17', paid: 35, organic: 30 }
  ]

  return (
    <div className="widget organic-vs-paid">
      <div className="widget-header">
        <h3>Organic vs Paid Traffic</h3>
        <div className="close-buttons">
          <button className="close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
          </button>
          <button className="close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="legend-row">
        <div className="legend-item">
          <div className="legend-color blue"></div>
          <span>Paid</span>
        </div>
        <div className="legend-item">
          <div className="legend-color green"></div>
          <span>Organic</span>
        </div>
      </div>
      
      <div className="bar-chart">
        {data.map((item, index) => (
          <div key={index} className="bar-group">
            <div className="bars">
              <div className="bar paid" style={{ height: `${item.paid}%` }}></div>
              <div className="bar organic" style={{ height: `${item.organic}%` }}></div>
            </div>
            <span className="bar-label">{item.month}</span>
          </div>
        ))}
      </div>
      
      <div className="y-axis-labels">
        <span>5K</span>
        <span>4K</span>
        <span>3K</span>
        <span>2K</span>
        <span>1K</span>
      </div>
    </div>
  )
}

export default OrganicVsPaid
