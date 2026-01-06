import dayjs from 'dayjs'
import { filterByDateRange } from './analyticsUtils'

// Extract account code from sysAccountId: "A-083_00101_3" -> "A-083"
export const extractAccountCode = (sysAccountId) => {
  if (!sysAccountId) return 'Unknown'
  const parts = sysAccountId.split('_')
  return parts[0] || 'Unknown'
}

// Process Account Analytics: groups by day and aggregates totals
export const processAccountAnalytics = (allEntries, accountCode, startDate, endDate) => {
  let entries = filterByDateRange(allEntries, startDate, endDate)

  if (accountCode && accountCode.trim() !== '') {
    const needle = accountCode.toLowerCase()
    entries = entries.filter((e) => (extractAccountCode(e.sysAccountId).toLowerCase().includes(needle)))
  }

  const grouped = {} // dateKey -> { users: Set, total: number, sumResp: number }
  for (const e of entries) {
    if (!e?.timestamp) continue
    const dateKey = dayjs(e.timestamp).format('YYYY-MM-DD')
    if (!grouped[dateKey]) grouped[dateKey] = { users: new Set(), total: 0, sumResp: 0 }
    if (e.userId) grouped[dateKey].users.add(e.userId)
    grouped[dateKey].total++
    grouped[dateKey].sumResp += e.responseTime || 0
  }

  return Object.entries(grouped)
    .map(([period, { users, total, sumResp }]) => ({
      period,
      totalQueries: total,
      uniqueUsers: users.size,
      avgResponseTime: total ? Math.round(sumResp / total) : 0,
    }))
    .sort((a, b) => (a.period > b.period ? 1 : -1))
}

// Get Account Summary: aggregates per account code
export const getAccountSummary = (allEntries, accountCode, startDate, endDate) => {
  let entries = filterByDateRange(allEntries, startDate, endDate)
  const accountMap = {} // code -> { users:Set, total:number, sumResp:number, timestamps:string[] }

  for (const e of entries) {
    const code = extractAccountCode(e.sysAccountId)
    if (accountCode && accountCode.trim() !== '' && !code.toLowerCase().includes(accountCode.toLowerCase())) continue

    if (!accountMap[code]) accountMap[code] = { users: new Set(), total: 0, sumResp: 0, timestamps: [] }
    if (e.userId) accountMap[code].users.add(e.userId)
    accountMap[code].total++
    accountMap[code].sumResp += e.responseTime || 0
    if (e.timestamp) accountMap[code].timestamps.push(e.timestamp)
  }

  return Object.entries(accountMap)
    .map(([code, data]) => {
      const sorted = data.timestamps.sort()
      return {
        accountCode: code,
        totalQueries: data.total,
        uniqueUsers: data.users.size,
        avgResponseTime: data.total ? Math.round(data.sumResp / data.total) : 0,
        firstSeen: sorted[0] || '',
        lastSeen: sorted[sorted.length - 1] || '',
      }
    })
    .sort((a, b) => b.totalQueries - a.totalQueries)
}

