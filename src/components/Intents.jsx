import React, { useState, useEffect } from 'react'
import { dashboardService } from '../api/dashboardService'
import PieChart from './PieChart'
import InfoTooltip from './InfoTooltip'
import { widgetTooltips } from './widgetTooltips'
import './Intents.css'

const Intents = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedIntents, setExpandedIntents] = useState({})
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
      console.log('🟡 Intents: Date range changed:', event.detail)
      setDateRange(event.detail)
    }

    // Listen for account code changes from header
    const handleAccountCodeChange = (event) => {
      console.log('🟡 Intents: Account code changed:', event.detail)
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
    console.log(`🟡 Intents: Fetching data with dateRange=`, dateRange, 'accountCode=', accountCode)
    try {
      const result = await dashboardService.getIntents(
        dateRange?.start,
        dateRange?.end,
        accountCode
      )
      console.log(`✅ Intents: Successfully fetched data:`, result)
      console.log(`   - totalQueries: ${result?.totalQueries}`)
      console.log(`   - intents count: ${result?.intents?.length}`)
      console.log(`   - intents:`, result?.intents)

      if (result && result.intents && Array.isArray(result.intents) && result.intents.length > 0) {
        console.log('✅ Intents: Setting API data')
        setData(result)
      } else {
        console.warn('⚠️ Intents: Invalid data structure from API')
        setError('Invalid data received from server.')
      }
    } catch (err) {
      console.error('❌ Intents: Failed to fetch data:', err)
      setError(err?.message || 'Failed to load intents data')
    } finally {
      setLoading(false)
    }
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  // Format intent name for display
  const formatIntentName = (intent) => {
    const intentNameMap = {
      'SITE_LOCATOR': 'Site Locator',
      'FUEL_SEARCH': 'Site Locator',
      'AMENITY_SEARCH': 'Site Locator - Amenities',
      'CARD_MANAGEMENT': 'Card Management',
      'ACCOUNT_MANAGEMENT': 'Account Management',
      'ERROR': 'Error',
      'FUEL_CODE': 'Fuel Code'
    }
    return intentNameMap[intent] || intent.replace(/_/g, ' ')
  }

  // Transform data for PieChart
  const chartData = data?.intents?.map(item => ({
    label: formatIntentName(item.intent),
    value: item.count
  })) || []

  console.log('📊 Intents chartData:', chartData)
  console.log('📊 Intents data state:', data)

  // Toggle intent expansion
  const toggleIntent = (intent) => {
    setExpandedIntents(prev => ({
      ...prev,
      [intent]: !prev[intent]
    }))
  }

  // Check if intent has parameters
  const hasParameters = (parameterUsage) => {
    if (!parameterUsage) return false
    return Object.keys(parameterUsage).some(key =>
      parameterUsage[key] && Array.isArray(parameterUsage[key]) && parameterUsage[key].length > 0
    )
  }

  // Format parameter name for display
  const formatParameterName = (key) => {
    const paramNameMap = {
      'fuel_priorities': 'Proximity',
      'fuel_types': 'Fuel Types',
      'amenities': 'Amenities',
      'actions': 'Actions'
    }
    return paramNameMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Format parameter value for display
  const formatParameterValue = (value) => {
    const valueMap = {
      'statement_date': 'Statement Date',
      'due_date': 'Due Date'
    }
    return valueMap[value] || value
  }

  // Calculate percentage for parameter items
  const calculateParameterPercentage = (paramCount, intentCount) => {
    return ((paramCount / intentCount) * 100).toFixed(1)
  }

  // Aggregate parameters across all intents for proper grouping
  const aggregateParameters = (intents) => {
    const aggregated = {}

    // First pass: merge FUEL_SEARCH, AMENITY_SEARCH into SITE_LOCATOR and CARD_UNLOCK into CARD_MANAGEMENT
    const processedIntents = []
    let fuelSearchIntent = null
    let amenitySearchIntent = null
    let cardManagementIntent = null
    let cardUnlockIntent = null

    intents.forEach(intent => {
      if (intent.intent === 'FUEL_SEARCH') {
        fuelSearchIntent = intent
      } else if (intent.intent === 'AMENITY_SEARCH') {
        amenitySearchIntent = intent
      } else if (intent.intent === 'CARD_MANAGEMENT') {
        cardManagementIntent = intent
      } else if (intent.intent === 'CARD_UNLOCK') {
        cardUnlockIntent = intent
      } else {
        processedIntents.push(intent)
      }
    })

    // Merge FUEL_SEARCH and AMENITY_SEARCH into SITE_LOCATOR
    if (fuelSearchIntent || amenitySearchIntent) {
      const mergedIntent = {
        intent: 'SITE_LOCATOR',
        count: (fuelSearchIntent?.count || 0) + (amenitySearchIntent?.count || 0),
        percentage: ((((fuelSearchIntent?.count || 0) + (amenitySearchIntent?.count || 0)) /
                     intents.reduce((sum, i) => sum + i.count, 0)) * 100).toFixed(2),
        parameterUsage: {
          fuel_types: [],
          fuel_priorities: [],
          amenities: []
        }
      }

      // Collect fuel_types and fuel_priorities from all intents (including FUEL_CODE, etc.)
      intents.forEach(intent => {
        if (intent.parameterUsage?.fuel_types) {
          mergedIntent.parameterUsage.fuel_types.push(...intent.parameterUsage.fuel_types)
        }
        if (intent.parameterUsage?.fuel_priorities) {
          mergedIntent.parameterUsage.fuel_priorities.push(...intent.parameterUsage.fuel_priorities)
        }
      })

      // Collect amenities from AMENITY_SEARCH
      if (amenitySearchIntent?.parameterUsage?.amenities) {
        mergedIntent.parameterUsage.amenities.push(...amenitySearchIntent.parameterUsage.amenities)
      }

      // Merge and deduplicate fuel_types
      const fuelTypesMap = {}
      mergedIntent.parameterUsage.fuel_types.forEach(item => {
        const key = item.fuel_type
        if (fuelTypesMap[key]) {
          fuelTypesMap[key].count += item.count
        } else {
          fuelTypesMap[key] = { ...item }
        }
      })
      mergedIntent.parameterUsage.fuel_types = Object.values(fuelTypesMap).sort((a, b) => b.count - a.count)

      // Merge and deduplicate fuel_priorities
      const fuelPrioritiesMap = {}
      mergedIntent.parameterUsage.fuel_priorities.forEach(item => {
        const key = item.fuel_priority
        if (fuelPrioritiesMap[key]) {
          fuelPrioritiesMap[key].count += item.count
        } else {
          fuelPrioritiesMap[key] = { ...item }
        }
      })
      mergedIntent.parameterUsage.fuel_priorities = Object.values(fuelPrioritiesMap).sort((a, b) => b.count - a.count)

      // Sort amenities
      mergedIntent.parameterUsage.amenities = mergedIntent.parameterUsage.amenities.sort((a, b) => b.count - a.count)

      processedIntents.push(mergedIntent)
    }

    // Merge CARD_UNLOCK into CARD_MANAGEMENT
    if (cardManagementIntent || cardUnlockIntent) {
      const mergedIntent = {
        intent: 'CARD_MANAGEMENT',
        count: (cardManagementIntent?.count || 0) + (cardUnlockIntent?.count || 0),
        percentage: ((((cardManagementIntent?.count || 0) + (cardUnlockIntent?.count || 0)) /
                     intents.reduce((sum, i) => sum + i.count, 0)) * 100).toFixed(2),
        parameterUsage: {
          actions: []
        }
      }

      // Collect actions from both intents
      if (cardManagementIntent?.parameterUsage?.actions) {
        mergedIntent.parameterUsage.actions.push(...cardManagementIntent.parameterUsage.actions)
      }
      if (cardUnlockIntent?.parameterUsage?.actions) {
        mergedIntent.parameterUsage.actions.push(...cardUnlockIntent.parameterUsage.actions)
      }

      // Add "unlock" action from CARD_UNLOCK count
      if (cardUnlockIntent) {
        mergedIntent.parameterUsage.actions.push({
          action: 'unlock',
          count: cardUnlockIntent.count
        })
      }

      processedIntents.push(mergedIntent)
    }

    processedIntents.forEach(intent => {
      // Initialize aggregated data for this intent
      if (!aggregated[intent.intent]) {
        aggregated[intent.intent] = {
          ...intent,
          aggregatedParams: {}
        }
      }

      // For SITE_LOCATOR: already has fuel_types, fuel_priorities, and amenities merged
      if (intent.intent === 'SITE_LOCATOR') {
        aggregated[intent.intent].aggregatedParams = {
          fuel_types: intent.parameterUsage?.fuel_types || [],
          fuel_priorities: intent.parameterUsage?.fuel_priorities || [],
          amenities: intent.parameterUsage?.amenities || []
        }
      }
      // For other intents: show their own parameters (excluding fuel_types, fuel_priorities, and amenities)
      else {
        aggregated[intent.intent].aggregatedParams = {}
        if (intent.parameterUsage) {
          Object.entries(intent.parameterUsage).forEach(([key, value]) => {
            // Exclude fuel_types, fuel_priorities, and amenities from non-SITE_LOCATOR intents
            if (key !== 'fuel_types' && key !== 'fuel_priorities' && key !== 'amenities') {
              // Sort parameter values by count
              aggregated[intent.intent].aggregatedParams[key] = Array.isArray(value)
                ? value.sort((a, b) => b.count - a.count)
                : value
            }
          })
        }
      }
    })

    return Object.values(aggregated)
  }

  // Get aggregated data and sort by percentage (descending)
  const aggregatedIntents = data?.intents
    ? aggregateParameters(data.intents).sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))
    : []

  return (
    <div className="widget intents">
      <div className="widget-header">
        <h3>Overall Intent Distribution</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <InfoTooltip content={widgetTooltips.intents} />
          <button className="refresh-btn" onClick={fetchData} disabled={loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="intents-summary">
            <div className="total-queries">
              <div className="total-label">Total Prompts</div>
              <div className="total-value">{data?.totalQueries?.toLocaleString() || 0}</div>
            </div>
          </div>

          <div className="intents-content">
            <div className="chart-wrapper">
              <PieChart data={chartData} size={200} />
            </div>

            <div className="intents-legend">
            {aggregatedIntents.map((item, index) => {
              const hasParams = hasParameters(item.aggregatedParams)
              const isExpanded = expandedIntents[item.intent]

              return (
                <div key={index} className="legend-item">
                  <div
                    className={`legend-row ${hasParams ? 'expandable' : ''}`}
                    onClick={() => hasParams && toggleIntent(item.intent)}
                  >
                    <div className="legend-left">
                      {hasParams && (
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
                      <span className="legend-label">{formatIntentName(item.intent)}</span>
                    </div>
                    <div className="legend-right">
                      <span className="legend-count">{item.count.toLocaleString()}</span>
                      <span className="legend-percentage">{item.percentage}%</span>
                    </div>
                  </div>
                  <div className="legend-bar">
                    <div
                      className="legend-bar-fill"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: colors[index % colors.length]
                      }}
                    ></div>
                  </div>

                  {/* Parameter Details */}
                  {hasParams && isExpanded && (
                    <div className="parameter-details">
                      {Object.entries(item.aggregatedParams).map(([paramKey, paramValues]) => {
                        if (!paramValues || !Array.isArray(paramValues) || paramValues.length === 0) return null

                        return (
                          <div key={paramKey} className="parameter-group">
                            <div className="parameter-group-title">
                              {formatParameterName(paramKey)}
                            </div>
                            {paramValues.map((paramItem, paramIndex) => {
                              // Get the actual value (could be 'action', 'amenity', 'fuel_type', etc.)
                              const valueKey = Object.keys(paramItem).find(k => k !== 'count')
                              const value = paramItem[valueKey]
                              const count = paramItem.count
                              const percentage = calculateParameterPercentage(count, item.count)

                              return (
                                <div key={paramIndex} className="parameter-item">
                                  <div className="parameter-row">
                                    <div className="parameter-left">
                                      <div
                                        className="parameter-dot"
                                        style={{ backgroundColor: colors[index % colors.length] }}
                                      ></div>
                                      <span className="parameter-label">{formatParameterValue(value)}</span>
                                    </div>
                                    <div className="parameter-right">
                                      <span className="parameter-count">{count}</span>
                                      <span className="parameter-percentage">{percentage}%</span>
                                    </div>
                                  </div>
                                  <div className="parameter-bar">
                                    <div
                                      className="parameter-bar-fill"
                                      style={{
                                        width: `${percentage}%`,
                                        backgroundColor: colors[index % colors.length],
                                        opacity: 0.6
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Intents

