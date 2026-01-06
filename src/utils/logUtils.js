/**
 * Logging Utility Functions
 * Helper functions for consistent console logging
 */

import { LOG_PREFIXES } from '../constants'

/**
 * Log success message
 * @param {string} component - Component name
 * @param {string} message - Log message
 * @param {*} data - Optional data to log
 */
export const logSuccess = (component, message, data = null) => {
  console.log(`${LOG_PREFIXES.SUCCESS} ${component}: ${message}`, data || '')
}

/**
 * Log error message
 * @param {string} component - Component name
 * @param {string} message - Log message
 * @param {*} error - Error object or data
 */
export const logError = (component, message, error = null) => {
  console.error(`${LOG_PREFIXES.ERROR} ${component}: ${message}`, error || '')
}

/**
 * Log warning message
 * @param {string} component - Component name
 * @param {string} message - Log message
 * @param {*} data - Optional data to log
 */
export const logWarning = (component, message, data = null) => {
  console.warn(`${LOG_PREFIXES.WARNING} ${component}: ${message}`, data || '')
}

/**
 * Log info message
 * @param {string} component - Component name
 * @param {string} message - Log message
 * @param {*} data - Optional data to log
 */
export const logInfo = (component, message, data = null) => {
  console.log(`${LOG_PREFIXES.INFO} ${component}: ${message}`, data || '')
}

/**
 * Log debug message
 * @param {string} component - Component name
 * @param {string} message - Log message
 * @param {*} data - Optional data to log
 */
export const logDebug = (component, message, data = null) => {
  console.log(`${LOG_PREFIXES.DEBUG} ${component}: ${message}`, data || '')
}

/**
 * Log fetch operation
 * @param {string} component - Component name
 * @param {string} message - Log message
 * @param {*} data - Optional data to log
 */
export const logFetch = (component, message, data = null) => {
  console.log(`${LOG_PREFIXES.FETCH} ${component}: ${message}`, data || '')
}

/**
 * Log mock data usage
 * @param {string} component - Component name
 * @param {string} message - Log message
 * @param {*} data - Optional data to log
 */
export const logMock = (component, message, data = null) => {
  console.log(`${LOG_PREFIXES.MOCK} ${component}: ${message}`, data || '')
}

