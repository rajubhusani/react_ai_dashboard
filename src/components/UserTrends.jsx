import React, { useState, useEffect } from 'react'
import { dashboardService } from '../api/dashboardService'
import BarChart from './BarChart'
import GroupedBarChart from './GroupedBarChart'
import InfoTooltip from './InfoTooltip'
import { widgetTooltips } from './widgetTooltips'
import './UserTrends.css'

const UserTrends = () => {
  const [totalData, setTotalData] = useState(null)
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState(() => {
    const saved = localStorage.getItem('dateRange')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    fetchData()
    // Note: userId is intentionally NOT in dependencies - User Trends always shows all users
  }, [dateRange])

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
        filledData.push({
          period: dateStr,
          count: 0
        })
      }

      // Increment by 1 day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return filledData
  }

  const mergeTrendData = (newUsersData, activeUsersData) => {
    // Create a map to merge data by period
    const mergedMap = new Map()

    // Add new users data
    newUsersData.forEach(item => {
      mergedMap.set(item.period, { period: item.period, newUsers: item.count, activeUsers: 0 })
    })

    // Add active users data
    activeUsersData.forEach(item => {
      if (mergedMap.has(item.period)) {
        mergedMap.get(item.period).activeUsers = item.count
      } else {
        mergedMap.set(item.period, { period: item.period, newUsers: 0, activeUsers: item.count })
      }
    })

    // Convert map to array and sort by period
    return Array.from(mergedMap.values()).sort((a, b) => a.period.localeCompare(b.period))
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    console.log(`🟣 UserTrends: Fetching data for all users (ignoring userId filter) with dateRange=`, dateRange)

    try {
      // Fetch total users data - Do NOT filter by userId, always show all users
      const total = await dashboardService.getUserTotal(null, dateRange?.start, dateRange?.end)
      console.log(`✅ UserTrends: Successfully fetched total data (all users):`, total)
      console.log(`   - totalUsers: ${total?.totalUsers}`)
      console.log(`   - activeUsers: ${total?.activeUsers}`)
      console.log(`   - newUsers: ${total?.newUsers}`)
      console.log(`   - newUsers30Days: ${total?.newUsers30Days}`)
      console.log(`   - retentionRate: ${total?.retentionRate}`)
      setTotalData(total)

      // Fetch both new users and active users trend data for the last 30 days
      // NOTE: Do NOT filter by userId - User Trends should always show all users' data
      const newUsersResult = await dashboardService.getUserCreationTrends30Days(null)
      const activeUsersResult = await dashboardService.getUserActiveTrends30Days(null)

      console.log(`✅ UserTrends: Fetched new users trend (all users):`, newUsersResult)
      console.log(`✅ UserTrends: Fetched active users trend (all users):`, activeUsersResult)

      // Fill in missing dates for both datasets
      const filledNewUsers = fillMissingDates(newUsersResult, 'day')
      const filledActiveUsers = fillMissingDates(activeUsersResult, 'day')

      // Merge the two datasets by period
      const mergedData = mergeTrendData(filledNewUsers, filledActiveUsers)
      setTrendData(mergedData)
    } catch (err) {
      console.error(`❌ UserTrends: Failed to fetch data:`, err)
      setError(err?.message || 'Failed to load user trends')
    } finally {
      setLoading(false)
    }
  }

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
                <div className="stat-label">New Users</div>
                <div className="stat-value">
                  {totalData.newUsers30Days != null ? totalData.newUsers30Days.toLocaleString() : 'N/A'}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Users</div>
                <div className="stat-value">
                  {totalData.activeUsers != null ? totalData.activeUsers.toLocaleString() : 'N/A'}
                </div>
              </div>
              {/* <div className="stat-card">
                <div className="stat-label">New Users</div>
                <div className="stat-value">
                  {totalData.newUsers != null ? totalData.newUsers.toLocaleString() : 'N/A'}
                </div>
              </div> */}
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
            {trendData && trendData.length > 0 ? (
              <GroupedBarChart
                data={trendData}
                series={[
                  { dataKey: 'newUsers', color: '#8b5cf6', label: 'New Users' },
                  { dataKey: 'activeUsers', color: '#10b981', label: 'Active Users' }
                ]}
                height={240}
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

