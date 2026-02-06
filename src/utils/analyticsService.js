import dayjs from 'dayjs'
import {
  filterByDateRange,
  getTimePeriodKey,
  initializeSentimentCounts,
  calculateSatisfactionScore,
  calculateSentimentPercentages,
  formatSentimentDistribution,
  extractParameterStats,
  aggregateParameterCounts,
  formatParameterStats,
} from './analyticsUtils'

// Process Sentiment Analysis
export const processSentimentAnalysis = (allEntries, groupBy, startDate, endDate) => {
  const entries = filterByDateRange(allEntries, startDate, endDate)

  if (!groupBy) {
    const sentimentCounts = initializeSentimentCounts()
    for (const e of entries) {
      const s = e.sentiment || 'unknown'
      sentimentCounts[s] = (sentimentCounts[s] || 0) + 1
    }

    const totalQueries = entries.length
    const sentimentPercentages = calculateSentimentPercentages(sentimentCounts)
    const sentimentDistribution = formatSentimentDistribution(sentimentCounts, totalQueries)

    const dateWiseData = {}
    for (const e of entries) {
      if (!e.timestamp) continue
      const dateKey = dayjs(e.timestamp).format('YYYY-MM-DD')
      if (!dateWiseData[dateKey]) dateWiseData[dateKey] = initializeSentimentCounts()
      const s = e.sentiment || 'unknown'
      dateWiseData[dateKey][s] = (dateWiseData[dateKey][s] || 0) + 1
    }

    const dateWiseSentiments = Object.entries(dateWiseData)
      .map(([date, counts]) => {
        const dayTotal = Object.values(counts).reduce((sum, c) => sum + c, 0)
        return {
          date,
          totalQueries: dayTotal,
          sentimentCounts: {
            positive: counts.positive || 0,
            negative: counts.negative || 0,
            neutral: counts.neutral || 0,
            mixed: counts.mixed || 0,
            unknown: counts.unknown || 0,
          },
          sentimentPercentages: calculateSentimentPercentages(counts),
          satisfactionScore: calculateSatisfactionScore(counts),
        }
      })
      .sort((a, b) => (a.date > b.date ? 1 : -1))

    return {
      totalQueries,
      ...sentimentPercentages,
      sentimentDistribution,
      satisfactionScore: calculateSatisfactionScore(sentimentCounts),
      dateRange: startDate || endDate ? { startDate, endDate } : undefined,
      dateWiseSentiments,
    }
  }

  const grouped = {}
  for (const e of entries) {
    if (!e.timestamp) continue
    const timeKey = getTimePeriodKey(e.timestamp, groupBy)
    if (!grouped[timeKey]) grouped[timeKey] = initializeSentimentCounts()
    const s = e.sentiment || 'unknown'
    grouped[timeKey][s] = (grouped[timeKey][s] || 0) + 1
  }

  const result = Object.entries(grouped)
    .map(([period, counts]) => {
      const totalQueries = Object.values(counts).reduce((sum, c) => sum + c, 0)
      const sentimentPercentages = calculateSentimentPercentages(counts)
      const sentiments = formatSentimentDistribution(counts, totalQueries)
      return {
        period,
        totalQueries,
        ...sentimentPercentages,
        sentiments,
        sentimentCounts: {
          positive: counts.positive || 0,
          negative: counts.negative || 0,
          neutral: counts.neutral || 0,
          mixed: counts.mixed || 0,
          unknown: counts.unknown || 0,
        },
        satisfactionScore: calculateSatisfactionScore(counts),
        dominantSentiment: sentiments[0]?.sentiment || 'unknown',
      }
    })
    .sort((a, b) => (a.period > b.period ? 1 : -1))

  for (let i = 1; i < result.length; i++) {
    const prev = result[i - 1]
    const curr = result[i]
    const delta = curr.satisfactionScore - prev.satisfactionScore
    result[i].satisfactionTrend = +delta.toFixed(2)
  }
  if (result.length > 0) result[0].satisfactionTrend = null
  return result
}



// Process Query Trends
export const processQueryTrends = (allEntries, groupBy, startDate, endDate) => {
  const entries = filterByDateRange(allEntries, startDate, endDate)
  const grouped = {}
  for (const e of entries) {
    const key = dayjs(e.timestamp).startOf(groupBy).toISOString()
    grouped[key] = (grouped[key] || 0) + 1
  }
  const result = Object.entries(grouped)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => new Date(a.time) - new Date(b.time))

  // Fill in missing dates with zero values (only for daily grouping)
  return fillMissingDatesForTrends(result, groupBy, startDate, endDate)
}

