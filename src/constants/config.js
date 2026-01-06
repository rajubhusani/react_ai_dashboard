/**
 * Configuration Constants
 * Application-wide configuration values
 */

// Date Range Configuration
export const DATE_CONFIG = {
  DEFAULT_DAYS_BACK: 7,
  MAX_DAYS_RANGE: 365,
  MIN_DAYS_RANGE: 1,
}

// Chart Configuration
export const CHART_CONFIG = {
  DEFAULT_HEIGHT: 200,
  DEFAULT_WIDTH: '100%',
  PIE_CHART_SIZE: 200,
  LINE_CHART_HEIGHT: 220,
  BAR_CHART_HEIGHT: 200,
  AREA_CHART_HEIGHT: 200,
}

// Animation Configuration
export const ANIMATION_CONFIG = {
  DURATION: 300,
  EASING: 'ease-in-out',
  TOOLTIP_DELAY: 200,
}

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
}

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
}

// Theme Configuration
export const THEME_CONFIG = {
  DEFAULT: 'light',
  OPTIONS: ['light', 'dark'],
}

// Number Formatting
export const NUMBER_FORMAT = {
  LOCALE: 'en-US',
  DECIMAL_PLACES: 2,
  PERCENTAGE_DECIMAL_PLACES: 1,
}

