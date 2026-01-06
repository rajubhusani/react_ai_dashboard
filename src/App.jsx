import React from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import { SessionsProvider } from './contexts/SessionsContext'
import './App.css'

function App() {
  return (
    <SessionsProvider>
      <div className="app">
        <Header />
        <Dashboard />
      </div>
    </SessionsProvider>
  )
}

export default App
