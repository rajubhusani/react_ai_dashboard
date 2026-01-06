import React, { useState, useRef, useEffect } from 'react'
import './InfoTooltip.css'

const InfoTooltip = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef(null)
  const timeoutRef = useRef(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    // Add a small delay before hiding to allow moving to tooltip
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, 200)
  }

  const handleClick = () => {
    setIsVisible(!isVisible)
  }

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsVisible(false)
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isVisible])

  return (
    <div
      className="info-tooltip-container"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="info-icon"
        onClick={handleClick}
        aria-label="More information"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </button>
      {isVisible && (
        <div className="info-tooltip-popup">
          <div className="info-tooltip-content">
            {content}
          </div>
        </div>
      )}
    </div>
  )
}

export default InfoTooltip

