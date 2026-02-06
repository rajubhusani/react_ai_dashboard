import apiClient from './client'
import { processProductFeedback } from '../utils/productFeedbackService'
import {
  processSentimentAnalysis,
  processQueryTrends,
  processIntentDistribution,
  processAIUsageTrends,
  processUserTotal,
  processUserCreationTrends,
  processUserActiveTrends,
  processUserRetention,
} from '../utils/analyticsService'
import { processAccountAnalytics, extractAccountCode } from '../utils/accountAnalyticsService'

// ---- Raw analytics cache ----
let rawAnalyticsCache = null
let cacheTimestamp = null
let pendingRequest = null
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes
const PAGINATION_LIMIT = 1000 // items per page

// ---- Sessions cache ----
let sessionsCache = null
let sessionsCacheTimestamp = null
let sessionsPendingRequest = null
let sessionsCacheKey = null
const SESSIONS_CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

const filterByUserId = (data, userId) => {
  if (!userId || userId.trim() === '') return data
  const filtered = data.filter((entry) => {
    return entry.userId && entry.userId.toLowerCase().includes(userId.toLowerCase())
  })
  console.log(`🔍 Filtered ${data.length} entries to ${filtered.length} for user ID: ${userId}`)
  return filtered
}

const filterByAccountCode = (data, accountCode) => {
  if (!accountCode || accountCode.trim() === '') return data
  const filtered = data.filter((entry) => {
    const entryAccountCode = extractAccountCode(entry.sysAccountId)
    return entryAccountCode.toLowerCase().includes(accountCode.toLowerCase())
  })
  console.log(`🔍 Filtered ${data.length} entries to ${filtered.length} for account code: ${accountCode}`)
  return filtered
}

const filterSessionsByAccountCode = (sessions, accountCode) => {
  if (!accountCode || accountCode.trim() === '') return sessions
  const filtered = sessions.filter((s) => {
    const sessionAccountCode = extractAccountCode(s.sysAccountId)
    return sessionAccountCode.toLowerCase().includes(accountCode.toLowerCase())
  })
  console.log(`🔍 Filtered ${sessions.length} sessions to ${filtered.length} for account code: ${accountCode}`)
  return filtered
}

const filterSessionsByUserId = (sessions, userId) => {
  if (!userId || userId.trim() === '') return sessions
  const filtered = sessions.filter((s) => {
    return s.userId && s.userId.toLowerCase().includes(userId.toLowerCase())
  })
  console.log(`🔍 Filtered ${sessions.length} sessions to ${filtered.length} for user ID: ${userId}`)
  return filtered
}

const fetchRawAnalytics = async () => {
  const now = Date.now()
  if (rawAnalyticsCache && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
    console.log('📦 Using cached raw analytics data (cache hit)')
    return rawAnalyticsCache
  }
  if (pendingRequest) {
    console.log('⏳ Waiting for pending raw analytics request...')
    return pendingRequest
  }
  console.log('🔄 Fetching fresh raw analytics data from API with pagination (cache miss)')
  pendingRequest = (async () => {
    try {
      const allEntries = []
      let page = 1
      let hasNextPage = true
      let totalPages = null

      while (hasNextPage) {
        console.log(`📄 Fetching page ${page}...`)
        const response = await apiClient.get('/analytics/rawAnalytics', {
          params: {
            page,
            limit: PAGINATION_LIMIT
          }
        })

        // Extract entries from response
        let pageEntries = []
        if (Array.isArray(response.data)) {
          pageEntries = response.data
        } else if (response.data?.entries && Array.isArray(response.data.entries)) {
          pageEntries = response.data.entries
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          pageEntries = response.data.data
        }

        // Add entries to collection
        allEntries.push(...pageEntries)
        console.log(`✅ Page ${page}: ${pageEntries.length} entries (total so far: ${allEntries.length})`)

        // Check pagination info
        if (response.data?.pagination) {
          const pagination = response.data.pagination
          totalPages = pagination.totalPages
          hasNextPage = pagination.hasNextPage === true
          console.log(`📊 Pagination: page ${pagination.page}/${pagination.totalPages}, hasNextPage: ${hasNextPage}`)
        } else {
          // If no pagination info, stop if we got empty entries
          hasNextPage = pageEntries.length > 0 && pageEntries.length === PAGINATION_LIMIT
        }

        page++
      }

      rawAnalyticsCache = allEntries
      cacheTimestamp = now
      console.log(`✅ Cached ${allEntries.length} raw analytics entries from ${totalPages || page - 1} pages`)
      return allEntries
    } catch (err) {
      console.error('❌ Error fetching raw analytics:', err)
      throw err
    } finally {
      pendingRequest = null
    }
  })()
  return pendingRequest
}

