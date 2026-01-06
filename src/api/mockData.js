/**
 * Mock Data for Product Feedback API (JavaScript)
 * Simulates the response from /analytics/product-feedback endpoint
 */

import { FeedbackTypes } from '../types/productFeedback'

/**
 * Mock product feedback response
 */
export const mockProductFeedbackResponse = {
  code: '00000',
  message: 'Success',
  body: {
    content: [
      {
        id: 304878,
        userId: 'multi_nikhilesh@fleetcor.testinator.com',
        app: 'Corpay Fleet- ver 4.0.0',
        module: 'User Settings',
        screen: 'Product Feedback',
        feature: 'ADMIN Experience',
        feedbackType: FeedbackTypes.HAPPY,
        comments: 'Great admin interface! Very intuitive and easy to use.',
        sysAccountId: 'S-566_000FM_3',
        fleetId: 'DB2Z2',
        dateTime: '2025-11-10T06:29:26.871Z'
      },
      {
        id: 304879,
        userId: 'user2@fleetcor.testinator.com',
        app: 'My-Cardz- ver 2.1.0',
        module: 'Navigation',
        screen: 'Dashboard',
        feature: 'Route Planning',
        feedbackType: FeedbackTypes.EXCITED,
        comments: 'Love the new route optimization feature!',
        sysAccountId: 'S-566_000FM_4',
        fleetId: 'DB2Z3',
        dateTime: '2025-11-11T10:15:30.000Z'
      },
      {
        id: 304880,
        userId: 'user3@fleetcor.testinator.com',
        app: 'Corpay Fleet- ver 4.0.0',
        module: 'Payments',
        screen: 'Transaction History',
        feature: 'Payment Processing',
        feedbackType: FeedbackTypes.SAD,
        comments: 'Payment processing is slow sometimes',
        sysAccountId: 'S-566_000FM_5',
        fleetId: 'DB2Z4',
        dateTime: '2025-11-12T14:45:00.000Z'
      }
    ],
    pageable: {
      sort: { empty: false, sorted: true, unsorted: false },
      offset: 0,
      pageSize: 20,
      pageNumber: 0,
      paged: true,
      unpaged: false
    },
    last: true,
    totalElements: 3,
    totalPages: 1,
    sort: { empty: false, sorted: true, unsorted: false },
    first: true,
    size: 20,
    number: 0,
    numberOfElements: 3,
    empty: false
  }
}

/**
 * Generate mock raw analytics data
 */
export const generateMockRawAnalytics = (count = 100) => {
  const intents = ['Site Locator', 'Card Management', 'Account Management', 'Fuel Code']
  const sentiments = ['positive', 'negative', 'neutral', 'mixed', 'unknown']
  const queries = [
    'Find nearest fuel station',
    'Check card balance',
    'Update account settings',
    'Request fuel code',
    'View transaction history'
  ]

  const entries = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    entries.push({
      userId: `user_${Math.floor(Math.random() * 1000)}`,
      query: queries[Math.floor(Math.random() * queries.length)],
      intent: intents[Math.floor(Math.random() * intents.length)],
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
      responseTime: Math.floor(Math.random() * 5000) + 100,
      timestamp: new Date(now.getTime() - Math.random() * 86400000).toISOString(),
      sessionId: `session_${Math.floor(Math.random() * 500)}`
    })
  }

  return {
    data: entries,
    total: count,
    timestamp: now.toISOString()
  }
}

/**
 * Generate mock user trends data
 */
export const generateMockUserTrends = (days = 30) => {
  const trends = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000)
    trends.push({
      period: date.toISOString().split('T')[0],
      newUsers: Math.floor(Math.random() * 50) + 10,
      returningUsers: Math.floor(Math.random() * 100) + 50,
      activeUsers: Math.floor(Math.random() * 150) + 80,
      totalUsers: Math.floor(Math.random() * 500) + 300
    })
  }

  return trends
}

