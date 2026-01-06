import React, { useState, useEffect } from 'react'
import { dashboardService } from '../api/dashboardService'
import AreaChart from './AreaChart'
import InfoTooltip from './InfoTooltip'
import { widgetTooltips } from './widgetTooltips'
import './Trends.css'

const Trends = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [accountCode, setAccountCode] = useState(() => {
    const saved = localStorage.getItem('accountCode')
    return saved || ''
  })
  const [dateRange, setDateRange] = useState(() => {
    const saved = localStorage.getItem('dateRange')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    fetchData()
  }, [dateRange, accountCode])

  useEffect(() => {
    // Listen for date range changes from header
    const handleDateRangeChange = (event) => {
      console.log('🟢 Trends: Date range changed:', event.detail)
      setDateRange(event.detail)
    }

    // Listen for account code changes from header
    const handleAccountCodeChange = (event) => {
      console.log('🟢 Trends: Account code changed:', event.detail)
      setAccountCode(event.detail)
    }

    window.addEventListener('dateRangeChange', handleDateRangeChange)
    window.addEventListener('accountCodeChange', handleAccountCodeChange)

    return () => {
      window.removeEventListener('dateRangeChange', handleDateRangeChange)
      window.removeEventListener('accountCodeChange', handleAccountCodeChange)
    }
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    console.log(`🟢 Trends: Fetching data with dateRange=`, dateRange, 'accountCode=', accountCode)
    try {
      const result = await dashboardService.getTrends(
        dateRange?.start,
        dateRange?.end,
        accountCode
      )
      console.log(`✅ Trends: Successfully fetched ${result.length} records`)

      // Sort data by date/time in ascending order
      const sortedData = [...result].sort((a, b) => {
        const dateA = new Date(a.time || a.period)
        const dateB = new Date(b.time || b.period)
        return dateA - dateB
      })
      console.log(`📊 Trends: Sorted data from ${sortedData[0]?.time} to ${sortedData[sortedData.length - 1]?.time}`)

      setData(sortedData)
    } catch (err) {
      console.error('❌ Trends: Failed to fetch data:', err)
      setError(err?.message || 'Failed to load usage trends')
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary stats
  const totalCount = data.reduce((sum, item) => sum + item.count, 0)
  const avgCount = data.length > 0 ? Math.round(totalCount / data.length) : 0
  const maxCount = data.length > 0 ? Math.max(...data.map(item => item.count)) : 0
  const minCount = data.length > 0 ? Math.min(...data.map(item => item.count)) : 0

  // Calculate trend direction
  const firstHalf = data.slice(0, Math.floor(data.length / 2))
  const secondHalf = data.slice(Math.floor(data.length / 2))
  const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.count, 0) / (firstHalf.length || 1)
  const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.count, 0) / (secondHalf.length || 1)
  const trendPercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0

  return (
    <div className="widget trends">
      <div className="widget-header">
        <h3>Usage Trends</h3>
        <InfoTooltip content={widgetTooltips.trends} />
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="trends-summary">
            <div className="summary-item">
              <div className="summary-label">Total Prompts</div>
              <div className="summary-value">{totalCount.toLocaleString()}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Average</div>
              <div className="summary-value">{avgCount.toLocaleString()}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Trend</div>
              <div className={`summary-value trend ${trendPercentage >= 0 ? 'positive' : 'negative'}`}>
                {trendPercentage >= 0 ? '↑' : '↓'} {Math.abs(trendPercentage).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="chart-container">
            <AreaChart
              data={data}
              dataKey="count"
              color="#10b981"
              height={220}
            />
          </div>

          <div className="x-axis-labels">
            {data.map((item, index) => {
              // Show only first, middle, and last labels
              if (index === 0 || index === Math.floor(data.length / 2) || index === data.length - 1) {
                const date = new Date(item.time)

                // Check if date is valid
                if (isNaN(date.getTime())) {
                  return <span key={index} className="x-label">{item.time}</span>
                }

                // Use simple date format
                const dateFormat = { month: 'short', day: 'numeric' }

                return (
                  <span key={index} className="x-label">
                    {date.toLocaleDateString('en-US', dateFormat)}
                  </span>
                )
              }
              return null
            })}
          </div>

          <div className="trends-info">
            <div className="info-item">
              <span className="info-label">Peak:</span>
              <span className="info-value">{maxCount}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Low:</span>
              <span className="info-value">{minCount}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Trends

