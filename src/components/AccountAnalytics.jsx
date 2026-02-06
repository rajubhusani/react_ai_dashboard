import React, { useState, useEffect } from 'react'
import { dashboardService } from '../api/dashboardService'
import AreaChart from './AreaChart'
import InfoTooltip from './InfoTooltip'
import { widgetTooltips } from './widgetTooltips'
import { useUserIdListener } from '../hooks/useUserIdListener'
import './AccountAnalytics.css'

const AccountAnalytics = () => {
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
  const userId = useUserIdListener()

  useEffect(() => {
    fetchData()
  }, [dateRange, accountCode, userId])

  useEffect(() => {
    // Listen for date range changes from header
    const handleDateRangeChange = (event) => {
      console.log('🟢 AccountAnalytics: Date range changed:', event.detail)
      setDateRange(event.detail)
    }

    // Listen for account code changes from header
    const handleAccountCodeChange = (event) => {
      console.log('🟢 AccountAnalytics: Account code changed:', event.detail)
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
    console.log(`🟢 AccountAnalytics: Fetching data with dateRange=`, dateRange, 'accountCode=', accountCode, 'userId=', userId)
    try {
      const result = await dashboardService.getAccountAnalytics(
        accountCode,
        dateRange?.start,
        dateRange?.end,
        userId
      )
      console.log(`✅ AccountAnalytics: Successfully fetched ${result.length} records`)

      // Sort data by date in ascending order and transform to match AreaChart expectations
      const sortedData = [...result].sort((a, b) => {
        const dateA = new Date(a.period)
        const dateB = new Date(b.period)
        return dateA - dateB
      }).map(item => ({
        ...item,
        time: item.period, // Add 'time' field for AreaChart tooltip
        count: item.totalQueries // Add 'count' field as alias
      }))
      console.log(`📊 AccountAnalytics: Sorted data from ${sortedData[0]?.period} to ${sortedData[sortedData.length - 1]?.period}`)

      setData(sortedData)
    } catch (err) {
      console.error('❌ AccountAnalytics: Failed to fetch data:', err)
      setError('Failed to load account analytics data')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary stats
  const totalQueries = data.reduce((sum, item) => sum + item.totalQueries, 0)
  const avgQueries = data.length > 0 ? Math.round(totalQueries / data.length) : 0
  const maxQueries = data.length > 0 ? Math.max(...data.map(item => item.totalQueries)) : 0
  const minQueries = data.length > 0 ? Math.min(...data.map(item => item.totalQueries)) : 0

  // Calculate unique users across all periods
  const totalUniqueUsers = data.reduce((sum, item) => sum + item.uniqueUsers, 0)
  const avgUniqueUsers = data.length > 0 ? Math.round(totalUniqueUsers / data.length) : 0

  // Calculate trend direction
  const firstHalf = data.slice(0, Math.floor(data.length / 2))
  const secondHalf = data.slice(Math.floor(data.length / 2))
  const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.totalQueries, 0) / (firstHalf.length || 1)
  const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.totalQueries, 0) / (secondHalf.length || 1)
  const trendPercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0

  return (
    <div className="widget account-analytics">
      <div className="widget-header">
        <h3>Account Analytics</h3>
        <InfoTooltip content={widgetTooltips.accountAnalytics} />
      </div>

      {accountCode && (
        <div className="account-filter-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
          </svg>
          <span>Filtered by account: <strong>{accountCode}</strong></span>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : data.length === 0 ? (
        <div className="no-data">No data available for the selected criteria</div>
      ) : (
        <>
          <div className="account-summary">
            <div className="summary-item">
              <div className="summary-label">Total Queries</div>
              <div className="summary-value">{totalQueries.toLocaleString()}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Avg Daily</div>
              <div className="summary-value">{avgQueries.toLocaleString()}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Avg Users</div>
              <div className="summary-value">{avgUniqueUsers.toLocaleString()}</div>
            </div>
          </div>

          <div className="chart-container">
            <AreaChart
              data={data}
              dataKey="totalQueries"
              color="#3b82f6"
              height={220}
              tooltipLabel="Queries"
            />
          </div>
        </>
      )}
    </div>
  )
}

export default AccountAnalytics

