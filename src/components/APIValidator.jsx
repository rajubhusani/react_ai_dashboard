import React, { useState } from 'react'
import { dashboardService } from '../api/dashboardService'

const APIValidator = () => {
  const [results, setResults] = useState({})
  const [testing, setTesting] = useState(false)

  const testEndpoint = async (name, testFn) => {
    try {
      const startTime = Date.now()
      const data = await testFn()
      const duration = Date.now() - startTime
      
      return {
        success: true,
        data,
        duration,
        message: `Success (${duration}ms)`
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        message: error.response?.data || error.message
      }
    }
  }

  const runTests = async () => {
    setTesting(true)
    setResults({})

    const tests = {
      'AI Usage (Day)': () => dashboardService.getAIUsage('day'),
      'AI Usage (Week)': () => dashboardService.getAIUsage('week'),
      'AI Usage (Month)': () => dashboardService.getAIUsage('month'),
      'Trends (Day)': () => dashboardService.getTrends('day'),
      'Trends (Week)': () => dashboardService.getTrends('week'),
      'Trends (Month)': () => dashboardService.getTrends('month'),
      'Intents': () => dashboardService.getIntents(),
      'Avg Response': () => dashboardService.getResponseTimes(),
    }

    const newResults = {}
    
    for (const [name, testFn] of Object.entries(tests)) {
      console.log(`Testing: ${name}`)
      newResults[name] = await testEndpoint(name, testFn)
      setResults({ ...newResults })
    }

    setTesting(false)
  }

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      width: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      background: 'white',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>
        🔍 API Endpoint Validator
      </h3>
      
      <button
        onClick={runTests}
        disabled={testing}
        style={{
          width: '100%',
          padding: '10px',
          background: testing ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: testing ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '15px'
        }}
      >
        {testing ? '⏳ Testing...' : '▶️ Run All Tests'}
      </button>

      <div style={{ fontSize: '13px' }}>
        {Object.entries(results).map(([name, result]) => (
          <div
            key={name}
            style={{
              padding: '10px',
              marginBottom: '8px',
              background: result.success ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${result.success ? '#86efac' : '#fca5a5'}`,
              borderRadius: '4px'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <strong style={{ color: '#1f2937' }}>{name}</strong>
              <span style={{ fontSize: '18px' }}>
                {result.success ? '✅' : '❌'}
              </span>
            </div>
            
            {result.success ? (
              <div style={{ color: '#059669', fontSize: '12px' }}>
                {result.message}
                <div style={{ marginTop: '4px', color: '#6b7280' }}>
                  Records: {Array.isArray(result.data) ? result.data.length : 'N/A'}
                </div>
              </div>
            ) : (
              <div style={{ color: '#dc2626', fontSize: '12px' }}>
                Status: {result.status || 'Network Error'}
                <div style={{ marginTop: '4px', wordBreak: 'break-word' }}>
                  {result.message}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {Object.keys(results).length === 0 && !testing && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#6b7280',
          fontSize: '13px'
        }}>
          Click "Run All Tests" to validate API endpoints
        </div>
      )}
    </div>
  )
}

export default APIValidator

