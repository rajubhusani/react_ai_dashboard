import { useEffect, useState } from 'react'
import { dashboardService } from '../api/dashboardService'

// Prefetch and manage raw analytics cache
export const useRawAnalytics = (autoPrefetch = true) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

  const prefetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await dashboardService.prefetchRawAnalytics()
      setIsReady(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to prefetch analytics data'
      setError(msg)
      console.error('Error prefetching raw analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { if (autoPrefetch) prefetch() }, [autoPrefetch])

  return { isLoading, isReady, error, prefetch }
}

// Simpler hook that just prefetches without state management
export const usePrefetchRawAnalytics = () => {
  useEffect(() => { dashboardService.prefetchRawAnalytics().catch(console.error) }, [])
}

// Prefetch and manage sessions cache
export const useSessions = (options = {}) => {
  const { startDate, endDate, autoPrefetch = true } = options
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

  const prefetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await dashboardService.prefetchSessions(startDate, endDate)
      setIsReady(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to prefetch sessions data'
      setError(msg)
      console.error('Error prefetching sessions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { if (autoPrefetch) prefetch() }, [autoPrefetch, startDate, endDate])

  return { isLoading, isReady, error, prefetch }
}

// Simpler hook for sessions prefetch
export const usePrefetchSessions = (options = {}) => {
  const { startDate, endDate } = options
  useEffect(() => { dashboardService.prefetchSessions(startDate, endDate).catch(console.error) }, [startDate, endDate])
}

