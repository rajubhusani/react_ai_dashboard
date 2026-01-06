/**
 * Storage Utility Functions
 * Helper functions for localStorage operations
 */

import { STORAGE_KEYS } from '../constants'

/**
 * Get item from localStorage with JSON parsing
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed value or default value
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error)
    return defaultValue
  }
}

/**
 * Set item in localStorage with JSON stringification
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error)
    return false
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error)
    return false
  }
}

/**
 * Clear all items from localStorage
 * @returns {boolean} Success status
 */
export const clearStorage = () => {
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.error('Error clearing localStorage:', error)
    return false
  }
}

/**
 * Get date range from localStorage
 * @returns {Object|null} Date range object or null
 */
export const getDateRangeFromStorage = () => {
  return getStorageItem(STORAGE_KEYS.DATE_RANGE)
}

/**
 * Set date range in localStorage
 * @param {Object} dateRange - Date range object with start and end
 * @returns {boolean} Success status
 */
export const setDateRangeInStorage = (dateRange) => {
  return setStorageItem(STORAGE_KEYS.DATE_RANGE, dateRange)
}

/**
 * Get theme from localStorage
 * @returns {string} Theme value or default
 */
export const getThemeFromStorage = () => {
  return getStorageItem(STORAGE_KEYS.THEME, 'light')
}

/**
 * Set theme in localStorage
 * @param {string} theme - Theme value
 * @returns {boolean} Success status
 */
export const setThemeInStorage = (theme) => {
  return setStorageItem(STORAGE_KEYS.THEME, theme)
}

