import React, { useState, useEffect } from 'react'
import { useSessionsData } from '../contexts/SessionsContext'
import AreaChart from './AreaChart'
import InfoTooltip from './InfoTooltip'
import { widgetTooltips } from './widgetTooltips'
import './SessionDuration.css'

const SessionDuration = () => {
  const { sessionsData, loading, error, accountCode } = useSessionsData()
  const [data, setData] = useState([])
  const [stats, setStats] = useState({ avg: 0, min: 0, max: 0, total: 0 })

  useEffect(() => {
    if (sessionsData) {
      processData(sessionsData)
    }
  }, [sessionsData])

  const parseDurationToSeconds = (duration) => {
    // Handle different duration formats
    if (!duration) return 0

    // If it's already a number (milliseconds), convert to seconds
    if (typeof duration === 'number') {
      return Math.round(duration / 1000)
    }

    // If it's a string in format "HH:MM:SS.microseconds" or "H:MM:SS.microseconds"
    if (typeof duration === 'string') {
      try {
        const parts = duration.split(':')
        if (parts.length === 3) {
          const hours = parseInt(parts[0], 10)
          const minutes = parseInt(parts[1], 10)
          const seconds = parseFloat(parts[2]) // This handles the decimal part
          return Math.round(hours * 3600 + minutes * 60 + seconds)
        }
      } catch (e) {
        console.error('Error parsing duration:', duration, e)
        return 0
      }
    }

    return 0
  }

  const formatDuration = (seconds) => {
    // Handle invalid values
    if (!seconds || isNaN(seconds) || seconds === 0) return '0s'

    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`
  }

  const processData = (result) => {
    console.log('⏱️ SessionDuration: Processing shared sessions data', result)

    // Check if sessions data exists
    if (!result || !result.sessions || result.sessions.length === 0) {
      console.log('⚠️ SessionDuration: No sessions data available')
      setData([])
      setStats({ avg: 0, min: 0, max: 0, total: 0 })
      return
    }

    console.log('⏱️ SessionDuration: Sample session data:', result.sessions[0])

    // Group sessions by date and calculate average duration
    const durationByDate = {}
    let skippedCount = 0

    result.sessions.forEach(session => {
      // Check if session has required fields
      if (!session.startDateTime) {
        console.log('⚠️ Skipping session - missing startDateTime:', session)
        skippedCount++
        return
      }

      // Check if duration exists
      const duration = session.duration
      if (duration === undefined || duration === null) {
        console.log('⚠️ Skipping session - missing duration:', session)
        skippedCount++
        return
      }

      const date = new Date(session.startDateTime).toISOString().split('T')[0]
      // Parse duration to seconds (handles both string format "HH:MM:SS.ms" and number format)
      const durationInSeconds = parseDurationToSeconds(duration)

      // Skip if duration is invalid after conversion
      if (isNaN(durationInSeconds) || durationInSeconds === 0) {
        console.log('⚠️ Skipping session - invalid duration after conversion:', duration, '→', durationInSeconds)
        skippedCount++
        return
      }

      if (!durationByDate[date]) {
        durationByDate[date] = {
          totalDuration: 0,
          count: 0,
          durations: []
        }
      }

      durationByDate[date].totalDuration += durationInSeconds
      durationByDate[date].count++
      durationByDate[date].durations.push(durationInSeconds)
    })

    console.log(`⏱️ SessionDuration: Processed ${result.sessions.length} sessions, skipped ${skippedCount}`)

    // Convert to array format for LineChart
    const chartData = Object.keys(durationByDate)
      .sort()
      .map(date => {
        const avgDuration = Math.round(durationByDate[date].totalDuration / durationByDate[date].count)
        console.log(`   📅 ${date}: ${durationByDate[date].count} sessions, avg duration = ${avgDuration}s`)
        return {
          time: date,
          value: avgDuration,  // Average duration in seconds for this day
          sessionCount: durationByDate[date].count,
          minDuration: Math.min(...durationByDate[date].durations),
          maxDuration: Math.max(...durationByDate[date].durations)
        }
      })

    // Calculate overall stats (parse duration strings to seconds)
    const allDurations = result.sessions
      .filter(s => s.duration !== undefined && s.duration !== null)
      .map(s => parseDurationToSeconds(s.duration))
      .filter(d => !isNaN(d) && d > 0) // Filter out invalid durations

    console.log('⏱️ SessionDuration: Valid durations:', allDurations.length, 'out of', result.sessions.length)
    console.log('⏱️ SessionDuration: Sample durations (seconds):', allDurations.slice(0, 5))

    const totalDuration = allDurations.reduce((sum, d) => sum + d, 0)
    const avgDuration = allDurations.length > 0 ? Math.round(totalDuration / allDurations.length) : 0
    const minDuration = allDurations.length > 0 ? Math.min(...allDurations) : 0
    const maxDuration = allDurations.length > 0 ? Math.max(...allDurations) : 0

    console.log('📊 SessionDuration: Chart data with average durations:', chartData)
    console.log('   Y-axis will show average duration in seconds for each day')
    setData(chartData)
    setStats({
      avg: avgDuration,
      min: minDuration,
      max: maxDuration,
      total: result.totalSessions
    })
  }

  if (loading) {
    return (
      <div className="session-duration">
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
      <div className="session-duration">
        <div className="widget-header">
          <h3>Engagement Duration Trends</h3>
        </div>
        <div className="widget-content">
          <div className="error">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="session-duration">
      <div className="widget-header">
        <h3>Engagement Duration Trends</h3>
        <InfoTooltip content={widgetTooltips.sessionDuration} />
      </div>

      {accountCode && (
        <div className="account-filter-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
          </svg>
          <span>Account: <strong>{accountCode}</strong></span>
        </div>
      )}

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

            <div className="chart-label">
              Average Duration (seconds)
            </div>

            <div className="chart-container">
              <AreaChart
                data={data}
                dataKey="value"
                color="#8b5cf6"
                height={200}
                tooltipLabel="Avg Duration"
                tooltipFormatter={(value) => formatDuration(value)}
              />
            </div>

            <div className="x-axis-labels">
              {data.map((item, index) => {
                if (index === 0 || index === Math.floor(data.length / 2) || index === data.length - 1) {
                  const date = new Date(item.time)
                  return (
                    <span key={index} className="x-label">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )
                }
                return null
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SessionDuration

