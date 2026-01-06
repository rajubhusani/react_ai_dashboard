/**
 * useDateRangeListener Hook
 * Custom hook for listening to date range changes from global events
 */

import { useState, useEffect } from 'react'
import { getDateRangeFromStorage } from '../utils/storageUtils'
import { logInfo } from '../utils/logUtils'
import { EVENT_NAMES } from '../constants'

/**
 * Custom hook for listening to date range changes
 * @param {string} componentName - Name of the component using this hook (for logging)
 * @returns {Object} Date range state
 */
export const useDateRangeListener = (componentName = 'Component') => {
  const [dateRange, setDateRange] = useState(() => getDateRangeFromStorage())

  useEffect(() => {
    const handleDateRangeChange = (event) => {
      logInfo(componentName, 'Date range changed', event.detail)
      setDateRange(event.detail)
    }

    window.addEventListener(EVENT_NAMES.DATE_RANGE_CHANGE, handleDateRangeChange)
    
    return () => {
      window.removeEventListener(EVENT_NAMES.DATE_RANGE_CHANGE, handleDateRangeChange)
    }
  }, [componentName])

  return dateRange
}

