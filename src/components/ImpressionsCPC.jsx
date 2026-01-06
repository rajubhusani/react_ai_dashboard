import React from 'react'
import './ImpressionsCPC.css'

const ImpressionsCPC = () => {
  const data = [
    { impressions: '7,632,263', clicks: '23,372', ctr: '0.3%', color: '#ef4444' },
    { impressions: '3,234,253', clicks: '621', ctr: '0.02%', color: '#f97316' },
    { impressions: '2,124,234', clicks: '3,362', ctr: '0.17%', color: '#6b7280' },
    { impressions: '1,734,122', clicks: '16,721', ctr: '1.1%', color: '#ef4444' },
    { impressions: '1,233,324', clicks: '672', ctr: '0.05%', color: '#f59e0b' },
    { impressions: '1,204,291', clicks: '441', ctr: '0.04%', color: '#10b981' },
    { impressions: '1,073,383', clicks: '1,362', ctr: '0.15%', color: '#ef4444' },
    { impressions: '983,231', clicks: '1,112', ctr: '0.11%', color: '#f97316' },
    { impressions: '721,211', clicks: '162', ctr: '0.12%', color: '#3b82f6' }
  ]

  return (
    <div className="widget impressions-cpc">
      <div className="widget-header">
        <h3>Impressions CPC</h3>
      </div>
      
      <div className="impressions-table">
        <div className="table-header">
          <span>Impressions</span>
          <span>UI Clicks</span>
          <span>UI CTR</span>
        </div>
        
        {data.map((item, index) => (
          <div key={index} className="table-row">
            <div className="impressions-cell">
              <div className="color-dot" style={{ backgroundColor: item.color }}></div>
              <span>{item.impressions}</span>
            </div>
            <span className="clicks-cell">{item.clicks}</span>
            <span className="ctr-cell">{item.ctr}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImpressionsCPC
