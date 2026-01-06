import React, { useState, useEffect } from 'react'
import { useSessionsData } from '../contexts/SessionsContext'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import InfoTooltip from './InfoTooltip'
import { widgetTooltips } from './widgetTooltips'
import './SessionsMap.css'

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

const SessionsMap = () => {
  const { sessionsData, loading, error, accountCode } = useSessionsData()
  const [locationData, setLocationData] = useState([])
  const [hoveredLocation, setHoveredLocation] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (sessionsData && sessionsData.sessions) {
      processLocationData(sessionsData.sessions)
    }
  }, [sessionsData])

  const processLocationData = (sessions) => {
    console.log('🗺️ SessionsMap: Processing location data from', sessions.length, 'sessions')
    
    // Group sessions by location (lat, lng)
    const locationMap = {}
    
    sessions.forEach(session => {
      const key = `${session.lat},${session.lng}`
      
      if (!locationMap[key]) {
        locationMap[key] = {
          lat: session.lat,
          lng: session.lng,
          count: 0,
          users: new Set(),
          sessions: []
        }
      }
      
      locationMap[key].count++
      locationMap[key].users.add(session.userId)
      locationMap[key].sessions.push(session)
    })

    // Convert to array and calculate marker sizes
    const locations = Object.values(locationMap).map(loc => ({
      lat: loc.lat,
      lng: loc.lng,
      count: loc.count,
      users: loc.users.size,
      sessions: loc.sessions
    }))

    // Calculate marker sizes based on session count
    const maxCount = Math.max(...locations.map(l => l.count))
    const minSize = 4
    const maxSize = 20

    locations.forEach(loc => {
      loc.size = minSize + (loc.count / maxCount) * (maxSize - minSize)
    })

    console.log('📊 SessionsMap: Processed', locations.length, 'unique locations')
    setLocationData(locations)
  }

  const handleMarkerMouseEnter = (location, event) => {
    setHoveredLocation(location)
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }

  const handleMarkerMouseMove = (event) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }

  const handleMarkerMouseLeave = () => {
    setHoveredLocation(null)
  }

  if (loading) {
    return (
      <div className="sessions-map">
        <div className="widget-header">
          <h3>📍 Sessions Geographic Distribution</h3>
        </div>
        <div className="widget-content">
          <div className="loading">Loading map data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="sessions-map">
        <div className="widget-header">
          <h3>📍 Sessions Geographic Distribution</h3>
        </div>
        <div className="widget-content">
          <div className="error">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="sessions-map">
      <div className="widget-header">
        <h3>📍 User Sessions</h3>
        <div className="map-stats">
          <InfoTooltip content={widgetTooltips.sessionsMap} />
          <span className="stat-item">
            <span className="stat-label">Locations:</span>
            <span className="stat-value">{locationData.length}</span>
          </span>
          <span className="stat-item">
            <span className="stat-label">Sessions:</span>
            <span className="stat-value">{sessionsData?.totalSessions || 0}</span>
          </span>
        </div>
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
        <div className="map-container">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 120
            }}
            height={350}
          >
            <ZoomableGroup center={[0, 20]} zoom={1}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#E8F4F8"
                      stroke="#B8D4E0"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none', fill: '#D0E8F2' },
                        pressed: { outline: 'none' }
                      }}
                    />
                  ))
                }
              </Geographies>
              
              {locationData.map((location, index) => (
                <Marker
                  key={index}
                  coordinates={[location.lng, location.lat]}
                  onMouseEnter={(e) => handleMarkerMouseEnter(location, e)}
                  onMouseMove={handleMarkerMouseMove}
                  onMouseLeave={handleMarkerMouseLeave}
                >
                  <circle
                    r={location.size}
                    fill="#4A90E2"
                    fillOpacity={0.7}
                    stroke="#2E5C8A"
                    strokeWidth={1.5}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    className="map-marker"
                  />
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {hoveredLocation && (
          <div
            className="map-tooltip"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y + 10
            }}
          >
            <div className="tooltip-header">
              <strong>Location: {hoveredLocation.lat.toFixed(4)}, {hoveredLocation.lng.toFixed(4)}</strong>
            </div>
            <div className="tooltip-content">
              <div className="tooltip-row">
                <span className="tooltip-label">Sessions:</span>
                <span className="tooltip-value">{hoveredLocation.count}</span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label">Unique Users:</span>
                <span className="tooltip-value">{hoveredLocation.users}</span>
              </div>
            </div>
          </div>
        )}

        <div className="map-legend">
          <div className="legend-title">Session Count</div>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-marker" style={{ width: '8px', height: '8px' }}></div>
              <span>Low</span>
            </div>
            <div className="legend-item">
              <div className="legend-marker" style={{ width: '14px', height: '14px' }}></div>
              <span>Medium</span>
            </div>
            <div className="legend-item">
              <div className="legend-marker" style={{ width: '20px', height: '20px' }}></div>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionsMap

