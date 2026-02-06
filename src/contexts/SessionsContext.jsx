import React, { createContext, useContext, useState, useEffect } from 'react'
import { dashboardService } from '../api/dashboardService'

const SessionsContext = createContext()

export const useSessionsData = () => {
  const context = useContext(SessionsContext)
  if (!context) {
    throw new Error('useSessionsData must be used within SessionsProvider')
  }
  return context
}

export const SessionsProvider = ({ children }) => {
  const [sessionsData, setSessionsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState(() => {
    const saved = localStorage.getItem('dateRange')
    return saved ? JSON.parse(saved) : null
  })
  const [accountCode, setAccountCode] = useState(() => {
    const saved = localStorage.getItem('accountCode')
    return saved || ''
  })
  const [userId, setUserId] = useState(() => {
    const saved = localStorage.getItem('userId')
    return saved || ''
  })

  useEffect(() => {
    fetchSessionsData()
  }, [dateRange, accountCode, userId])

  useEffect(() => {
    const handleDateRangeChange = (event) => {
      console.log('🔄 SessionsContext: Date range changed:', event.detail)
      setDateRange(event.detail)
    }
    window.addEventListener('dateRangeChange', handleDateRangeChange)
    return () => window.removeEventListener('dateRangeChange', handleDateRangeChange)
  }, [])

  useEffect(() => {
    const handleAccountCodeChange = (event) => {
      console.log('🔍 SessionsContext: Account code changed:', event.detail)
      setAccountCode(event.detail)
    }
    window.addEventListener('accountCodeChange', handleAccountCodeChange)
    return () => window.removeEventListener('accountCodeChange', handleAccountCodeChange)
  }, [])

  useEffect(() => {
    const handleUserIdChange = (event) => {
      console.log('👤 SessionsContext: User ID changed:', event.detail)
      setUserId(event.detail)
    }
    window.addEventListener('userIdChange', handleUserIdChange)
    return () => window.removeEventListener('userIdChange', handleUserIdChange)
  }, [])

  const fetchSessionsData = async () => {
    setLoading(true)
    setError(null)
    console.log('📡 SessionsContext: Fetching sessions data (SINGLE API CALL) with dateRange=', dateRange, 'accountCode=', accountCode, 'userId=', userId)

    try {
      const result = await dashboardService.getSessions(
        dateRange?.start,
        dateRange?.end,
        accountCode,
        userId
      )
      console.log('✅ SessionsContext: Successfully fetched sessions data:', result)
      console.log('   📊 Total sessions:', result?.totalSessions || 0)
      console.log('   🔍 Account code filter:', accountCode || 'none')
      console.log('   👤 User ID filter:', userId || 'none')
      console.log('   🔄 This data will be shared across all session widgets')

      setSessionsData(result)
    } catch (err) {
      console.error('❌ SessionsContext: Failed to fetch sessions data:', err)
      setError(err.message || 'Failed to load sessions data')
      setSessionsData(null)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    sessionsData,
    loading,
    error,
    dateRange,
    accountCode,
    userId,
    refetch: fetchSessionsData
  }

  return (
    <SessionsContext.Provider value={value}>
      {children}
    </SessionsContext.Provider>
  )
}

