import React, { useState, useEffect } from 'react'
import { useDateRangeListener } from '../hooks'
import { dashboardService } from '../api/dashboardService'
import InfoTooltip from './InfoTooltip'
import { widgetTooltips } from './widgetTooltips'
import './ProductFeedback.css'

const COMPONENT_NAME = 'ProductFeedback'

// Color palette for features
const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const ProductFeedback = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedFeatures, setExpandedFeatures] = useState({})

  const dateRange = useDateRangeListener(COMPONENT_NAME)

  // Toggle feature expansion
  const toggleFeature = (feature) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }))
  }

  // Check if feature has modules
  const hasModules = (modules) => {
    return modules && Array.isArray(modules) && modules.length > 0
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await dashboardService.getProductFeedback(
        dateRange?.start,
        dateRange?.end
      )
      setData(result)
    } catch (err) {
      console.error('❌ ProductFeedback: Error fetching data:', err)
      setError('Failed to load product feedback data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="widget product-feedback-widget">
        <div className="widget-header">
          <h2 className="widget-title">📱 Product Feedback</h2>
        </div>
        <div className="widget-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="widget product-feedback-widget">
        <div className="widget-header">
          <h2 className="widget-title">📱 Product Feedback</h2>
        </div>
        <div className="widget-content">
          <div className="error-message">{error}</div>
        </div>
      </div>
    )
  }

  const { summary, byFeature } = data || {}

  return (
    <div className="widget product-feedback-widget">
      <div className="widget-header">
        <h2 className="widget-title">📱 Product Feedback</h2>
        <InfoTooltip content={widgetTooltips.productFeedback} />
      </div>

      <div className="widget-content">
        {/* Summary Section */}
        <div className="feedback-summary">
          <div className="sentiment-cards">
            <div className="sentiment-card excited-card">
              <div className="sentiment-content">
                <div className="sentiment-label">Excited</div>
                <div className="sentiment-value">{summary?.excitedPercent?.toFixed(2) || '0.00'}%</div>
              </div>
              <div className="sentiment-emoji">🎉</div>
            </div>

            <div className="sentiment-card happy-card">
              <div className="sentiment-content">
                <div className="sentiment-label">Happy</div>
                <div className="sentiment-value">{summary?.happyPercent?.toFixed(2) || '0.00'}%</div>
              </div>
              <div className="sentiment-emoji">😊</div>
            </div>

            <div className="sentiment-card sad-card">
              <div className="sentiment-content">
                <div className="sentiment-label">Sad</div>
                <div className="sentiment-value">{summary?.sadPercent?.toFixed(2) || '0.00'}%</div>
              </div>
              <div className="sentiment-emoji">😔</div>
            </div>

            <div className="sentiment-card total-card">
              <div className="sentiment-content">
                <div className="sentiment-label">Total Feedback</div>
                <div className="sentiment-value">{summary?.totalFeedback || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* By Feature Section */}
        <div className="feedback-by-feature">
            <div className="features-legend">
              {byFeature && byFeature.length > 0 ? (
                byFeature.map((feature, index) => {
                  const hasModulesData = hasModules(feature.modules)
                  const isExpanded = expandedFeatures[feature.feature]

                  return (
                    <div key={index} className="legend-item">
                      <div
                        className={`legend-row ${hasModulesData ? 'expandable' : ''}`}
                        onClick={() => hasModulesData && toggleFeature(feature.feature)}
                      >
                        <div className="legend-left">
                          {hasModulesData && (
                            <svg
                              className={`chevron-icon ${isExpanded ? 'expanded' : ''}`}
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          )}
                          <div
                            className="legend-color"
                            style={{ backgroundColor: colors[index % colors.length] }}
                          ></div>
                          <span className="legend-label">{feature.feature}</span>
                        </div>
                        <div className="legend-right">
                          <span className="legend-count">{feature.count}</span>
                          <span className="legend-percentage">{feature.percentage}%</span>
                        </div>
                      </div>
                      <div className="legend-bar">
                        <div
                          className="legend-bar-fill"
                          style={{
                            width: `${feature.percentage}%`,
                            backgroundColor: colors[index % colors.length]
                          }}
                        ></div>
                      </div>

                      {/* Module Details */}
                      {hasModulesData && isExpanded && (
                        <div className="module-details">
                          {feature.modules.map((module, moduleIndex) => (
                            <div key={moduleIndex} className="module-item">
                              <div className="module-row">
                                <div className="module-left">
                                  <div
                                    className="module-dot"
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                  ></div>
                                  <span className="module-label">{module.module}</span>
                                </div>
                                <div className="module-right">
                                  <span className="module-count">{module.count}</span>
                                  <span className="module-percentage">{module.percentage}%</span>
                                </div>
                              </div>
                              <div className="module-bar">
                                <div
                                  className="module-bar-fill"
                                  style={{
                                    width: `${module.percentage}%`,
                                    backgroundColor: colors[index % colors.length],
                                    opacity: 0.7
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="no-data">No feedback data available</div>
              )}
            </div>
        </div>
      </div>
    </div>
  )
}

export default ProductFeedback

