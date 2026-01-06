/**
 * String Constants
 * Centralized string literals for consistent messaging and labels
 */

// Widget Titles
export const WIDGET_TITLES = {
  AI_USAGE: 'AI Usage Analytics',
  INTENTS: 'Overall Intent Distribution',
  SENTIMENT: 'Sentiment Analysis',
  TRENDS: 'Trends',
  USER_TRENDS: 'User Trends',
  SESSION_DURATION: 'Session Duration',
  SESSIONS_BY_FLAVOR: 'Sessions by Flavor',
  SESSIONS_MAP: 'Sessions Map',
}

// Loading States
export const LOADING_MESSAGES = {
  DEFAULT: 'Loading...',
  FETCHING_DATA: 'Fetching data...',
  PROCESSING: 'Processing...',
}

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An error occurred. Please try again.',
  FETCH_FAILED: 'Failed to fetch data. Using fallback data.',
  INVALID_DATA: 'Invalid data received from server.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
}

// Intent Names
export const INTENT_NAMES = {
  SITE_LOCATOR: 'Site Locator',
  FUEL_SEARCH: 'Site Locator',
  AMENITY_SEARCH: 'Site Locator - Amenities',
  CARD_MANAGEMENT: 'Card Management',
  ACCOUNT_MANAGEMENT: 'Account Management',
  ERROR: 'Error',
  FUEL_CODE: 'Fuel Code',
}

// Parameter Names
export const PARAMETER_NAMES = {
  FUEL_PRIORITIES: 'Proximity',
  FUEL_TYPES: 'Fuel Types',
  AMENITIES: 'Amenities',
  ACTIONS: 'Actions',
}

// Parameter Values
export const PARAMETER_VALUES = {
  STATEMENT_DATE: 'Statement Date',
  DUE_DATE: 'Due Date',
}

// Metric Labels
export const METRIC_LABELS = {
  TOTAL_QUERIES: 'Total Prompts',
  UNIQUE_USERS: 'Unique Users',
  AVG_RESPONSE_TIME: 'Avg Response Time (ms)',
  NEW_USERS: 'New Users',
  ACTIVE_USERS: 'Active Users',
  RETENTION_RATE: 'Retention Rate',
}

// Date Format Options
export const DATE_FORMATS = {
  SHORT: { month: 'short', day: 'numeric' },
  MEDIUM: { month: 'short', day: 'numeric', year: 'numeric' },
  LONG: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
}

// LocalStorage Keys
export const STORAGE_KEYS = {
  DATE_RANGE: 'dateRange',
  THEME: 'theme',
  USER_PREFERENCES: 'userPreferences',
}

// Event Names
export const EVENT_NAMES = {
  DATE_RANGE_CHANGE: 'dateRangeChange',
  THEME_CHANGE: 'themeChange',
}

// Console Log Prefixes
export const LOG_PREFIXES = {
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  DEBUG: '🔍',
  FETCH: '📡',
  MOCK: '📦',
}