const fetchSessions = async (startDate, endDate) => {
  const now = Date.now()
  const cacheKey = `${startDate || ''}-${endDate || ''}`
  if (sessionsCache && sessionsCacheTimestamp && sessionsCacheKey === cacheKey && now - sessionsCacheTimestamp < SESSIONS_CACHE_DURATION) {
    console.log('📦 Using cached sessions data (cache hit)')
    return sessionsCache
  }
  if (sessionsPendingRequest && sessionsCacheKey === cacheKey) {
    console.log('⏳ Waiting for pending sessions request...')
    return sessionsPendingRequest
  }
  console.log('🔄 Fetching fresh sessions data from API (cache miss)')
  sessionsPendingRequest = (async () => {
    try {
      const params = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      const response = await apiClient.get('/analytics/sessions', { params })
      const data = response.data
      sessionsCache = data
      sessionsCacheTimestamp = now
      sessionsCacheKey = cacheKey
      console.log(`✅ Cached sessions data (${data.totalSessions} sessions)`)
      return data
    } catch (err) {
      console.error('❌ Error fetching sessions:', err)
      throw err
    } finally {
      sessionsPendingRequest = null
    }
  })()
  return sessionsPendingRequest
}

export const clearRawAnalyticsCache = () => { rawAnalyticsCache = null; cacheTimestamp = null; pendingRequest = null; console.log('🗑️ Raw analytics cache cleared') }
export const clearSessionsCache = () => { sessionsCache = null; sessionsCacheTimestamp = null; sessionsPendingRequest = null; sessionsCacheKey = null; console.log('🗑️ Sessions cache cleared') }

export const getCacheStatus = () => {
  const now = Date.now()
  const isValid = rawAnalyticsCache && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION
  const age = cacheTimestamp ? Math.floor((now - cacheTimestamp) / 1000) : null
  return { hasCachedData: !!rawAnalyticsCache, cacheSize: rawAnalyticsCache?.length || 0, cacheAgeSeconds: age, isValid, hasPendingRequest: !!pendingRequest }
}

export const getSessionsCacheStatus = () => {
  const now = Date.now()
  const isValid = sessionsCache && sessionsCacheTimestamp && now - sessionsCacheTimestamp < SESSIONS_CACHE_DURATION
  const age = sessionsCacheTimestamp ? Math.floor((now - sessionsCacheTimestamp) / 1000) : null
  return { hasCachedData: !!sessionsCache, cacheSize: sessionsCache?.totalSessions || 0, cacheAgeSeconds: age, isValid, hasPendingRequest: !!sessionsPendingRequest, cacheKey: sessionsCacheKey }
}

export const dashboardService = {
  prefetchRawAnalytics: async () => { console.log('🚀 Prefetching raw analytics...'); await fetchRawAnalytics(); console.log('✅ Prefetch complete') },
  getAIUsage: async (startDate, endDate, accountCode, userId) => {
    const rawData = await fetchRawAnalytics()
    let filtered = filterByUserId(rawData, userId)
    filtered = filterByAccountCode(filtered, accountCode)
    const result = processAIUsageTrends(filtered, 'day', startDate, endDate)
    return result
  },
  getTrends: async (startDate, endDate, accountCode, userId) => {
    const rawData = await fetchRawAnalytics()
    let filtered = filterByUserId(rawData, userId)
    filtered = filterByAccountCode(filtered, accountCode)
    return processQueryTrends(filtered, 'day', startDate, endDate)
  },
  getIntents: async (startDate, endDate, accountCode, userId) => {
    const rawData = await fetchRawAnalytics()
    let filtered = filterByUserId(rawData, userId)
    filtered = filterByAccountCode(filtered, accountCode)
    return processIntentDistribution(filtered, undefined, startDate, endDate)
  },
}


