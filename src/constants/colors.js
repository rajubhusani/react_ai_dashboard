/**
 * Color Constants
 * Centralized color palette for consistent theming across the application
 */

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',      // Blue
  SUCCESS: '#10b981',      // Green
  WARNING: '#f59e0b',      // Orange/Amber
  DANGER: '#ef4444',       // Red
  PURPLE: '#8b5cf6',       // Purple
  PINK: '#ec4899',         // Pink
  INDIGO: '#6366f1',       // Indigo
  TEAL: '#14b8a6',         // Teal
}

// Chart Color Palette (for multiple series)
export const CHART_COLOR_PALETTE = [
  CHART_COLORS.PRIMARY,
  CHART_COLORS.SUCCESS,
  CHART_COLORS.WARNING,
  CHART_COLORS.DANGER,
  CHART_COLORS.PURPLE,
  CHART_COLORS.PINK,
]

// Sentiment Colors
export const SENTIMENT_COLORS = {
  POSITIVE: CHART_COLORS.SUCCESS,
  NEUTRAL: CHART_COLORS.WARNING,
  NEGATIVE: CHART_COLORS.DANGER,
  MIXED: CHART_COLORS.PURPLE,
}

// Status Colors
export const STATUS_COLORS = {
  ACTIVE: CHART_COLORS.SUCCESS,
  INACTIVE: '#9ca3af',     // Gray
  PENDING: CHART_COLORS.WARNING,
  ERROR: CHART_COLORS.DANGER,
}

// Background Colors
export const BG_COLORS = {
  LIGHT: '#f3f4f6',
  DARK: '#1f2937',
  CARD: '#ffffff',
  HOVER: '#f9fafb',
}

// Text Colors
export const TEXT_COLORS = {
  PRIMARY: '#111827',
  SECONDARY: '#6b7280',
  MUTED: '#9ca3af',
  INVERSE: '#ffffff',
}

