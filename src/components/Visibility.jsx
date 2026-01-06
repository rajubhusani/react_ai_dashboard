import React from 'react'
import './Visibility.css'

const Visibility = () => {
  return (
    <div className="widget visibility">
      <div className="widget-header">
        <h3>Visibility</h3>
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
      
      <div className="visibility-metric">
        <span className="percentage">38.8%</span>
        <span className="change">+2.3</span>
      </div>
      
      <div className="search-info">
        <span>SearchEye Rank</span>
        <span className="rank-change">↑ 23</span>
      </div>
      
      <div className="chart-container">
        <svg width="100%" height="120" viewBox="0 0 300 120">
          <defs>
            <linearGradient id="visibilityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          
          <path d="M0,100 L50,95 L100,90 L150,85 L200,70 L250,60 L300,50" 
                fill="url(#visibilityGradient)" 
                stroke="#06b6d4" 
                strokeWidth="2"/>
        </svg>
      </div>
      
      <div className="date-range">
        <span>Apr 12</span>
        <span>Mar 13</span>
        <span>Apr 14</span>
        <span>Apr 15</span>
        <span>Apr 16</span>
        <span>Apr 17</span>
      </div>
    </div>
  )
}

export default Visibility
