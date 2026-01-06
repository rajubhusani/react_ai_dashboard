import { useState, useEffect } from 'react'
import { dashboardService } from '../api/dashboardService'
import './AppFlavorTrends.css'

const AppFlavorTrends = () => {
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
      console.log('🟠 AppFlavorTrends: Date range changed:', event.detail)
      setDateRange(event.detail)
    }
    window.addEventListener('dateRangeChange', handleDateRangeChange)
    return () => window.removeEventListener('dateRangeChange', handleDateRangeChange)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    console.log('🟠 AppFlavorTrends: Fetching data with dateRange=', dateRange)

    try {
      const result = await dashboardService.getSessions(
        dateRange?.start,
        dateRange?.end
      )
      console.log('✅ AppFlavorTrends: Successfully fetched sessions data:', result)

      // Check if sessions data exists
      if (!result || !result.sessions || result.sessions.length === 0) {
        console.log('⚠️ AppFlavorTrends: No sessions data available')
        setData({ chartData: [], flavors: [] })
        setLoading(false)
        return
      }

      // Group sessions by appFlavor and date
      const flavorMap = {}
      
      result.sessions.forEach(session => {
        const date = new Date(session.startDateTime).toISOString().split('T')[0]
        const flavor = session.appFlavor || 'unknown'
        
        if (!flavorMap[flavor]) {
          flavorMap[flavor] = {}
        }
        
        if (!flavorMap[flavor][date]) {
          flavorMap[flavor][date] = 0
        }
        
        flavorMap[flavor][date]++
      })

      // Convert to array format for visualization
      const dates = new Set()
      Object.values(flavorMap).forEach(flavorData => {
        Object.keys(flavorData).forEach(date => dates.add(date))
      })

      const sortedDates = Array.from(dates).sort()
      
      const chartData = sortedDates.map(date => {
        const dataPoint = { date }
        Object.keys(flavorMap).forEach(flavor => {
          dataPoint[flavor] = flavorMap[flavor][date] || 0
        })
        return dataPoint
      })

      console.log('📊 AppFlavorTrends: Processed data:', chartData)
      setData({ chartData, flavors: Object.keys(flavorMap) })
    } catch (err) {
      console.error('❌ AppFlavorTrends: Failed to fetch data:', err)
      setError('Failed to load app flavor trends')
      setData({ chartData: [], flavors: [] })
    } finally {
      setLoading(false)
    }
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  if (loading) {
    return (
      <div className="widget">
        <div className="widget-header">
          <h3>App Flavor Trends</h3>
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
          <h3>App Flavor Trends</h3>
        </div>
        <div className="widget-content">
          <div className="error">{error}</div>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(
    ...data.chartData.flatMap(item => 
      data.flavors.map(flavor => item[flavor] || 0)
    ),
    1
  )

  return (
    <div className="widget">
      <div className="widget-header">
        <h3>App Flavor Trends</h3>
      </div>
      <div className="widget-content">
        {data.chartData.length === 0 ? (
          <div className="no-data">No session data available</div>
        ) : (
          <>
            <div className="chart-legend" style={{ marginBottom: '15px' }}>
              {data.flavors.map((flavor, index) => (
                <div key={flavor} className="legend-item">
                  <span 
                    className="legend-color" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></span>
                  <span className="legend-label">{flavor}</span>
                </div>
              ))}
            </div>

            <div className="bar-chart" style={{ height: '250px' }}>
              {data.chartData.map((item, index) => {
                const date = new Date(item.date)
                const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                
                return (
                  <div key={index} className="bar-group">
                    <div className="bars-container">
                      {data.flavors.map((flavor, flavorIndex) => {
                        const value = item[flavor] || 0
                        const height = (value / maxValue) * 100
                        
                        return (
                          <div
                            key={flavor}
                            className="bar-segment"
                            style={{
                              height: `${height}%`,
                              backgroundColor: colors[flavorIndex % colors.length],
                            }}
                            title={`${flavor}: ${value} sessions on ${label}`}
                          >
                            {value > 0 && <span className="bar-value">{value}</span>}
                          </div>
                        )
                      })}
                    </div>
                    <div className="bar-label">{label}</div>
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

export default AppFlavorTrends

