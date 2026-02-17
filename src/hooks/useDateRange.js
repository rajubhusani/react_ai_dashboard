/**
 * useDateRange Hook
 * Custom hook for managing date range state with localStorage sync
 */

import { useState, useEffect } from 'react'
import { getDefaultDateRange, getTodayISO } from '../utils/dateUtils'
import { getDateRangeFromStorage, setDateRangeInStorage } from '../utils/storageUtils'
import { logWarning } from '../utils/logUtils'
import { EVENT_NAMES } from '../constants'

/**
 * Custom hook for date range management
 * @returns {Object} Date range state and handlers
 */
export const useDateRange = () => {
  const [dateRange, setDateRange] = useState(() => {
    const saved = getDateRangeFromStorage()
    
    if (saved) {
      const today = getTodayISO()
      let { start, end } = saved
      
      // Validate saved date range
      if (end > today) {
        logWarning('useDateRange', 'Saved end date is in the future. Resetting to today.')
        end = today
      }
      
      if (start > today) {
        logWarning('useDateRange', 'Saved start date is in the future. Resetting to today.')
        start = today
      }
      
      if (start > end) {
        logWarning('useDateRange', 'Saved start date is after end date. Resetting to default.')
        return getDefaultDateRange()
      }
      
      return { start, end }
    }
    
    return getDefaultDateRange()
  })

  // Save to localStorage whenever date range changes
  useEffect(() => {
    setDateRangeInStorage(dateRange)
    
    // Dispatch custom event for other components
    window.dispatchEvent(
      new CustomEvent(EVENT_NAMES.DATE_RANGE_CHANGE, { detail: dateRange })
    )
  }, [dateRange])

  /**
   * Calculate the number of days between two dates
   */
  const getDaysDifference = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  /**
   * Update date range with validation
   */
  const handleDateChange = (type, value) => {
    const today = getTodayISO()
    const MAX_DAYS = 90

    // Validate that the selected date is not in the future
    if (value > today) {
      logWarning('useDateRange', `${type} date cannot be in the future. Resetting to today.`)
      value = today
    }

    // If changing start date, validate it's not after end date
    if (type === 'start') {
      const endDate = dateRange.end
      if (value > endDate) {
        logWarning('useDateRange', 'Start date cannot be after end date. Adjusting end date.')
        setDateRange({ start: value, end: value })
        return
      }

      // Check if date range exceeds 90 days
      const daysDiff = getDaysDifference(value, endDate)
      if (daysDiff > MAX_DAYS) {
        logWarning('useDateRange', `Date range cannot exceed ${MAX_DAYS} days. Adjusting end date.`)
        // Calculate new end date that is 30 days from start
        const newEndDate = new Date(value)
        newEndDate.setDate(newEndDate.getDate() + MAX_DAYS)
        const newEnd = newEndDate > new Date(today) ? today : newEndDate.toISOString().split('T')[0]
        setDateRange({ start: value, end: newEnd })
        return
      }
    }

    // If changing end date, validate it's not before start date
    if (type === 'end') {
      const startDate = dateRange.start
      if (value < startDate) {
        logWarning('useDateRange', 'End date cannot be before start date. Adjusting start date.')
        setDateRange({ start: value, end: value })
        return
      }

      // Check if date range exceeds 30 days
      const daysDiff = getDaysDifference(startDate, value)
      if (daysDiff > MAX_DAYS) {
        logWarning('useDateRange', `Date range cannot exceed ${MAX_DAYS} days. Adjusting start date.`)
        // Calculate new start date that is 30 days before end
        const newStartDate = new Date(value)
        newStartDate.setDate(newStartDate.getDate() - MAX_DAYS)
        const newStart = newStartDate.toISOString().split('T')[0]
        setDateRange({ start: newStart, end: value })
        return
      }
    }

    setDateRange(prev => ({ ...prev, [type]: value }))
  }

  return {
    dateRange,
    setDateRange,
    handleDateChange,
  }
}

