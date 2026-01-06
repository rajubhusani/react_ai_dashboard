import React from 'react'
import './RelatedKeywords.css'

const RelatedKeywords = () => {
  return (
    <div className="widget related-keywords">
      <div className="widget-header">
        <h3>Related Keywords</h3>
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

export default RelatedKeywords