// Helper function to fill missing dates in Query Trends
const fillMissingDatesForTrends = (data, groupBy, startDate, endDate) => {
  // Only fill missing dates for daily data
  if (groupBy !== 'day') {
    return data
  }

  // Determine the date range to fill
  let firstDate, lastDate

  if (startDate && endDate) {
    firstDate = dayjs(startDate).startOf('day')
    lastDate = dayjs(endDate).startOf('day')
  } else if (data.length > 0) {
    firstDate = dayjs(data[0].time).startOf('day')
    lastDate = dayjs(data[data.length - 1].time).startOf('day')
  } else {
    return data
  }

  const filledData = []
  const dataMap = new Map(data.map(item => [dayjs(item.time).startOf('day').toISOString(), item]))

  let currentDate = firstDate

  while (currentDate.isBefore(lastDate) || currentDate.isSame(lastDate, 'day')) {
    const dateKey = currentDate.startOf('day').toISOString()

    if (dataMap.has(dateKey)) {
      filledData.push(dataMap.get(dateKey))
    } else {
      // Add empty data point for missing date
      filledData.push({
        time: dateKey,
        count: 0,
      })
    }

    currentDate = currentDate.add(1, 'day')
  }

  return filledData
}

// Process Average Response Time
export const processAvgResponseTime = (allEntries, startDate, endDate) => {
  const entries = filterByDateRange(allEntries, startDate, endDate)
  const grouped = {}
  for (const e of entries) {
    const date = dayjs(e.timestamp).format('YYYY-MM-DD')
    if (!grouped[date]) grouped[date] = { sum: 0, count: 0 }
    grouped[date].sum += e.responseTime || 0
    grouped[date].count++
  }
  return Object.entries(grouped).map(([date, { sum, count }]) => ({ date, avgResponseTime: count ? sum / count : 0 }))
}

// Process Intent Distribution
export const processIntentDistribution = (allEntries, groupBy, startDate, endDate) => {
  const entries = filterByDateRange(allEntries, startDate, endDate)
  if (!groupBy) {
    const counts = {}
    const intentParameters = {}
    for (const e of entries) {
      counts[e.intent] = (counts[e.intent] || 0) + 1
      if (!intentParameters[e.intent]) intentParameters[e.intent] = []
      const paramStats = extractParameterStats(e.parameters)
      if (Object.keys(paramStats).length > 0) intentParameters[e.intent].push(paramStats)
    }
    const totalQueries = entries.length
    const intentDistribution = Object.entries(counts).map(([intent, count]) => {
      const paramList = intentParameters[intent] || []
      const aggregatedParams = aggregateParameterCounts(paramList)
      const formattedParams = formatParameterStats(aggregatedParams)
      return { intent, count, percentage: totalQueries > 0 ? ((count / totalQueries) * 100).toFixed(2) : '0.00', parameterUsage: formattedParams }
    })
    return { totalQueries, intents: intentDistribution }
  }

  const grouped = {}
  const groupedParameters = {}
  for (const e of entries) {
    if (!e.timestamp || !e.intent) continue
    const timeKey = getTimePeriodKey(e.timestamp, groupBy)
    if (!grouped[timeKey]) { grouped[timeKey] = {}; groupedParameters[timeKey] = {} }
    grouped[timeKey][e.intent] = (grouped[timeKey][e.intent] || 0) + 1
    if (!groupedParameters[timeKey][e.intent]) groupedParameters[timeKey][e.intent] = []
    const paramStats = extractParameterStats(e.parameters)
    if (Object.keys(paramStats).length > 0) groupedParameters[timeKey][e.intent].push(paramStats)
  }

  const result = Object.entries(grouped)
    .map(([period, intentCounts]) => {
      const totalQueries = Object.values(intentCounts).reduce((s, c) => s + c, 0)
      const intents = Object.entries(intentCounts)
        .map(([intent, count]) => {
          const paramList = groupedParameters[period][intent] || []
          const aggregatedParams = aggregateParameterCounts(paramList)
          const formattedParams = formatParameterStats(aggregatedParams)
          return { intent, count, percentage: totalQueries > 0 ? ((count / totalQueries) * 100).toFixed(2) : '0.00', parameterUsage: formattedParams }
        })
        .sort((a, b) => b.count - a.count)
      return { period, totalQueries, intents }
    })
    .sort((a, b) => (a.period > b.period ? 1 : -1))

  return result
}


// Process Trends with Top Queries
export const processTrendsWithTopQueries = (allEntries, groupBy, topN = 3) => {
  const grouped = {}
  for (const e of allEntries) {
    if (!e.timestamp || !e.query) continue
    const key = dayjs(e.timestamp).startOf(groupBy).toISOString()
    if (!grouped[key]) grouped[key] = {}
    grouped[key][e.query] = (grouped[key][e.query] || 0) + 1
  }
  const result = Object.entries(grouped).map(([time, queries]) => {
    const sorted = Object.entries(queries).sort((a, b) => b[1] - a[1]).slice(0, topN).map(([query, count]) => ({ query, count }))
    return { time, totalCount: Object.values(queries).reduce((a, b) => a + b, 0), topQueries: sorted }
  })
  return result.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
}

