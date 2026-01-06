import React from 'react'
import './UserOverview.css'

const UserOverview = () => {
  return (
    <div className="widget user-overview">
      <div className="widget-header">
        <h3>User overview</h3>
      </div>
      
      <div className="metrics-row">
        <div className="metric">
          <div className="metric-header">
            <span className="metric-label">1W</span>
            <div className="metric-icon blue">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
          <div className="metric-value">87</div>
          <div className="metric-change positive">+4.1%</div>
        </div>
        
        <div className="metric">
          <div className="metric-header">
            <span className="metric-label">1M</span>
            <div className="metric-icon green">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
          <div className="metric-value">55</div>
          <div className="metric-change positive">+2.4%</div>
        </div>
        
        <div className="metric">
          <div className="metric-header">
            <span className="metric-label">3M All</span>
            <div className="metric-icon yellow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
          </div>
          <div className="metric-value">55</div>
          <div className="metric-change negative">-1.4%</div>
        </div>
      </div>
      
      <div className="chart-area">
        <svg width="100%" height="120" viewBox="0 0 300 120">
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
            </linearGradient>
            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          
          <path d="M0,80 Q50,60 100,70 T200,50 T300,40" fill="url(#blueGradient)" stroke="#3b82f6" strokeWidth="2"/>
          <path d="M0,90 Q50,85 100,80 T200,75 T300,70" fill="url(#greenGradient)" stroke="#10b981" strokeWidth="2"/>
        </svg>
      </div>
      
      <div className="date-labels">
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

export default UserOverview
