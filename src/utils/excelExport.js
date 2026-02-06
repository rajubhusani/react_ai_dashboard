import * as XLSX from 'xlsx'

// Define the 4 main intent categories shown on UI
const VALID_INTENT_CATEGORIES = [
  'Site Locator',
  'Card Management',
  'Account Management',
  'Fuel Code'
]

/**
 * Export raw analytics data to Excel file
 * @param {Array} data - Raw analytics data array
 * @param {string} filename - Name of the file to download
 */
export const exportToExcel = (data, filename = 'analytics-export.xlsx') => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Filter data to only include the 4 main intent categories
  const filteredData = data.filter(entry => {
    const intent = normalizeIntent(entry.intent)
    return VALID_INTENT_CATEGORIES.includes(intent)
  })

  console.log(`📊 Filtered ${data.length} entries to ${filteredData.length} entries with valid intent categories`)

  if (filteredData.length === 0) {
    console.warn('No data with valid intent categories to export')
    alert('No data available for the selected filters with the 4 main intent categories (Site Locator, Card Management, Account Management, Fuel Code).')
    return
  }

  // Transform data to match required Excel format
  const excelData = filteredData.map((entry, index) => ({
    'Record #': index + 1,
    'User ID': entry.userId || 'N/A',
    'User Question': entry.query || 'N/A',
    'AI Response': entry.response || 'N/A',
    'Detected Sentiment': formatSentiment(entry.sentiment),
    'Intent Category': normalizeIntent(entry.intent),
    'Sub Intent Category': formatSubIntentCategory(entry.parameters),
    'Response Duration (seconds)': formatResponseTime(entry.responseTime),
    'Date': formatDate(entry.timestamp),
    'Timestamp(EST)': formatTimestamp(entry.timestamp),
    'App Identifier': formatAppIdentifier(entry.appFlavor),
    'Account ID': entry.sysAccountId || 'N/A'
  }))

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // Set column widths for better readability
  const columnWidths = [
    { wch: 10 },  // Record #
    { wch: 30 },  // User ID
    { wch: 50 },  // User Question
    { wch: 60 },  // AI Response
    { wch: 18 },  // Detected Sentiment
    { wch: 25 },  // Intent Category
    { wch: 40 },  // Sub Intent Category
    { wch: 22 },  // Response Duration
    { wch: 15 },  // Date
    { wch: 25 },  // Timestamp
    { wch: 25 },  // App Identifier
    { wch: 25 }   // Account ID
  ]
  worksheet['!cols'] = columnWidths

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics Data')

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, filename)

  console.log(`✅ Exported ${filteredData.length} records to ${filename}`)
}

/**
 * Normalize intent to match the 4 main UI categories
 * Maps backend intent values (UPPERCASE_WITH_UNDERSCORES) to UI intent categories
 * @param {string} intent
 * @returns {string}
 */
const normalizeIntent = (intent) => {
  if (!intent) return 'N/A'

  // Convert to uppercase for consistent matching
  const intentUpper = intent.toUpperCase()

  // Map backend intent values to the 4 main UI categories
  const intentMap = {
    'SITE_LOCATOR': 'Site Locator',
    'FUEL_SEARCH': 'Site Locator',
    'AMENITY_SEARCH': 'Site Locator',
    'CARD_MANAGEMENT': 'Card Management',
    'CARD_UNLOCK': 'Card Management',
    'ACCOUNT_MANAGEMENT': 'Account Management',
    'FUEL_CODE': 'Fuel Code'
  }

  // Return mapped value or original if not found
  return intentMap[intentUpper] || intent
}

/**
 * Format sentiment value for display
 * @param {string} sentiment
 * @returns {string}
 */
const formatSentiment = (sentiment) => {
  if (!sentiment) return 'Unknown'
  
  const sentimentMap = {
    'positive': 'Positive',
    'negative': 'Negative',
    'neutral': 'Neutral',
    'mixed': 'Mixed',
    'unknown': 'Unknown'
  }
  
  return sentimentMap[sentiment.toLowerCase()] || sentiment
}

/**
 * Format sub intent category (subcategories) from parameters object
 * Returns labeled format: "Action: value | Amenities: value | Fuel Type: value | Fuel Priority: value"
 * @param {Object} parameters
 * @returns {string}
 */
const formatSubIntentCategory = (parameters) => {
  if (!parameters) return 'N/A'

  const parts = []

  // Add action if present
  if (parameters.action) {
    parts.push(`Action: ${parameters.action}`)
  }

  // Add amenities if present (always add label for Site Locator intents)
  if (parameters.amenities && Array.isArray(parameters.amenities) && parameters.amenities.length > 0) {
    const amenitiesStr = parameters.amenities.join(', ')
    parts.push(`Amenities: ${amenitiesStr}`)
  } else if (parameters.fuel) {
    // Add empty amenities label for Site Locator intents
    parts.push('Amenities: ')
  }

  // Add fuel information if present
  if (parameters.fuel) {
    if (parameters.fuel.fuel_type && Array.isArray(parameters.fuel.fuel_type)) {
      const fuelTypeStr = parameters.fuel.fuel_type.join(', ')
      parts.push(`Fuel Type: ${fuelTypeStr}`)
    }
    if (parameters.fuel.fuel_priority) {
      parts.push(`Fuel Priority: ${parameters.fuel.fuel_priority}`)
    }
  }

  return parts.length > 0 ? parts.join(' | ') : 'N/A'
}

/**
 * Format response time from milliseconds to seconds
 * @param {number} responseTime - Response time in milliseconds
 * @returns {string}
 */
const formatResponseTime = (responseTime) => {
  if (responseTime === null || responseTime === undefined) return 'N/A'
  return (responseTime / 1000).toFixed(2)
}

/**
 * Format date only (separate from timestamp)
 * @param {string} timestamp - ISO timestamp
 * @returns {string}
 */
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'

  try {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    return 'N/A'
  }
}

/**
 * Format timestamp to EST timezone with EST label
 * @param {string} timestamp - ISO timestamp
 * @returns {string}
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A'

  try {
    const date = new Date(timestamp)
    const timeString = date.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    return `${timeString}`
  } catch (error) {
    return timestamp
  }
}

/**
 * Format app identifier - capitalize Comdata
 * @param {string} appFlavor
 * @returns {string}
 */
const formatAppIdentifier = (appFlavor) => {
  if (!appFlavor) return 'N/A'

  // Capitalize "Comdata" if it starts with lowercase "comdata"
  if (appFlavor.toLowerCase().startsWith('comdata')) {
    return appFlavor.replace(/^comdata/i, 'Comdata')
  }

  return appFlavor
}