// Process AI Usage Trends
export const processAIUsageTrends = (allEntries, groupBy, startDate, endDate) => {
  const entries = filterByDateRange(allEntries, startDate, endDate)
  const grouped = {}
  for (const e of entries) {
    const timeKey = getTimePeriodKey(e.timestamp, groupBy)
    if (!grouped[timeKey]) grouped[timeKey] = { users: new Set(), total: 0, sumResp: 0 }
    grouped[timeKey].total++
    grouped[timeKey].sumResp += e.responseTime || 0
    grouped[timeKey].users.add(e.userId || 'unknown')
  }
  const result = Object.entries(grouped)
    .map(([period, { users, total, sumResp }]) => ({
      period,
      totalQueries: total,
      uniqueUsers: users.size,
      avgResponseTime: total ? Math.round(sumResp / total) : 0,
      growthRate: null,
    }))
    .sort((a, b) => (a.period > b.period ? 1 : -1))
  for (let i = 1; i < result.length; i++) {
    const prev = result[i - 1]
    const curr = result[i]
    const rate = prev.totalQueries > 0 ? ((curr.totalQueries - prev.totalQueries) / prev.totalQueries) * 100 : null
    result[i].growthRate = rate ? +rate.toFixed(2) : null
  }
  return result
}


// Process User Analytics - Total Users
export const processUserTotal = (allEntries, startDate, endDate) => {
  const uniqueUsers = new Set()
  const activeUsers = new Set()
  const userFirstSeen = new Map() // Track earliest timestamp per user
  const thirtyDaysAgo = dayjs().subtract(30, 'day')

  // First pass: find earliest timestamp for each user
  for (const e of allEntries) {
    if (e.userId && e.timestamp) {
      uniqueUsers.add(e.userId)
      const timestamp = dayjs(e.timestamp)

      // Track earliest timestamp for this user
      if (!userFirstSeen.has(e.userId) || timestamp.isBefore(userFirstSeen.get(e.userId))) {
        userFirstSeen.set(e.userId, timestamp)
      }

      // Track active users (last 30 days)
      if (timestamp.isAfter(thirtyDaysAgo)) {
        activeUsers.add(e.userId)
      }
    }
  }

  // Count new users within the selected date range
  let newUsersCount = 0
  if (startDate && endDate) {
    const start = dayjs(startDate).startOf('day')
    const end = dayjs(endDate).endOf('day')

    for (const [userId, firstTimestamp] of userFirstSeen.entries()) {
      if ((firstTimestamp.isAfter(start) || firstTimestamp.isSame(start, 'day')) &&
          (firstTimestamp.isBefore(end) || firstTimestamp.isSame(end, 'day'))) {
        newUsersCount++
      }
    }
  }

  const totalUsers = uniqueUsers.size
  const activeCount = activeUsers.size
  const retentionRate = totalUsers > 0 ? (activeCount / totalUsers) * 100 : 0

  return {
    totalUsers,
    activeUsers: activeCount,
    newUsers: newUsersCount,
    retentionRate: +retentionRate.toFixed(1)
  }
}

// Process User Creation Trends
export const processUserCreationTrends = (allEntries, groupBy, startDate, endDate) => {
  const entries = filterByDateRange(allEntries, startDate, endDate)
  const grouped = {}
  for (const e of entries) {
    if (!e.timestamp || !e.userId) continue
    const timeKey = getTimePeriodKey(e.timestamp, groupBy)
    if (!grouped[timeKey]) grouped[timeKey] = new Set()
    grouped[timeKey].add(e.userId)
  }
  return Object.entries(grouped).map(([period, users]) => ({ period, count: users.size })).sort((a, b) => (a.period > b.period ? 1 : -1))
}

// Process Active User Trends
export const processUserActiveTrends = (allEntries, groupBy, startDate, endDate) => {
  const entries = filterByDateRange(allEntries, startDate, endDate)
  const grouped = {}
  for (const e of entries) {
    if (!e.timestamp || !e.userId) continue
    const timeKey = getTimePeriodKey(e.timestamp, groupBy)
    if (!grouped[timeKey]) grouped[timeKey] = new Set()
    grouped[timeKey].add(e.userId)
  }
  return Object.entries(grouped).map(([period, users]) => ({ period, count: users.size })).sort((a, b) => (a.period > b.period ? 1 : -1))
}

// Process User Retention
export const processUserRetention = (allEntries, groupBy, startDate, endDate) => {
  const entries = filterByDateRange(allEntries, startDate, endDate)
  const grouped = {}
  const cumulativeUsers = {}
  for (const e of entries) {
    if (!e.timestamp || !e.userId) continue
    const timeKey = getTimePeriodKey(e.timestamp, groupBy)
    if (!grouped[timeKey]) grouped[timeKey] = new Set()
    grouped[timeKey].add(e.userId)
  }
  const sortedPeriods = Object.keys(grouped).sort()
  const allUsers = new Set()
  for (const period of sortedPeriods) {
    grouped[period].forEach((u) => allUsers.add(u))
    cumulativeUsers[period] = new Set(allUsers)
  }
  return Object.entries(grouped)
    .map(([period, activeUsers]) => {
      const totalUsers = cumulativeUsers[period]?.size || 0
      const active = activeUsers.size
      const retentionRate = totalUsers > 0 ? (active / totalUsers) * 100 : 0
      return { period, retentionRate: +retentionRate.toFixed(1), activeUsers: active, totalUsers }
    })
    .sort((a, b) => (a.period > b.period ? 1 : -1))
}
