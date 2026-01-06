import React from 'react'
import './ImpressionsBottom.css'

const ImpressionsBottom = () => {
  return (
    <div className="widget impressions-bottom">
      <div className="widget-header">
        <h3>Impressions CPC</h3>
        <button className="view-report-btn">
          View full report
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M17 7H7M17 7V17"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ImpressionsBottom
