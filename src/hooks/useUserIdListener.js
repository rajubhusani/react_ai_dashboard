import { useState, useEffect } from 'react'

/**
 * Custom hook to listen for userId changes from Header component
 * @returns {string} userId - Current userId filter value
 */
export const useUserIdListener = () => {
  const [userId, setUserId] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('userId')
    return saved || ''
  })

  useEffect(() => {
    const handleUserIdChange = (event) => {
      const newUserId = event.detail || ''
      console.log('📡 useUserIdListener: Received userId change:', newUserId)
      setUserId(newUserId)
    }

    window.addEventListener('userIdChange', handleUserIdChange)
    console.log('👂 useUserIdListener: Listening for userId changes')

    return () => {
      window.removeEventListener('userIdChange', handleUserIdChange)
      console.log('🔇 useUserIdListener: Stopped listening for userId changes')
    }
  }, [])

  return userId
}

