import React, { useState, useEffect } from 'react'
import { useDateRange } from '../hooks'
import { getThemeFromStorage, setThemeInStorage } from '../utils'
import { THEME_CONFIG } from '../constants'
import { getTodayISO } from '../utils'
import './Header.css'

const Header = () => {
  const [theme, setTheme] = useState(() => getThemeFromStorage())
  const { dateRange, handleDateChange } = useDateRange()
  const [accountCode, setAccountCode] = useState(() => {
    const saved = localStorage.getItem('accountCode')
    return saved || ''
  })

  useEffect(() => {
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', theme)
    setThemeInStorage(theme)
  }, [theme])

  // Dispatch account code change event
  useEffect(() => {
    // Save to localStorage
    if (accountCode) {
      localStorage.setItem('accountCode', accountCode)
    } else {
      localStorage.removeItem('accountCode')
    }

    // Dispatch event for widgets to listen
    const event = new CustomEvent('accountCodeChange', {
      detail: accountCode
    })
    window.dispatchEvent(event)
    console.log('🔍 Header: Account code changed:', accountCode)
  }, [accountCode])

  const handleAccountCodeChange = (e) => {
    setAccountCode(e.target.value)
  }

  const handleClearAccountCode = () => {
    setAccountCode('')
  }

  const toggleTheme = () => {
    setTheme(prevTheme =>
      prevTheme === THEME_CONFIG.OPTIONS[0]
        ? THEME_CONFIG.OPTIONS[1]
        : THEME_CONFIG.OPTIONS[0]
    )
  }

  const today = getTodayISO()

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">UMA AI Analytics</h1>
      </div>

      <div className="header-right">
        {/* Account Code Search */}
        <div className="account-code-search">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="account-search-icon"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            value={accountCode}
            onChange={handleAccountCodeChange}
            placeholder="Account code (e.g., A-083)"
            className="account-code-input"
            title="Filter by account code"
          />
          {accountCode && (
            <button
              className="clear-account-btn"
              onClick={handleClearAccountCode}
              aria-label="Clear account code"
              title="Clear account code"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        {/* Date Range Picker */}
        <div className="date-range-picker" title="Select date range (max 30 days)">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="calendar-icon"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateChange('start', e.target.value)}
            className="date-input"
            max={dateRange.end < today ? dateRange.end : today}
            title="Start date (max 30 days range)"
          />
          <span className="date-separator">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleDateChange('end', e.target.value)}
            className="date-input"
            min={dateRange.start}
            max={today}
            title="End date (max 30 days range)"
          />
        </div>

        {/* Theme Toggle */}
        <button
          className="header-button theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === THEME_CONFIG.OPTIONS[0] ? THEME_CONFIG.OPTIONS[1] : THEME_CONFIG.OPTIONS[0]} mode`}
        >
          {theme === THEME_CONFIG.OPTIONS[0] ? (
            // Sun icon for light mode
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
            </svg>
          ) : (
            // Moon icon for dark mode
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}

export default Header
