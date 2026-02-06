import React, { useState, useEffect } from 'react'
import { dashboardService } from '../api/dashboardService'
import BarChart from './BarChart'
import InfoTooltip from './InfoTooltip'
import { widgetTooltips } from './widgetTooltips'
import { useUserIdListener } from '../hooks/useUserIdListener'
import './UserTrends.css'

const UserTrends = () => {
  const [totalData, setTotalData] = useState(null)
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMetric, setSelectedMetric] = useState('creation') // creation, active, retention
  const [dateRange, setDateRange] = useState(() => {
    const saved = localStorage.getItem('dateRange')
    return saved ? JSON.parse(saved) : null
  })
  const userId = useUserIdListener()

  useEffect(() => {
    fetchData()
  }, [selectedMetric, dateRange, userId])

  useEffect(() => {
    // Listen for date range changes from header
    const handleDateRangeChange = (event) => {
      console.log('🟣 UserTrends: Date range changed:', event.detail)
      setDateRange(event.detail)
    }

    window.addEventListener('dateRangeChange', handleDateRangeChange)
    return () => window.removeEventListener('dateRangeChange', handleDateRangeChange)
  }, [])

  // Fill in missing dates in the trend data (only for daily data)
  const fillMissingDates = (data, groupBy) => {
    if (!data || data.length === 0) return data

    // Only fill missing dates for daily data
    // For weekly/monthly, just sort and return as-is
    if (groupBy !== 'day') {
      return [...data].sort((a, b) => new Date(a.period) - new Date(b.period))
    }

    // Sort data by period
    const sortedData = [...data].sort((a, b) => new Date(a.period) - new Date(b.period))

    const firstDate = new Date(sortedData[0].period)
    const lastDate = new Date(sortedData[sortedData.length - 1].period)

    const filledData = []
    const dataMap = new Map(sortedData.map(item => [item.period, item]))

    let currentDate = new Date(firstDate)

    while (currentDate <= lastDate) {
      const dateStr = currentDate.toISOString().split('T')[0]

      if (dataMap.has(dateStr)) {
        filledData.push(dataMap.get(dateStr))
      } else {
        // Add empty data point for missing date
        if (selectedMetric === 'retention') {
          filledData.push({
            period: dateStr,
            retentionRate: 0,
            activeUsers: 0,
            totalUsers: 0
          })
        } else {
          filledData.push({
            period: dateStr,
            count: 0
          })
        }
      }

      // Increment by 1 day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return filledData
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    console.log(`🟣 UserTrends: Fetching ${selectedMetric} data with dateRange=`, dateRange, 'userId=', userId)

    try {
      // Fetch total users data with date range for new users calculation
      const total = await dashboardService.getUserTotal(userId, dateRange?.start, dateRange?.end)
      console.log(`✅ UserTrends: Successfully fetched total data:`, total)
      console.log(`   - totalUsers: ${total?.totalUsers}`)
      console.log(`   - activeUsers: ${total?.activeUsers}`)
      console.log(`   - newUsers: ${total?.newUsers}`)
      console.log(`   - retentionRate: ${total?.retentionRate}`)
      setTotalData(total)

      // Fetch trend data based on selected metric
      let result
      if (selectedMetric === 'creation') {
        result = await dashboardService.getUserCreationTrends(dateRange?.start, dateRange?.end, userId)
      } else if (selectedMetric === 'active') {
        result = await dashboardService.getUserActiveTrends(dateRange?.start, dateRange?.end, userId)
      } else if (selectedMetric === 'retention') {
        result = await dashboardService.getUserRetention(dateRange?.start, dateRange?.end, userId)
      }

      // Fill in missing dates (only for daily data)
      const filledResult = fillMissingDates(result, 'day')
      setTrendData(filledResult)
    } catch (err) {
      console.error(`❌ UserTrends: Failed to fetch data:`, err)
      setError(err?.message || 'Failed to load user trends')
    } finally {
      setLoading(false)
    }
  }

  const metrics = [
    { key: 'creation', label: 'New Users', color: '#3b82f6', dataKey: 'count', tooltipLabel: 'New Users' }
    // Hidden: Active Users and Retention Rate tabs
    // { key: 'active', label: 'Active Users', color: '#10b981', dataKey: 'count', tooltipLabel: 'Active Users' },
    // { key: 'retention', label: 'Retention Rate', color: '#f59e0b', dataKey: 'retentionRate', tooltipLabel: 'Retention Rate' }
  ]

  const currentMetric = metrics.find(m => m.key === selectedMetric) || metrics[0]

  // Add error boundary
  try {
    return (
      <div className="widget user-trends">
        <div className="widget-header">
          <h3>User Trends</h3>
        <div className="controls">
          <InfoTooltip content={widgetTooltips.userTrends} />
          {/* Metric selector hidden - only showing New Users */}
          {/* Date range selector hidden - now controlled by header */}
        </div>
      </div>

      {loading && !trendData.length ? (
        <div className="loading">Loading user trends...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          {/* Summary Stats Cards */}
          {totalData && (
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Total Users</div>
                <div className="stat-value">
                  {totalData.totalUsers != null ? totalData.totalUsers.toLocaleString() : 'N/A'}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Users</div>
                <div className="stat-value">
                  {totalData.activeUsers != null ? totalData.activeUsers.toLocaleString() : 'N/A'}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">New Users</div>
                <div className="stat-value">
                  {totalData.newUsers != null ? totalData.newUsers.toLocaleString() : 'N/A'}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Retention Rate</div>
                <div className="stat-value">
                  {totalData.retentionRate != null ? `${totalData.retentionRate}%` : 'N/A'}
                </div>
              </div>
            </div>
          )}



          {/* Chart */}
          <div className="chart-container">
            {trendData && trendData.length > 0 && currentMetric ? (
              <BarChart
                data={trendData}
                dataKey={currentMetric.dataKey}
                color={currentMetric.color}
                height={240}
                label={currentMetric.tooltipLabel}
              />
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                No data available
              </div>
            )}
          </div>
        </>
      )}
      </div>
    )
  } catch (err) {
    console.error('❌ UserTrends: Render error:', err)
    return (
      <div className="widget user-trends">
        <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
          <h3>Error loading User Trends</h3>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>{err.message}</p>
        </div>
      </div>
    )
  }
}

export default UserTrends

