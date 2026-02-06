import React, { useState, useEffect } from 'react'
import { dashboardService } from '../api/dashboardService'
import LineChart from './LineChart'
import { useDateRangeListener } from '../hooks'
import { useUserIdListener } from '../hooks/useUserIdListener'
import { formatNumber, formatMillisecondsToSeconds } from '../utils'
import {
  WIDGET_TITLES,
  METRIC_LABELS,
  LOADING_MESSAGES,
  CHART_COLORS,
  CHART_CONFIG
} from '../constants'
import { logSuccess, logError, logFetch } from '../utils'
import './AIUsage.css'

// Component name constant for logging
const COMPONENT_NAME = 'AIUsage'

// Metrics configuration
const METRICS = [
  {
    key: 'totalQueries',
    label: METRIC_LABELS.TOTAL_QUERIES,
    color: CHART_COLORS.PRIMARY
  },
  {
    key: 'uniqueUsers',
    label: METRIC_LABELS.UNIQUE_USERS,
    color: CHART_COLORS.SUCCESS
  },
  {
    key: 'avgResponseTime',
    label: METRIC_LABELS.AVG_RESPONSE_TIME,
    color: CHART_COLORS.WARNING
  }
]

const AIUsage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMetric, setSelectedMetric] = useState('totalQueries')
  const [accountCode, setAccountCode] = useState(() => {
    const saved = localStorage.getItem('accountCode')
    return saved || ''
  })

  // Use custom hook for date range listening
  const dateRange = useDateRangeListener(COMPONENT_NAME)
  const userId = useUserIdListener()

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, accountCode, userId])

  useEffect(() => {
    // Listen for account code changes from header
    const handleAccountCodeChange = (event) => {
      console.log('🟢 AIUsage: Account code changed:', event.detail)
      setAccountCode(event.detail)
    }

    window.addEventListener('accountCodeChange', handleAccountCodeChange)
    return () => window.removeEventListener('accountCodeChange', handleAccountCodeChange)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    logFetch(COMPONENT_NAME, 'Fetching data with dateRange', dateRange, 'accountCode', accountCode, 'userId', userId)

    try {
      const result = await dashboardService.getAIUsage(
        dateRange?.start,
        dateRange?.end,
        accountCode,
        userId
      )
      logSuccess(COMPONENT_NAME, `Successfully fetched ${result.length} records`)
      setData(result)
    } catch (err) {
      logError(COMPONENT_NAME, 'Failed to fetch data', err)
      setError(err?.message || 'Failed to load AI usage data')
    } finally {
      setLoading(false)
    }
  }

  const currentMetric = METRICS.find(m => m.key === selectedMetric)

  // Calculate summary stats
  const latestData = data[data.length - 1]
  const totalQueries = latestData?.totalQueries || 0
  const uniqueUsers = latestData?.uniqueUsers || 0
  const avgResponseTime = latestData?.avgResponseTime || 0
  const growthRate = latestData?.growthRate || 0

  return (
    <div className="widget ai-usage">
      <div className="widget-header">
        <h3>{WIDGET_TITLES.AI_USAGE}</h3>
      </div>

      {accountCode && (
        <div className="account-filter-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
          </svg>
          <span>Account: <strong>{accountCode}</strong></span>
        </div>
      )}

      {loading ? (
        <div className="loading">{LOADING_MESSAGES.DEFAULT}</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">{METRIC_LABELS.TOTAL_QUERIES}</div>
              <div className="stat-value">{formatNumber(totalQueries)}</div>
              {growthRate !== null && (
                <div className={`stat-change ${growthRate >= 0 ? 'positive' : 'negative'}`}>
                  {growthRate >= 0 ? '↑' : '↓'} {Math.abs(growthRate).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="stat-card">
              <div className="stat-label">{METRIC_LABELS.UNIQUE_USERS}</div>
              <div className="stat-value">{formatNumber(uniqueUsers)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg Response Time</div>
              <div className="stat-value">{formatMillisecondsToSeconds(avgResponseTime)}</div>
            </div>
          </div>

          <div className="metric-selector">
            {METRICS.map(metric => (
              <button
                key={metric.key}
                className={`metric-btn ${selectedMetric === metric.key ? 'active' : ''}`}
                onClick={() => setSelectedMetric(metric.key)}
                style={{
                  borderColor: selectedMetric === metric.key ? metric.color : 'transparent'
                }}
              >
                <span className="metric-dot" style={{ backgroundColor: metric.color }}></span>
                {metric.label}
              </button>
            ))}
          </div>

          <div className="chart-container">
            <LineChart
              data={data}
              dataKey={selectedMetric}
              color={currentMetric.color}
              height={CHART_CONFIG.LINE_CHART_HEIGHT}
            />
          </div>

          <div className="x-axis-labels">
            {data.map((item, index) => {
              // Show only first, middle, and last labels to avoid crowding
              if (index === 0 || index === Math.floor(data.length / 2) || index === data.length - 1) {
                const date = new Date(item.period)

                // Check if date is valid
                if (isNaN(date.getTime())) {
                  return <span key={index} className="x-label">{item.period}</span>
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
        </>
      )}
    </div>
  )
}

export default AIUsage

