/**
 * Formatting Utility Functions
 * Helper functions for formatting numbers, text, etc.
 */

import { NUMBER_FORMAT, INTENT_NAMES, PARAMETER_NAMES, PARAMETER_VALUES } from '../constants'

/**
 * Format number with locale
 * @param {number} value - Number to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, locale = NUMBER_FORMAT.LOCALE) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  return value.toLocaleString(locale)
}

/**
 * Format percentage
 * @param {number} value - Number to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = NUMBER_FORMAT.PERCENTAGE_DECIMAL_PLACES) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%'
  }
  return `${value.toFixed(decimals)}%`
}

/**
 * Format duration in seconds to human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string (e.g., "2m 30s")
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds === 0) {
    return '0s'
  }
  
  if (seconds < 60) {
    return `${seconds}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  
  return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`
}

/**
 * Format milliseconds to seconds
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted duration in seconds
 */
export const formatMillisecondsToSeconds = (milliseconds) => {
  if (!milliseconds || isNaN(milliseconds)) {
    return '0s'
  }
  return `${(milliseconds / 1000).toLocaleString()}s`
}

/**
 * Format intent name for display
 * @param {string} intent - Intent key
 * @returns {string} Formatted intent name
 */
export const formatIntentName = (intent) => {
  return INTENT_NAMES[intent] || intent.replace(/_/g, ' ')
}

/**
 * Format parameter name for display
 * @param {string} paramKey - Parameter key
 * @returns {string} Formatted parameter name
 */
export const formatParameterName = (paramKey) => {
  return PARAMETER_NAMES[paramKey] || paramKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Format parameter value for display
 * @param {string} value - Parameter value
 * @returns {string} Formatted parameter value
 */
export const formatParameterValue = (value) => {
  return PARAMETER_VALUES[value] || value
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert snake_case to Title Case
 * @param {string} str - Snake case string
 * @returns {string} Title case string
 */
export const snakeToTitleCase = (str) => {
  if (!str) return ''
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

