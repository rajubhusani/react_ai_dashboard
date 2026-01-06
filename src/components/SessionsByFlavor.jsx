import React, { useState, useEffect } from 'react'
import { useSessionsData } from '../contexts/SessionsContext'
import PieChart from './PieChart'
import InfoTooltip from './InfoTooltip'
import { widgetTooltips } from './widgetTooltips'
import './SessionsByFlavor.css'

const SessionsByFlavor = () => {
  const { sessionsData, loading, error } = useSessionsData()
  const [data, setData] = useState([])
  const [totalSessions, setTotalSessions] = useState(0)

  useEffect(() => {
    if (sessionsData) {
      processData(sessionsData)
    }
  }, [sessionsData])

  const processData = (result) => {
    console.log('🎨 SessionsByFlavor: Processing shared sessions data')

    // Check if sessions data exists
    if (!result || !result.sessions || result.sessions.length === 0) {
      console.log('⚠️ SessionsByFlavor: No sessions data available')
      setData([])
      setTotalSessions(0)
      return
    }

    // Group sessions by appFlavor
    const flavorCounts = {}

    result.sessions.forEach(session => {
      const flavor = session.appFlavor || 'unknown'
      flavorCounts[flavor] = (flavorCounts[flavor] || 0) + 1
    })

    // Convert to array format for PieChart
    const total = result.sessions.length
    const chartData = Object.entries(flavorCounts)
      .map(([flavor, count]) => ({
        name: flavor,
        label: flavor,  // PieChart expects 'label' field
        value: count,
        percentage: ((count / total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value)

    console.log('📊 SessionsByFlavor: Processed data:', chartData)
    console.log('   Pie chart will display:', chartData.length, 'flavors')
    setData(chartData)
    setTotalSessions(total)
  }

  if (loading) {
    return (
      <div className="sessions-by-flavor">
        <div className="widget-header">
          <h3>Sessions by App Flavor</h3>
        </div>
        <div className="widget-content">
          <div className="loading">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="sessions-by-flavor">
        <div className="widget-header">
          <h3>Sessions by App Flavor</h3>
        </div>
        <div className="widget-content">
          <div className="error">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="sessions-by-flavor">
      <div className="widget-header">
        <h3>Sessions by App Flavor</h3>
        <InfoTooltip content={widgetTooltips.sessionsByFlavor} />
      </div>
      <div className="widget-content">
        {data.length === 0 ? (
          <div className="no-data">No session data available</div>
        ) : (
          <>
            <div className="total-sessions">
              <div className="total-label">Total Sessions</div>
              <div className="total-value">{totalSessions}</div>
            </div>

            <div className="chart-container">
              {console.log('🥧 Rendering PieChart with data:', data)}
              <PieChart data={data} size={250} />
            </div>

            <div className="flavor-list">
              {data.map((item, index) => {
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                const color = colors[index % colors.length]
                
                return (
                  <div key={item.name} className="flavor-item">
                    <div className="flavor-info">
                      <span 
                        className="flavor-color" 
                        style={{ backgroundColor: color }}
                      ></span>
                      <span className="flavor-name">{item.name}</span>
                    </div>
                    <div className="flavor-stats">
                      <span className="flavor-count">{item.value}</span>
                      <span className="flavor-percentage">{item.percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SessionsByFlavor

