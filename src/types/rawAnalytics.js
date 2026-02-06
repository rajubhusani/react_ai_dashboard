/**
 * Raw Analytics Types (JavaScript)
 * JSDoc type definitions for raw analytics data from Redis
 */

/**
 * @typedef {Object} RawAnalyticsEntry
 * @property {string} userId
 * @property {string} query
 * @property {string} [response] - AI response text
 * @property {string} intent
 * @property {('positive' | 'negative' | 'neutral' | 'mixed' | 'unknown')} sentiment
 * @property {number} responseTime - in milliseconds
 * @property {string} timestamp - ISO date string
 * @property {string} [appFlavor] - App identifier (e.g., Comdata App, Corpay Fleet app)
 * @property {string} [sysAccountId] - System account identifier
 * @property {Object} [parameters]
 * @property {string} [parameters.action]
 * @property {string[]} [parameters.amenities]
 * @property {Object} [parameters.fuel]
 * @property {string[]} [parameters.fuel.fuel_type]
 * @property {string} [parameters.fuel.fuel_priority]
 * @property {string} [sessionId]
 */

/**
 * @typedef {Object} PaginationInfo
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} totalEntries - Total number of entries
 * @property {number} totalPages - Total number of pages
 * @property {boolean} hasNextPage - Whether there's a next page
 * @property {boolean} hasPrevPage - Whether there's a previous page
 */

/**
 * @typedef {Object} RawAnalyticsResponse
 * @property {RawAnalyticsEntry[]} entries - Array of analytics entries
 * @property {PaginationInfo} pagination - Pagination metadata
 */

/**
 * @typedef {Object} RawAnalyticsResponseLegacy
 * @property {RawAnalyticsEntry[]} data
 * @property {number} total
 * @property {string} timestamp
 */

/**
 * @typedef {Object} DateRangeFilter
 * @property {string} [startDate]
 * @property {string} [endDate]
 */

/**
 * @typedef {('day' | 'week' | 'month' | 'hour')} GroupByPeriod
 */

// Export constants for group by options
export const GroupByPeriods = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  HOUR: 'hour'
}

// Export sentiment types
export const SentimentTypes = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  NEUTRAL: 'neutral',
  MIXED: 'mixed',
  UNKNOWN: 'unknown'
}

// Helper function to validate sentiment
export const isValidSentiment = (sentiment) => {
  return Object.values(SentimentTypes).includes(sentiment)
}

// Helper function to validate group by period
export const isValidGroupByPeriod = (period) => {
  return Object.values(GroupByPeriods).includes(period)
}

