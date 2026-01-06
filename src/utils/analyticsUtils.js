import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isoWeek)

export const filterByDateRange = (entries, startDate, endDate) => {
  if (!startDate && !endDate) return entries
  return entries.filter((entry) => {
    if (!entry?.timestamp) return false
    const d = dayjs(entry.timestamp)
    if (startDate && d.isBefore(dayjs(startDate), 'day')) return false
    if (endDate && d.isAfter(dayjs(endDate), 'day')) return false
    return true
  })
}

export const getTimePeriodKey = (timestamp, groupBy) => {
  const date = dayjs(timestamp)
  switch (groupBy) {
    case 'hour':
      return date.startOf('hour').toISOString()
    case 'day':
      return date.startOf('day').format('YYYY-MM-DD')
    case 'week':
      return `W${date.isoWeek()}-${date.year()}`
    case 'month':
      return date.startOf('month').format('YYYY-MM')
    default:
      return date.startOf('day').format('YYYY-MM-DD')
  }
}

export const initializeSentimentCounts = () => ({
  positive: 0,
  negative: 0,
  neutral: 0,
  mixed: 0,
  unknown: 0,
})

export const calculateSatisfactionScore = (sentimentCounts) => {
  const total = Object.values(sentimentCounts).reduce((s, c) => s + c, 0)
  if (total === 0) return 0
  const score = ((sentimentCounts.positive || 0) * 1.0 + (sentimentCounts.neutral || 0) * 0.5 + (sentimentCounts.mixed || 0) * 0.5 + (sentimentCounts.negative || 0) * 0.0) / total
  return +((score * 100).toFixed(2))
}

export const calculateSentimentPercentages = (sentimentCounts) => {
  const total = Object.values(sentimentCounts).reduce((s, c) => s + c, 0)
  if (total === 0) return { positivePercent: 0, negativePercent: 0, neutralPercent: 0, mixedPercent: 0, unknownPercent: 0 }
  return {
    positivePercent: +(((sentimentCounts.positive || 0) / total * 100).toFixed(2)),
    negativePercent: +(((sentimentCounts.negative || 0) / total * 100).toFixed(2)),
    neutralPercent: +(((sentimentCounts.neutral || 0) / total * 100).toFixed(2)),
    mixedPercent: +(((sentimentCounts.mixed || 0) / total * 100).toFixed(2)),
    unknownPercent: +(((sentimentCounts.unknown || 0) / total * 100).toFixed(2)),
  }
}

export const formatSentimentDistribution = (sentimentCounts, totalQueries) => {
  return Object.entries(sentimentCounts)
    .map(([sentiment, count]) => ({ sentiment, count, percentage: totalQueries > 0 ? ((count / totalQueries) * 100).toFixed(2) : '0.00' }))
    .sort((a, b) => b.count - a.count)
}

export const extractParameterStats = (parameters) => {
  const stats = {}
  if (parameters) {
    if (parameters.action) stats.action = parameters.action
    if (parameters.amenities && Array.isArray(parameters.amenities) && parameters.amenities.length > 0) stats.amenities = parameters.amenities
    if (parameters.fuel?.fuel_type && Array.isArray(parameters.fuel.fuel_type) && parameters.fuel.fuel_type.length > 0) stats.fuel_type = parameters.fuel.fuel_type
    if (parameters.fuel?.fuel_priority) stats.fuel_priority = parameters.fuel.fuel_priority
  }
  return stats
}

export const aggregateParameterCounts = (parametersList) => {
  const aggregated = { actions: {}, amenities: {}, fuel_types: {}, fuel_priorities: {} }
  for (const params of parametersList) {
    if (params.action) aggregated.actions[params.action] = (aggregated.actions[params.action] || 0) + 1
    if (params.amenities) for (const a of params.amenities) aggregated.amenities[a] = (aggregated.amenities[a] || 0) + 1
    if (params.fuel_type) for (const f of params.fuel_type) aggregated.fuel_types[f] = (aggregated.fuel_types[f] || 0) + 1
    if (params.fuel_priority) aggregated.fuel_priorities[params.fuel_priority] = (aggregated.fuel_priorities[params.fuel_priority] || 0) + 1
  }
  return aggregated
}

export const formatParameterStats = (aggregated) => {
  const formatted = {}
  if (Object.keys(aggregated.actions).length > 0) formatted.actions = Object.entries(aggregated.actions).map(([action, count]) => ({ action, count })).sort((a, b) => b.count - a.count)
  if (Object.keys(aggregated.amenities).length > 0) formatted.amenities = Object.entries(aggregated.amenities).map(([amenity, count]) => ({ amenity, count })).sort((a, b) => b.count - a.count)
  if (Object.keys(aggregated.fuel_types).length > 0) formatted.fuel_types = Object.entries(aggregated.fuel_types).map(([fuel_type, count]) => ({ fuel_type, count })).sort((a, b) => b.count - a.count)
  if (Object.keys(aggregated.fuel_priorities).length > 0) formatted.fuel_priorities = Object.entries(aggregated.fuel_priorities).map(([fuel_priority, count]) => ({ fuel_priority, count })).sort((a, b) => b.count - a.count)
  return formatted
}