export const extendDashboardService = () => { /* noop marker to help tree-shaking */ }

dashboardService.getResponseTimes = async () => {
  try { const resp = await apiClient.get('analytics/avg-response'); return resp.data } catch (e) { console.error('Error fetching Avg response times:', e); throw e }
}

dashboardService.getUserTotal = async (userId, startDate, endDate) => {
  const rawData = await fetchRawAnalytics()
  const filtered = filterByUserId(rawData, userId)
  return processUserTotal(filtered, startDate, endDate)
}

dashboardService.getUserCreationTrends = async (startDate, endDate, userId) => {
  const rawData = await fetchRawAnalytics()
  const filtered = filterByUserId(rawData, userId)
  return processUserCreationTrends(filtered, 'day', startDate, endDate)
}

dashboardService.getUserActiveTrends = async (startDate, endDate, userId) => {
  const rawData = await fetchRawAnalytics()
  const filtered = filterByUserId(rawData, userId)
  return processUserActiveTrends(filtered, 'day', startDate, endDate)
}

dashboardService.getUserRetention = async (startDate, endDate, userId) => {
  const rawData = await fetchRawAnalytics()
  const filtered = filterByUserId(rawData, userId)
  return processUserRetention(filtered, 'day', startDate, endDate)
}

dashboardService.getSessions = async (startDate, endDate, accountCode, userId) => {
  const result = await fetchSessions(startDate, endDate)
  let filteredSessions = result.sessions

  // Apply userId filter first
  if (userId && userId.trim() !== '') {
    filteredSessions = filterSessionsByUserId(filteredSessions, userId)
  }

  // Then apply accountCode filter
  if (accountCode && accountCode.trim() !== '') {
    filteredSessions = filterSessionsByAccountCode(filteredSessions, accountCode)
  }

  return { ...result, sessions: filteredSessions, totalSessions: filteredSessions.length }
}

dashboardService.prefetchSessions = async (startDate, endDate) => { await fetchSessions(startDate, endDate) }

dashboardService.getSentiment = async (startDate, endDate, accountCode, userId) => {
  const rawData = await fetchRawAnalytics()
  let filtered = filterByUserId(rawData, userId)
  filtered = filterByAccountCode(filtered, accountCode)
  return processSentimentAnalysis(filtered, undefined, startDate, endDate)
}

dashboardService.getProductFeedback = async (startDate, endDate, accountCode) => {
  try {
    const response = await apiClient.get('/analytics/product-feedback', { params: { startDate, endDate, pageSize: 500, pageNumber: 0 } })
    let entries = response.data?.body?.content || []
    if (accountCode && accountCode.trim() !== '') {
      entries = entries.filter((entry) => extractAccountCode(entry.sysAccountId).toLowerCase().includes(accountCode.toLowerCase()))
    }
    return processProductFeedback(entries, startDate, endDate)
  } catch (e) { console.error('Error fetching product feedback:', e); throw e }
}

dashboardService.getAccountAnalytics = async (accountCode, startDate, endDate, userId) => {
  const rawData = await fetchRawAnalytics()
  const filtered = filterByUserId(rawData, userId)
  return processAccountAnalytics(filtered, accountCode, startDate, endDate)
}

// Export utility functions for Excel download
dashboardService.fetchRawAnalytics = fetchRawAnalytics
dashboardService.filterByUserId = filterByUserId
dashboardService.filterByAccountCode = filterByAccountCode
