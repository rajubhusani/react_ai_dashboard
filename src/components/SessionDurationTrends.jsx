import { useState, useEffect } from 'react'
import { dashboardService } from '../api/dashboardService'
import './SessionDurationTrends.css'

const SessionDurationTrends = () => {
  const [data, setData] = useState([])
  const [stats, setStats] = useState({ avg: 0, min: 0, max: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState(() => {
    const saved = localStorage.getItem('dateRange')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    fetchData()
  }, [dateRange])

  useEffect(() => {
    const handleDateRangeChange = (event) => {
      console.log('🟣 SessionDurationTrends: Date range changed:', event.detail)
      setDateRange(event.detail)
    }
    window.addEventListener('dateRangeChange', handleDateRangeChange)
    return () => window.removeEventListener('dateRangeChange', handleDateRangeChange)
  }, [])

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    console.log('🟣 SessionDurationTrends: Fetching data with dateRange=', dateRange)

    try {
      const result = await dashboardService.getSessions(
        dateRange?.start,
        dateRange?.end
      )
      console.log('✅ SessionDurationTrends: Successfully fetched sessions data:', result)

      // Group sessions by date and calculate average duration
      const durationByDate = {}
      
      result.sessions.forEach(session => {
        const date = new Date(session.startDateTime).toISOString().split('T')[0]
        
        if (!durationByDate[date]) {
          durationByDate[date] = {
            totalDuration: 0,
            count: 0,
            durations: []
          }
        }
        
        durationByDate[date].totalDuration += session.duration
        durationByDate[date].count++
        durationByDate[date].durations.push(session.duration)
      })

      // Convert to array format and calculate stats
      const chartData = Object.keys(durationByDate)
        .sort()
        .map(date => ({
          date,
          avgDuration: Math.round(durationByDate[date].totalDuration / durationByDate[date].count),
          sessionCount: durationByDate[date].count,
          minDuration: Math.min(...durationByDate[date].durations),
          maxDuration: Math.max(...durationByDate[date].durations)
        }))

      // Calculate overall stats
      const allDurations = result.sessions.map(s => s.duration)
      const totalDuration = allDurations.reduce((sum, d) => sum + d, 0)
      const avgDuration = allDurations.length > 0 ? Math.round(totalDuration / allDurations.length) : 0
      const minDuration = allDurations.length > 0 ? Math.min(...allDurations) : 0
      const maxDuration = allDurations.length > 0 ? Math.max(...allDurations) : 0

      console.log('📊 SessionDurationTrends: Processed data:', chartData)
      setData(chartData)
      setStats({
        avg: avgDuration,
        min: minDuration,
        max: maxDuration,
        total: result.totalSessions
      })
    } catch (err) {
      console.error('❌ SessionDurationTrends: Failed to fetch data:', err)
      setError('Failed to load Engagement Duration Trends')
      setData([])
      setStats({ avg: 0, min: 0, max: 0, total: 0 })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="widget">
        <div className="widget-header">
          <h3>Engagement Duration Trends</h3>
        </div>
        <div className="widget-content">
          <div className="loading">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="widget">
        <div className="widget-header">
          <h3>Engagement Duration Trends</h3>
        </div>
        <div className="widget-content">
          <div className="error">{error}</div>
        </div>
      </div>
    )
  }

  const maxDuration = Math.max(...data.map(item => item.avgDuration), 1)

  return (
    <div className="widget">
      <div className="widget-header">
        <h3>Engagement Duration Trends</h3>
      </div>
      <div className="widget-content">
        {data.length === 0 ? (
          <div className="no-data">No session data available</div>
        ) : (
          <>
            <div className="duration-stats">
              <div className="stat-card">
                <div className="stat-label">Total Sessions</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg Duration</div>
                <div className="stat-value">{formatDuration(stats.avg)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Min Duration</div>
                <div className="stat-value">{formatDuration(stats.min)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Max Duration</div>
                <div className="stat-value">{formatDuration(stats.max)}</div>
              </div>
            </div>

            <div className="line-chart">
              <svg width="100%" height="250" viewBox="0 0 800 250" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(percent => (
                  <line
                    key={percent}
                    x1="0"
                    y1={250 - (percent * 2)}
                    x2="800"
                    y2={250 - (percent * 2)}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                ))}

                {/* Line path */}
                <polyline
                  points={data.map((item, index) => {
                    const x = (index / (data.length - 1)) * 800
                    const y = 250 - ((item.avgDuration / maxDuration) * 200)
                    return `${x},${y}`
                  }).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                />

                {/* Data points */}
                {data.map((item, index) => {
                  const x = (index / (data.length - 1)) * 800
                  const y = 250 - ((item.avgDuration / maxDuration) * 200)
                  return (
                    <g key={index}>
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#3b82f6"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <title>{`${new Date(item.date).toLocaleDateString()}: ${formatDuration(item.avgDuration)} (${item.sessionCount} sessions)`}</title>
                    </g>
                  )
                })}
              </svg>

              <div className="x-axis-labels">
                {data.map((item, index) => {
                  if (index === 0 || index === Math.floor(data.length / 2) || index === data.length - 1) {
                    const date = new Date(item.date)
                    return (
                      <span key={index} className="x-label">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )
                  }
                  return null
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SessionDurationTrends

