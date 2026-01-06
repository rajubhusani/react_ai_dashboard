import { useState, useEffect } from 'react'
import { dashboardService } from '../api/dashboardService'
import './GeoLocationTrends.css'

const GeoLocationTrends = () => {
  const [data, setData] = useState([])
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
      console.log('🌍 GeoLocationTrends: Date range changed:', event.detail)
      setDateRange(event.detail)
    }
    window.addEventListener('dateRangeChange', handleDateRangeChange)
    return () => window.removeEventListener('dateRangeChange', handleDateRangeChange)
  }, [])

  const getLocationName = (lat, lng) => {
    // Simple location mapping based on coordinates
    // In a real app, you'd use a reverse geocoding service
    const locations = {
      '37.7749,-122.4194': 'San Francisco, CA',
      '40.7128,-74.0060': 'New York, NY',
      '34.0522,-118.2437': 'Los Angeles, CA',
      '41.8781,-87.6298': 'Chicago, IL',
      '29.7604,-95.3698': 'Houston, TX',
      '33.4484,-112.0740': 'Phoenix, AZ',
      '39.7392,-104.9903': 'Denver, CO',
      '47.6062,-122.3321': 'Seattle, WA',
    }
    
    const key = `${lat},${lng}`
    return locations[key] || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    console.log('🌍 GeoLocationTrends: Fetching data with dateRange=', dateRange)

    try {
      const result = await dashboardService.getSessions(
        dateRange?.start,
        dateRange?.end
      )
      console.log('✅ GeoLocationTrends: Successfully fetched sessions data:', result)

      // Group sessions by location
      const locationMap = {}
      
      result.sessions.forEach(session => {
        const key = `${session.lat},${session.lng}`
        
        if (!locationMap[key]) {
          locationMap[key] = {
            lat: session.lat,
            lng: session.lng,
            count: 0,
            users: new Set(),
            totalDuration: 0
          }
        }
        
        locationMap[key].count++
        locationMap[key].users.add(session.userId)
        locationMap[key].totalDuration += session.duration
      })

      // Convert to array and sort by count
      const locationData = Object.values(locationMap)
        .map(loc => ({
          location: getLocationName(loc.lat, loc.lng),
          lat: loc.lat,
          lng: loc.lng,
          sessions: loc.count,
          users: loc.users.size,
          avgDuration: Math.round(loc.totalDuration / loc.count)
        }))
        .sort((a, b) => b.sessions - a.sessions)

      console.log('📊 GeoLocationTrends: Processed data:', locationData)
      setData(locationData)
    } catch (err) {
      console.error('❌ GeoLocationTrends: Failed to fetch data:', err)
      setError('Failed to load geographical location trends')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="widget">
        <div className="widget-header">
          <h3>Geographical Location Trends</h3>
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
          <h3>Geographical Location Trends</h3>
        </div>
        <div className="widget-content">
          <div className="error">{error}</div>
        </div>
      </div>
    )
  }

  const maxSessions = Math.max(...data.map(item => item.sessions), 1)

  return (
    <div className="widget">
      <div className="widget-header">
        <h3>Geographical Location Trends</h3>
      </div>
      <div className="widget-content">
        {data.length === 0 ? (
          <div className="no-data">No location data available</div>
        ) : (
          <>
            <div className="geo-summary">
              <div className="summary-card">
                <div className="summary-icon">📍</div>
                <div className="summary-info">
                  <div className="summary-label">Total Locations</div>
                  <div className="summary-value">{data.length}</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">🎯</div>
                <div className="summary-info">
                  <div className="summary-label">Top Location</div>
                  <div className="summary-value">{data[0]?.location.split(',')[0]}</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">📊</div>
                <div className="summary-info">
                  <div className="summary-label">Total Sessions</div>
                  <div className="summary-value">{data.reduce((sum, loc) => sum + loc.sessions, 0)}</div>
                </div>
              </div>
            </div>

            <div className="location-list">
              {data.map((location, index) => {
                const percentage = (location.sessions / maxSessions) * 100
                
                return (
                  <div key={index} className="location-item">
                    <div className="location-info">
                      <div className="location-rank">#{index + 1}</div>
                      <div className="location-details">
                        <div className="location-name">{location.location}</div>
                        <div className="location-meta">
                          <span className="meta-item">
                            <span className="meta-icon">👥</span>
                            {location.users} users
                          </span>
                          <span className="meta-item">
                            <span className="meta-icon">⏱️</span>
                            {formatDuration(location.avgDuration)} avg
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="location-stats">
                      <div className="sessions-count">{location.sessions}</div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
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

export default GeoLocationTrends

