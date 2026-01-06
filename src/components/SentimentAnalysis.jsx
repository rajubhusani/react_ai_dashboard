import React, { useState, useEffect, useRef } from 'react'
import { dashboardService } from '../api/dashboardService'
import InfoTooltip from './InfoTooltip'
import { widgetTooltips } from './widgetTooltips'
import './SentimentAnalysis.css'

const SentimentAnalysis = () => {
  const [sentimentData, setSentimentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null })
  const [trendData, setTrendData] = useState([])
  const [accountCode, setAccountCode] = useState(() => {
    const saved = localStorage.getItem('accountCode')
    return saved || ''
  })
  const [dateRange, setDateRange] = useState(() => {
    const saved = localStorage.getItem('dateRange')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    console.log('📅 SentimentAnalysis: useEffect triggered with dateRange:', dateRange, 'accountCode:', accountCode)
    fetchSentimentData()
  }, [dateRange, accountCode])

  useEffect(() => {
    // Listen for date range changes
    const handleDateRangeChange = (event) => {
      console.log('📅 SentimentAnalysis: Date range changed event received:', event.detail)
      setDateRange(event.detail)
    }

    // Listen for account code changes from header
    const handleAccountCodeChange = (event) => {
      console.log('📅 SentimentAnalysis: Account code changed:', event.detail)
      setAccountCode(event.detail)
    }

    window.addEventListener('dateRangeChange', handleDateRangeChange)
    window.addEventListener('accountCodeChange', handleAccountCodeChange)
    console.log('📅 SentimentAnalysis: Event listeners registered')

    return () => {
      window.removeEventListener('dateRangeChange', handleDateRangeChange)
      window.removeEventListener('accountCodeChange', handleAccountCodeChange)
    }
  }, [])

  const fetchSentimentData = async () => {
    try {
      console.log('📅 SentimentAnalysis: fetchSentimentData called')
      setLoading(true)
      setError(null)

      // Get date range - use 'start' and 'end' keys from Header component
      let startDate, endDate

      if (dateRange) {
        startDate = dateRange.start
        endDate = dateRange.end
        console.log('📅 SentimentAnalysis: Using date range:', { startDate, endDate })
      } else {
        console.log('📅 SentimentAnalysis: No date range available, calling API without dates')
      }

      console.log('📅 SentimentAnalysis: Calling getSentiment API with:', { startDate, endDate, accountCode })
      const data = await dashboardService.getSentiment(startDate, endDate, accountCode)
      console.log('😊 SentimentAnalysis: Received data:', data)
      console.log('😊 SentimentAnalysis: totalQueries:', data.totalQueries)
      console.log('😊 SentimentAnalysis: satisfactionScore:', data.satisfactionScore)
      console.log('😊 SentimentAnalysis: sentimentDistribution:', data.sentimentDistribution)
      console.log('😊 SentimentAnalysis: dateWiseSentiments:', data.dateWiseSentiments)
      setSentimentData(data)

      // Use real date-wise sentiment data from API
      if (data.dateWiseSentiments && data.dateWiseSentiments.length > 0) {
        const trend = data.dateWiseSentiments.map(dayData => ({
          date: dayData.date,
          displayDate: new Date(dayData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          positive: dayData.sentimentPercentages.positivePercent || 0,
          negative: dayData.sentimentPercentages.negativePercent || 0,
          neutral: dayData.sentimentPercentages.neutralPercent || 0,
          mixed: dayData.sentimentPercentages.mixedPercent || 0,
          unknown: dayData.sentimentPercentages.unknownPercent || 0,
          totalQueries: dayData.totalQueries
        }))
        setTrendData(trend)
        console.log('📊 SentimentAnalysis: Using real date-wise trend data:', trend)
      } else {
        // Fallback to empty array if no date-wise data
        setTrendData([])
        console.log('📊 SentimentAnalysis: No date-wise data available')
      }
    } catch (err) {
      console.error('❌ SentimentAnalysis: Error fetching data:', err)
      setError('Failed to load sentiment data')
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment) => {
    const colors = {
      positive: '#10b981',
      negative: '#ef4444',
      neutral: '#73787eff',
      mixed: '#f59e0b',
      unknown: '#9cabc3ff'
    }
    return colors[sentiment.toLowerCase()] || '#9ca3af'
  }

  const getSentimentEmoji = (sentiment) => {
    const emojis = {
      positive: '😊',
      negative: '😔',
      neutral: '😐',
      mixed: '🤔',
      unknown: '😶'
    }
    return emojis[sentiment.toLowerCase()] || '❓'
  }

  const getSentimentBgColor = (sentiment) => {
    const bgColors = {
      positive: '#d1fae5',
      negative: '#fecaca',
      neutral: '#fef3c7',
      mixed: '#e5e7eb',
      unknown: '#aebed9ff'
    }
    return bgColors[sentiment.toLowerCase()] || '#f3f4f6'
  }

  const getSentimentTextColor = (sentiment) => {
    const textColors = {
      positive: '#059669',
      negative: '#dc2626',
      neutral: '#d97706',
      mixed: '#374151',
      unknown: '#6b7280'
    }
    return textColors[sentiment.toLowerCase()] || '#6b7280'
  }

  if (loading) {
    return (
      <div className="sentiment-analysis">
        <div className="widget-header">
          <h3>😊 Sentiment snapshot</h3>
        </div>
        <div className="widget-content">
          <div className="loading">Loading sentiment data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="sentiment-analysis">
        <div className="widget-header">
          <h3>😊 Sentiment snapshot</h3>
        </div>
        <div className="widget-content">
          <div className="error">{error}</div>
        </div>
      </div>
    )
  }

  if (!sentimentData) {
    return null
  }

  // Calculate positive sentiment trend (mock for now - would need historical data)
  const positiveTrend = sentimentData.positivePercent

  return (
    <div className="sentiment-analysis">
      <div className="widget-header">
        <h3>Sentiment snapshot</h3>
        <InfoTooltip content={widgetTooltips.sentimentAnalysis} />
      </div>

      <div className="widget-content">
        {/* Top Cards Row */}
        <div className="sentiment-cards-row">
          {/* Sentiment Distribution Cards - Always show all 5 sentiments */}
          {['positive', 'negative', 'neutral', 'mixed', 'unknown'].map((sentiment) => {
            // Find the sentiment data from API, or use 0% if not present
            const sentimentItem = sentimentData.sentimentDistribution.find(
              item => item.sentiment.toLowerCase() === sentiment
            )
            const percentage = sentimentItem ? sentimentItem.percentage : 0

            return (
              <div
                key={sentiment}
                className={`sentiment-card sentiment-${sentiment}`}
                style={{ backgroundColor: getSentimentBgColor(sentiment) }}
              >
                <div className="card-content">
                  <div className="card-text">
                    <div className="card-label">
                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </div>
                    <div
                      className="card-value"
                      style={{ color: getSentimentTextColor(sentiment) }}
                    >
                      {percentage}%
                    </div>
                  </div>
                  <div className="card-emoji">{getSentimentEmoji(sentiment)}</div>
                </div>
              </div>
            )
          })}

          {/* Total Prompts Card */}
          <div className="sentiment-card info-card total-card">
            <div className="card-content">
              <div className="card-text">
                <div className="card-label">Total prompts</div>
                <div className="card-value">{sentimentData.totalQueries || 0}</div>
              </div>
            </div>
          </div>

          {/* Satisfaction Card */}
          <div className="sentiment-card info-card satisfaction-card">
            <div className="card-content">
              <div className="card-text">
                <div className="card-label">Satisfaction</div>
                <div className="card-value">
                  {sentimentData.satisfactionScore ? sentimentData.satisfactionScore.toFixed(1) : '0.0'}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Charts */}
        <div className="sentiment-charts-row">
          {/* Left - Prompts per sentiment */}
          <div className="prompts-section">
            <h4 className="section-title">Prompts per sentiment</h4>
            <div className="prompts-list">
              {['positive', 'negative', 'neutral', 'mixed', 'unknown'].map((sentiment) => {
                // Find the sentiment data from API, or use 0 if not present
                const sentimentItem = sentimentData.sentimentDistribution.find(
                  item => item.sentiment.toLowerCase() === sentiment
                )
                const count = sentimentItem ? sentimentItem.count : 0
                const percentage = sentimentItem ? sentimentItem.percentage : 0

                return (
                  <div key={sentiment} className="prompt-item">
                    <div className="prompt-label">
                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </div>
                    <div className="prompt-count">{count}</div>
                    <div className="prompt-bar-container">
                      <div
                        className="prompt-bar"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getSentimentColor(sentiment)
                        }}
                      ></div>
                    </div>
                    <div className="prompt-percentage">{percentage}%</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Middle - Sentiment trend */}
          <div className="trend-section">
            <h4 className="section-title">Sentiment trend</h4>
            <div className="trend-chart-placeholder">
              <div className="trend-bars">
                {trendData.map((dayData, idx) => {
                  // Calculate total for normalization
                  const total = dayData.positive + dayData.negative + dayData.neutral + dayData.mixed + dayData.unknown
                  const maxHeight = 100 // Max height in percentage

                  return (
                    <div
                      key={idx}
                      className="trend-bar-group"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setTooltip({
                          visible: true,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 10,
                          data: dayData
                        })
                      }}
                      onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, data: null })}
                    >
                      {/* Single stacked bar container */}
                      <div className="trend-bar-stack">
                        {/* Stack bars from bottom to top - only show bars with data */}
                        {dayData.positive > 0 && (
                          <div
                            className="trend-bar-segment positive"
                            style={{
                              height: `${(dayData.positive / total) * maxHeight}%`,
                              backgroundColor: getSentimentColor('positive')
                            }}
                          ></div>
                        )}
                        {dayData.negative > 0 && (
                          <div
                            className="trend-bar-segment negative"
                            style={{
                              height: `${(dayData.negative / total) * maxHeight}%`,
                              backgroundColor: getSentimentColor('negative')
                            }}
                          ></div>
                        )}
                        {dayData.neutral > 0 && (
                          <div
                            className="trend-bar-segment neutral"
                            style={{
                              height: `${(dayData.neutral / total) * maxHeight}%`,
                              backgroundColor: getSentimentColor('neutral')
                            }}
                          ></div>
                        )}
                        {dayData.mixed > 0 && (
                          <div
                            className="trend-bar-segment mixed"
                            style={{
                              height: `${(dayData.mixed / total) * maxHeight}%`,
                              backgroundColor: getSentimentColor('mixed')
                            }}
                          ></div>
                        )}
                        {dayData.unknown > 0 && (
                          <div
                            className="trend-bar-segment unknown"
                            style={{
                              height: `${(dayData.unknown / total) * maxHeight}%`,
                              backgroundColor: getSentimentColor('unknown')
                            }}
                          ></div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* X-axis labels */}
              <div className="trend-x-axis">
                {trendData.map((dayData, idx) => (
                  <div key={idx} className="trend-x-label">{dayData.displayDate}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Positive sentiment indicator (text only) */}
          <div className="positive-sentiment-section">
            <h4 className="section-title">Positive sentiment: <span className="trend-up">↑ {positiveTrend.toFixed(2)}%</span></h4>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && tooltip.data && (
        <div
          className="sentiment-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          <div className="tooltip-date">{tooltip.data.displayDate}</div>
          <div className="tooltip-content">
            <div className="tooltip-item">
              <span className="tooltip-dot" style={{ backgroundColor: getSentimentColor('positive') }}></span>
              <span className="tooltip-label">Positive:</span>
              <span className="tooltip-value">{tooltip.data.positive.toFixed(1)}%</span>
            </div>
            <div className="tooltip-item">
              <span className="tooltip-dot" style={{ backgroundColor: getSentimentColor('negative') }}></span>
              <span className="tooltip-label">Negative:</span>
              <span className="tooltip-value">{tooltip.data.negative.toFixed(1)}%</span>
            </div>
            <div className="tooltip-item">
              <span className="tooltip-dot" style={{ backgroundColor: getSentimentColor('neutral') }}></span>
              <span className="tooltip-label">Neutral:</span>
              <span className="tooltip-value">{tooltip.data.neutral.toFixed(1)}%</span>
            </div>
            <div className="tooltip-item">
              <span className="tooltip-dot" style={{ backgroundColor: getSentimentColor('mixed') }}></span>
              <span className="tooltip-label">Mixed:</span>
              <span className="tooltip-value">{tooltip.data.mixed.toFixed(1)}%</span>
            </div>
            <div className="tooltip-item">
              <span className="tooltip-dot" style={{ backgroundColor: getSentimentColor('unknown') }}></span>
              <span className="tooltip-label">Unknown:</span>
              <span className="tooltip-value">{tooltip.data.unknown.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SentimentAnalysis

