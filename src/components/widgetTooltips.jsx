import React from 'react'

export const widgetTooltips = {
  sentimentAnalysis: (
    <>
      <h4>Sentiment Analysis</h4>
      <p>Analyzes the emotional tone of user interactions with the AI assistant.</p>
      <p><strong>Sentiment Types:</strong></p>
      <ul>
        <li><strong>Positive:</strong> User expresses satisfaction, happiness, or approval</li>
        <li><strong>Negative:</strong> User expresses frustration, dissatisfaction, or complaints</li>
        <li><strong>Neutral:</strong> User's tone is factual or informational without emotion</li>
        <li><strong>Mixed:</strong> User expresses both positive and negative emotions</li>
        <li><strong>Unknown:</strong> Sentiment cannot be determined from the interaction</li>
      </ul>
      <p><strong>Satisfaction Score (0-100):</strong> A weighted metric that measures overall user satisfaction based on sentiment distribution.</p>
      <p><strong>Calculation:</strong></p>
      <ul>
        <li>Positive interactions = 100% weight (1.0)</li>
        <li>Neutral interactions = 50% weight (0.5)</li>
        <li>Mixed interactions = 50% weight (0.5)</li>
        <li>Negative interactions = 0% weight (0.0)</li>
        <li>Unknown interactions = Not counted</li>
      </ul>
      <p><em>Example: If you have 60% positive, 20% neutral, and 20% negative interactions, the score would be: (60×1.0 + 20×0.5 + 20×0.0) / 100 = 70 points</em></p>
      <p><strong>Sentiment Trend:</strong> Shows how sentiment changes over time across the selected date range.</p>
    </>
  ),

  trends: (
    <>
      <h4>AI Usage Trends</h4>
      <p>Tracks the volume and patterns of AI assistant usage over time.</p>
      <p><strong>Metrics:</strong></p>
      <ul>
        <li><strong>Total Prompts:</strong> Number of user questions/requests to the AI</li>
        <li><strong>Average:</strong> Represents the mean number of Total Prompts across the selected time period. Helps identify typical usage as well as spikes or dips.</li>
        <li><strong>Trend:</strong> Represents the overall direction of change in Total Prompts across the selected time period, indicating whether usage is increasing, decreasing, or stable</li>
      </ul>
      <p>Use this to identify usage patterns, peak times, and adoption trends.</p>
    </>
  ),

  intents: (
    <>
      <h4>Overall Intent Distribution</h4>
      <p>Categorizes user queries by their underlying purpose or goal.</p>
      <p><strong>Intent Types:</strong></p>
      <ul>
        <li><strong>Site Locator:</strong> Users looking for fuel stations, amenities, prices, or availability. Includes:
          <ul>
            <li><strong>Proximity:</strong> Location-based searches (nearest, cheapest)</li>
            <li><strong>Fuel Types:</strong> Fuel preferences (Diesel, Regular, Premium)</li>
            <li><strong>Amenities:</strong> Facilities like restrooms, food, parking, showers, or other services</li>
          </ul>
        </li>
        <li><strong>Card Management:</strong> Users managing their fleet cards, checking status, balance, history, or requesting card unlock for fuel transactions.</li>
        <li><strong>Account Management:</strong> Users updating account payment date, statement date, or other account information.</li>
        <li><strong>Fuel Code:</strong> Users requesting or verifying fuel authorization codes for transactions.</li>
      </ul>
      <p>Understanding intents helps optimize AI responses and identify common user needs.</p>
    </>
  ),

  userTrends: (
    <>
      <h4>User Engagement Overview</h4>
      <p>Provides a high-level view of user adoption and activity across the platform.</p>
      <p><strong>Metrics:</strong></p>
      <ul>
        <li><strong>Total Users:</strong> Cumulative count of all unique users who have ever interacted with the AI</li>
        <li><strong>Active Users:</strong> Number of users who have interacted with the AI in the last 30 days</li>
        <li><strong>New Users:</strong> Number of users making their first interaction within the selected date range</li>
        <li><strong>Retention Rate:</strong> Percentage of total users who were active in the most recent 30 days</li>
      </ul>
      <p>Track user growth, retention, and engagement levels.</p>
    </>
  ),

  sessionDuration: (
    <>
      <h4>Session Duration</h4>
      <p>Measures how long users spend in conversation with the AI assistant.</p>
      <p><strong>Metrics:</strong></p>
      <ul>
        <li><strong>Average Duration:</strong> Mean session length across all sessions</li>
        <li><strong>Min Duration:</strong> Shortest session recorded</li>
        <li><strong>Max Duration:</strong> Longest session recorded</li>
      </ul>
      <p>Longer sessions may indicate deeper engagement or complex problem-solving.</p>
    </>
  ),

  sessionsByFlavor: (
    <>
      <h4>Sessions by App Flavor</h4>
      <p>Breaks down AI usage across different application variants or environments.</p>
      <p><strong>App Flavors:</strong></p>
      <ul>
        <li><strong>My-Cardz:</strong>Sessions from the My-Cardz app</li>
        <li><strong>Corpay Fleet:</strong>Sessions from the Corpay Fleet app</li>
      </ul>
      <p>Helps identify which environments are most actively used and tested.</p>
    </>
  ),

  sessionsMap: (
    <>
      <h4>Geographic Distribution</h4>
      <p>Shows where users are located geographically when interacting with the AI.</p>
      <p><strong>Insights:</strong></p>
      <ul>
        <li>Identify primary user regions and markets</li>
        <li>Understand global vs. regional usage patterns</li>
        <li>Plan localization and regional support</li>
        <li>Detect unusual geographic activity</li>
      </ul>
      <p>Location data is based on IP geolocation and may not be 100% accurate.</p>
    </>
  ),

  aiUsage: (
    <>
      <h4>AI Usage Overview</h4>
      <p>Comprehensive view of AI assistant utilization and performance.</p>
      <p><strong>Key Metrics:</strong></p>
      <ul>
        <li><strong>Query Volume:</strong> Total number of AI requests</li>
        <li><strong>Response Time:</strong> Average time to generate responses</li>
        <li><strong>Success Rate:</strong> Percentage of successful interactions</li>
        <li><strong>Error Rate:</strong> Percentage of failed or problematic interactions</li>
      </ul>
     <p>Monitor overall AI health and performance trends.</p>
    </>
  ),

  productFeedback: (
    <>
      <h4>Product Feedback</h4>
      <p>Collects and analyzes user feedback about product features and experiences.</p>
      <p><strong>Feedback Types:</strong></p>
      <ul>
        <li><strong>Excited (🎉):</strong> Users expressing enthusiasm and delight with features</li>
        <li><strong>Happy (😊):</strong> Users satisfied with their experience</li>
        <li><strong>Sad (😔):</strong> Users expressing dissatisfaction or frustration</li>
      </ul>
      <p><strong>Organization:</strong></p>
      <ul>
        <li><strong>Features:</strong> Main product capabilities (e.g., ADMIN Experience, Route Planning)</li>
        <li><strong>Modules:</strong> Specific areas within features (e.g., User Settings, Navigation)</li>
      </ul>
      <p><strong>Summary Cards:</strong> Quick overview showing percentage distribution of each feedback type and total feedback count.</p>
      <p><strong>Feature Breakdown:</strong> Expandable list showing feedback grouped by feature with module-level details. Click on any feature to see which modules received feedback.</p>
      <p>Use this data to identify areas of success and opportunities for improvement.</p>
    </>
  ),

  accountAnalytics: (
    <>
      <h4>Account Analytics</h4>
      <p>Tracks AI usage patterns and trends by account code for account-specific insights.</p>
      <p><strong>Account Code:</strong> Extracted from the sysAccountId field (e.g., "A-083_00101_3" → "A-083")</p>
      <p><strong>Search Functionality:</strong></p>
      <ul>
        <li><strong>Default View:</strong> Shows aggregated data for all accounts across the selected date range</li>
        <li><strong>Filtered View:</strong> Enter an account code (e.g., "A-083") to see data for that specific account</li>
        <li><strong>Partial Match:</strong> Search supports partial matching (e.g., "A-0" will match "A-083", "A-045", etc.)</li>
      </ul>
      <p><strong>Metrics:</strong></p>
      <ul>
        <li><strong>Total Queries:</strong> Total number of AI requests for the account(s)</li>
        <li><strong>Avg Daily:</strong> Average queries per day in the selected period</li>
        <li><strong>Avg Users:</strong> Average unique users per day</li>
      </ul>
      <p><strong>Trend Chart:</strong> Visualizes query volume over time to identify usage patterns, peak periods, and growth trends.</p>
      <p>Use this to monitor account-specific adoption, identify high-usage accounts, and track engagement trends.</p>
    </>
  ),
}

