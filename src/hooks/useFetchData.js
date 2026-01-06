/**
 * useFetchData Hook
 * Custom hook for data fetching with loading and error states
 */

import { useState, useEffect, useCallback } from 'react'
import { logSuccess, logError } from '../utils/logUtils'

/**
 * Custom hook for data fetching
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {Object} options - Options object
 * @param {*} options.fallbackData - Fallback data if fetch fails
 * @param {string} options.componentName - Component name for logging
 * @param {boolean} options.useFallbackOnError - Whether to use fallback data on error
 * @returns {Object} Data, loading, error states and refetch function
 */
export const useFetchData = (
  fetchFunction,
  dependencies = [],
  options = {}
) => {
  const {
    fallbackData = null,
    componentName = 'Component',
    useFallbackOnError = true,
  } = options

  const [data, setData] = useState(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchFunction()
      logSuccess(componentName, 'Successfully fetched data', result)
      setData(result)
    } catch (err) {
      logError(componentName, 'Failed to fetch data', err)
      setError(err?.message || 'An error occurred')
      
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, fallbackData, componentName, useFallbackOnError])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

