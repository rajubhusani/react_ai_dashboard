/**
 * Product Feedback Types (JavaScript)
 * Type definitions for product feedback data
 * 
 * Note: These are JSDoc type definitions for JavaScript
 * FeedbackType = 'H' | 'E' | 'S' (Happy, Excited, Sad)
 */

/**
 * @typedef {('H' | 'E' | 'S')} FeedbackType
 */

/**
 * @typedef {Object} ProductFeedbackEntry
 * @property {number} id
 * @property {string} userId
 * @property {string} app
 * @property {string} module
 * @property {string} screen
 * @property {string} feature
 * @property {FeedbackType} feedbackType
 * @property {string} comments
 * @property {string} sysAccountId
 * @property {string} fleetId
 * @property {string} dateTime
 */

/**
 * @typedef {Object} ProductFeedbackResponse
 * @property {string} code
 * @property {string} message
 * @property {Object} body
 * @property {ProductFeedbackEntry[]} body.content
 * @property {Object} body.pageable
 * @property {boolean} body.last
 * @property {number} body.totalElements
 * @property {number} body.totalPages
 * @property {boolean} body.first
 * @property {number} body.size
 * @property {number} body.number
 * @property {number} body.numberOfElements
 * @property {boolean} body.empty
 */

/**
 * @typedef {Object} FeedbackSummary
 * @property {number} totalFeedback
 * @property {number} happy
 * @property {number} excited
 * @property {number} sad
 * @property {number} happyPercent
 * @property {number} excitedPercent
 * @property {number} sadPercent
 */

/**
 * @typedef {Object} FeedbackByModule
 * @property {string} module
 * @property {number} count
 * @property {number} happy
 * @property {number} excited
 * @property {number} sad
 * @property {string} percentage
 */

/**
 * @typedef {Object} FeedbackByFeature
 * @property {string} feature
 * @property {number} count
 * @property {number} happy
 * @property {number} excited
 * @property {number} sad
 * @property {('positive' | 'neutral' | 'negative')} sentiment
 * @property {string} percentage
 * @property {FeedbackByModule[]} modules
 */

/**
 * @typedef {Object} FeedbackTrend
 * @property {string} date
 * @property {string} displayDate
 * @property {number} happy
 * @property {number} excited
 * @property {number} sad
 * @property {number} total
 */

/**
 * @typedef {Object} ProcessedFeedbackData
 * @property {FeedbackSummary} summary
 * @property {FeedbackByFeature[]} byFeature
 * @property {FeedbackTrend[]} trends
 * @property {ProductFeedbackEntry[]} recentFeedback
 */

// Export for use in other modules
export const FeedbackTypes = {
  HAPPY: 'H',
  EXCITED: 'E',
  SAD: 'S'
}

export const FeedbackLabels = {
  H: 'Happy',
  E: 'Excited',
  S: 'Sad'
}

export const FeedbackEmojis = {
  H: '😊',
  E: '🎉',
  S: '😔'
}

