import dayjs from 'dayjs'

const filterByDateRange = (entries, startDate, endDate) => {
  if (!startDate || !endDate) return entries
  const start = dayjs(startDate).startOf('day')
  const end = dayjs(endDate).endOf('day')
  return entries.filter((e) => {
    const d = dayjs(e.dateTime)
    return d.isAfter(start) && d.isBefore(end)
  })
}

const calculateSummary = (entries) => {
  const totalFeedback = entries.length
  const happy = entries.filter((e) => e.feedbackType === 'H').length
  const excited = entries.filter((e) => e.feedbackType === 'E').length
  const sad = entries.filter((e) => e.feedbackType === 'S').length
  return {
    totalFeedback,
    happy,
    excited,
    sad,
    happyPercent: totalFeedback > 0 ? (happy / totalFeedback) * 100 : 0,
    excitedPercent: totalFeedback > 0 ? (excited / totalFeedback) * 100 : 0,
    sadPercent: totalFeedback > 0 ? (sad / totalFeedback) * 100 : 0,
  }
}

const groupByFeature = (entries) => {
  const totalEntries = entries.length
  const featureMap = {}

  for (const entry of entries) {
    const feature = entry.feature || 'Unknown'
    const module = entry.module || 'Unknown'
    if (!featureMap[feature]) featureMap[feature] = { happy: 0, excited: 0, sad: 0, modules: {} }
    if (!featureMap[feature].modules[module]) featureMap[feature].modules[module] = { happy: 0, excited: 0, sad: 0 }

    if (entry.feedbackType === 'H') {
      featureMap[feature].happy++
      featureMap[feature].modules[module].happy++
    } else if (entry.feedbackType === 'E') {
      featureMap[feature].excited++
      featureMap[feature].modules[module].excited++
    } else if (entry.feedbackType === 'S') {
      featureMap[feature].sad++
      featureMap[feature].modules[module].sad++
    }
  }

  return Object.entries(featureMap)
    .map(([feature, data]) => {
      const total = data.happy + data.excited + data.sad
      const positiveCount = data.happy + data.excited
      const sentiment = positiveCount / total > 0.6 ? 'positive' : (data.sad / total > 0.4 ? 'negative' : 'neutral')
      const percentage = totalEntries > 0 ? ((total / totalEntries) * 100).toFixed(1) : '0.0'
      const modules = Object.entries(data.modules)
        .map(([module, counts]) => {
          const moduleTotal = counts.happy + counts.excited + counts.sad
          const modulePercentage = total > 0 ? ((moduleTotal / total) * 100).toFixed(1) : '0.0'
          return { module, count: moduleTotal, happy: counts.happy, excited: counts.excited, sad: counts.sad, percentage: modulePercentage }
        })
        .sort((a, b) => b.count - a.count)
      return { feature, count: total, happy: data.happy, excited: data.excited, sad: data.sad, sentiment, percentage, modules }
    })
    .sort((a, b) => b.count - a.count)
}

const calculateTrends = (entries) => {
  const dateMap = {}
  for (const entry of entries) {
    const dateKey = dayjs(entry.dateTime).format('YYYY-MM-DD')
    if (!dateMap[dateKey]) dateMap[dateKey] = { happy: 0, excited: 0, sad: 0 }
    if (entry.feedbackType === 'H') dateMap[dateKey].happy++
    else if (entry.feedbackType === 'E') dateMap[dateKey].excited++
    else if (entry.feedbackType === 'S') dateMap[dateKey].sad++
  }
  return Object.entries(dateMap)
    .map(([date, c]) => ({ date, displayDate: dayjs(date).format('MMM DD'), happy: c.happy, excited: c.excited, sad: c.sad, total: c.happy + c.excited + c.sad }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export const processProductFeedback = (entries, startDate, endDate) => {
  const filtered = filterByDateRange(entries, startDate, endDate)
  return {
    summary: calculateSummary(filtered),
    byFeature: groupByFeature(filtered),
    trends: calculateTrends(filtered),
    recentFeedback: filtered
      .slice() // shallow copy before sort
      .sort((a, b) => dayjs(b.dateTime).valueOf() - dayjs(a.dateTime).valueOf())
      .slice(0, 10),
  }
}

