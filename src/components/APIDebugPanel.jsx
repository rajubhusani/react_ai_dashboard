import React, { useState, useEffect } from 'react'

const APIDebugPanel = () => {
  const [logs, setLogs] = useState([])
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    // Intercept console.log to capture API logs
    const originalLog = console.log
    const originalError = console.error

    console.log = (...args) => {
      originalLog(...args)
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      
      if (message.includes('API') || message.includes('📤') || message.includes('📥') || message.includes('❌')) {
        setLogs(prev => [...prev, {
          type: 'log',
          message,
          timestamp: new Date().toLocaleTimeString()
        }].slice(-20)) // Keep last 20 logs
      }
    }

    console.error = (...args) => {
      originalError(...args)
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      
      setLogs(prev => [...prev, {
        type: 'error',
        message,
        timestamp: new Date().toLocaleTimeString()
      }].slice(-20))
    }

    return () => {
      console.log = originalLog
      console.error = originalError
    }
  }, [])

  if (isMinimized) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#1f2937',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        cursor: 'pointer',
        zIndex: 10000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }} onClick={() => setIsMinimized(false)}>
        🔍 API Logs ({logs.length})
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '500px',
      maxHeight: '400px',
      background: '#1f2937',
      color: '#f3f4f6',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '12px 15px',
        borderBottom: '1px solid #374151',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#111827',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px'
      }}>
        <strong style={{ fontSize: '14px' }}>🔍 API Debug Console</strong>
        <div>
          <button
            onClick={() => setLogs([])}
            style={{
              background: '#374151',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              marginRight: '8px'
            }}
          >
            Clear
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              background: '#374151',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            −
          </button>
        </div>
      </div>
      
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '10px',
        fontSize: '11px',
        fontFamily: 'monospace'
      }}>
        {logs.length === 0 ? (
          <div style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
            No API logs yet. Interact with the dashboard to see API calls.
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              style={{
                marginBottom: '8px',
                padding: '8px',
                background: log.type === 'error' ? '#7f1d1d' : '#1e293b',
                borderRadius: '4px',
                borderLeft: `3px solid ${log.type === 'error' ? '#ef4444' : '#3b82f6'}`,
                wordBreak: 'break-word'
              }}
            >
              <div style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px' }}>
                {log.timestamp}
              </div>
              <div style={{ color: log.type === 'error' ? '#fca5a5' : '#e5e7eb' }}>
                {log.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default APIDebugPanel

