/**
 * Mock data for Product Feedback API (JavaScript)
 * Simulates the response from /analytics/product-feedback endpoint
 */

import { FeedbackTypes } from '../types/productFeedback'

/**
 * Mock product feedback response with comprehensive test data
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
        userId: 'john.doe@fleetcor.testinator.com',
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
        userId: 'jane.smith@fleetcor.testinator.com',
        app: 'Corpay Fleet- ver 4.0.0',
        module: 'Payments',
        screen: 'Transaction History',
        feature: 'Payment Processing',
        feedbackType: FeedbackTypes.SAD,
        comments: 'Payment processing is slow sometimes',
        sysAccountId: 'S-566_000FM_5',
        fleetId: 'DB2Z4',
        dateTime: '2025-11-12T14:45:00.000Z'
      },
      {
        id: 304881,
        userId: 'mike.wilson@fleetcor.testinator.com',
        app: 'My-Cardz- ver 2.1.0',
        module: 'User Settings',
        screen: 'Profile',
        feature: 'ADMIN Experience',
        feedbackType: FeedbackTypes.HAPPY,
        comments: 'Profile management is smooth and easy',
        sysAccountId: 'S-566_000FM_6',
        fleetId: 'DB2Z5',
        dateTime: '2025-11-13T08:20:15.000Z'
      },
      {
        id: 304882,
        userId: 'sarah.jones@fleetcor.testinator.com',
        app: 'Corpay Fleet- ver 4.0.0',
        module: 'Navigation',
        screen: 'Map View',
        feature: 'Route Planning',
        feedbackType: FeedbackTypes.EXCITED,
        comments: 'Map view is amazing! Real-time updates are perfect',
        sysAccountId: 'S-566_000FM_7',
        fleetId: 'DB2Z6',
        dateTime: '2025-11-13T12:30:45.000Z'
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
    totalElements: 5,
    totalPages: 1,
    sort: { empty: false, sorted: true, unsorted: false },
    first: true,
    size: 20,
    number: 0,
    numberOfElements: 5,
    empty: false
  }
}

/**
 * Helper function to get mock data for a specific date range
 */
export const getMockProductFeedbackForDateRange = (startDate, endDate) => {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()

  const filtered = mockProductFeedbackResponse.body.content.filter(item => {
    const itemTime = new Date(item.dateTime).getTime()
    return itemTime >= start && itemTime <= end
  })

  return {
    ...mockProductFeedbackResponse,
    body: {
      ...mockProductFeedbackResponse.body,
      content: filtered,
      totalElements: filtered.length,
      numberOfElements: filtered.length
    }
  }
}

