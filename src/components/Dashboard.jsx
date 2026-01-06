import React from 'react'
import AIUsage from './AIUsage'
import Trends from './Trends'
import Intents from './Intents'
import UserTrends from './UserTrends'
import SentimentAnalysis from './SentimentAnalysis'
import ProductFeedback from './ProductFeedback'
import AccountAnalytics from './AccountAnalytics'
// New Session widgets
import SessionDuration from './SessionDuration'
import SessionsByFlavor from './SessionsByFlavor'
import SessionsMap from './SessionsMap'
import { SessionsProvider } from '../contexts/SessionsContext'
import './Dashboard.css'

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-grid">

        {/* Sentiment Analysis Section - Full Width */}
        <div className="dashboard-row full-width">
          <SentimentAnalysis />
        </div>

        {/* Trends and Account Analytics Row */}
        <div className="dashboard-row">
          <Trends />
          <SessionDuration />
        </div>

        <div className="dashboard-row full-width">
          <Intents />
        </div>

        {/* Session Duration Row */}
        {/* <div className="dashboard-row full-width">
          <AccountAnalytics />
        </div> */}

        {/* Product Feedback Section - Full Width */}
        <div className="dashboard-row full-width">
          <ProductFeedback />
        </div>

        <div className="dashboard-row">
          <UserTrends />
          <SessionsMap />
        </div>

        {/* User Trends and Geographic Map Row */}
        <SessionsProvider>

          {/* Session Analytics Section - Single API call shared between widgets */}
          {/* <div className="dashboard-row">
            <SessionsByFlavor />
          </div> */}
        </SessionsProvider>

      </div>
    </div>
  )
}

export default Dashboard
