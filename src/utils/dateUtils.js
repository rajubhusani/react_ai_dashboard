/**
 * Date Utility Functions
 * Helper functions for date manipulation and formatting
 */

import { DATE_CONFIG, DATE_FORMATS } from '../constants'

/**
 * Get default date range (last N days to today)
 * @param {number} daysBack - Number of days to go back (default: 7)
 * @returns {Object} Object with start and end date strings
 */
export const getDefaultDateRange = (daysBack = DATE_CONFIG.DEFAULT_DAYS_BACK) => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  return {
    start: formatDateToISO(startDate),
    end: formatDateToISO(endDate),
  }
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @returns {string} ISO formatted date string
 */
export const formatDateToISO = (date) => {
  return date.toISOString().split('T')[0]
}

/**
 * Get today's date in ISO format
 * @returns {string} Today's date in ISO format
 */
export const getTodayISO = () => {
  return formatDateToISO(new Date())
}

/**
 * Check if date is in the future
 * @param {string} dateString - Date string in ISO format
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (dateString) => {
  return dateString > getTodayISO()
}

/**
 * Validate date range
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @returns {Object} Validation result with isValid and errors
 */
export const validateDateRange = (startDate, endDate) => {
  const errors = []
  
  if (isFutureDate(startDate)) {
    errors.push('Start date cannot be in the future')
  }
  
  if (isFutureDate(endDate)) {
    errors.push('End date cannot be in the future')
  }
  
  if (startDate > endDate) {
    errors.push('Start date must be before or equal to end date')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Format date for display
 * @param {string|Date} date - Date string or Date object
 * @param {string} format - Format type ('short', 'medium', 'long')
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (date, format = 'short') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return date.toString()
  }
  
  const formatOptions = DATE_FORMATS[format.toUpperCase()] || DATE_FORMATS.SHORT
  return dateObj.toLocaleDateString('en-US', formatOptions)
}

/**
 * Check if date string is valid
 * @param {string} dateString - Date string
 * @returns {boolean} True if valid date
 */
export const isValidDate = (dateString) => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Calculate days between two dates
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @returns {number} Number of days between dates
 */
export const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

