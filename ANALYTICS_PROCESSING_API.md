# Analytics Processing API Reference

## Overview
This document provides a quick reference for all client-side analytics processing functions.

## File Structure

- **`src/utils/analyticsUtils.ts`** - Low-level utility/helper functions
- **`src/utils/analyticsService.ts`** - High-level business logic processors
- **`src/api/dashboardService.ts`** - API layer that uses the service functions

## Core Utility Functions (`src/utils/analyticsUtils.ts`)

### `filterByDateRange(entries, startDate?, endDate?)`
Filters analytics entries by date range.

**Parameters:**
- `entries: RawAnalyticsEntry[]` - Array of raw analytics entries
- `startDate?: string` - Start date (ISO format: YYYY-MM-DD)
- `endDate?: string` - End date (ISO format: YYYY-MM-DD)

**Returns:** `RawAnalyticsEntry[]` - Filtered entries

**Example:**
```typescript
const filtered = filterByDateRange(allEntries, '2025-01-01', '2025-01-31');
```

---

### `getTimePeriodKey(timestamp, groupBy)`
Generates a time period key for grouping data.

**Parameters:**
- `timestamp: string` - ISO timestamp
- `groupBy: 'hour' | 'day' | 'week' | 'month'` - Grouping period

**Returns:** `string` - Period key (e.g., "2025-01-15", "W3-2025")

**Example:**
```typescript
const key = getTimePeriodKey('2025-01-15T10:30:00Z', 'day'); // "2025-01-15"
```

---

### `calculateSatisfactionScore(sentimentCounts)`
Calculates satisfaction score from sentiment counts.

**Formula:**
- Positive = 1.0 weight
- Neutral/Mixed = 0.5 weight
- Negative = 0.0 weight
- Score = (weighted sum / total) * 100

**Parameters:**
- `sentimentCounts: Record<string, number>` - Sentiment counts object

**Returns:** `number` - Satisfaction score (0-100)

**Example:**
```typescript
const score = calculateSatisfactionScore({
  positive: 80,
  neutral: 15,
  negative: 5,
  mixed: 0,
  unknown: 0
}); // Returns 87.5
```

---

### `calculateSentimentPercentages(sentimentCounts)`
Calculates percentage distribution of sentiments.

**Parameters:**
- `sentimentCounts: Record<string, number>` - Sentiment counts

**Returns:** Object with percentage fields:
```typescript
{
  positivePercent: number,
  negativePercent: number,
  neutralPercent: number,
  mixedPercent: number,
  unknownPercent: number
}
```

---

### `extractParameterStats(parameters)`
Extracts parameter statistics from analytics entry.

**Tracks:**
- `action` - User action
- `amenities` - Array of amenities
- `fuel_type` - Array of fuel types
- `fuel_priority` - Fuel priority

**Parameters:**
- `parameters: any` - Parameters object from analytics entry

**Returns:** `Record<string, any>` - Extracted stats

---

### `aggregateParameterCounts(parametersList)`
Aggregates parameter usage counts across multiple entries.

**Parameters:**
- `parametersList: Record<string, any>[]` - Array of parameter stats

**Returns:** Object with aggregated counts:
```typescript
{
  actions: { [action: string]: number },
  amenities: { [amenity: string]: number },
  fuel_types: { [fuelType: string]: number },
  fuel_priorities: { [priority: string]: number }
}
```

---

## Main Processing Functions (`src/utils/analyticsService.ts`)

### `processSentimentAnalysis(allEntries, groupBy?, startDate?, endDate?)`
Processes sentiment analysis with optional time grouping.

**Parameters:**
- `allEntries: RawAnalyticsEntry[]` - All raw entries
- `groupBy?: 'day' | 'week' | 'month'` - Optional time grouping
- `startDate?: string` - Optional start date filter
- `endDate?: string` - Optional end date filter

**Returns:**
- Without groupBy: Overall sentiment with date-wise breakdown
- With groupBy: Array of sentiment data per period

**Example:**
```typescript
// Overall sentiment
const overall = processSentimentAnalysis(rawData);
// {
//   totalQueries: 1000,
//   positivePercent: 75.5,
//   negativePercent: 10.2,
//   satisfactionScore: 82.65,
//   dateWiseSentiments: [...]
// }

// Grouped by day
const daily = processSentimentAnalysis(rawData, 'day');
// [
//   { period: '2025-01-15', totalQueries: 50, positivePercent: 80, ... },
//   { period: '2025-01-16', totalQueries: 45, positivePercent: 75, ... }
// ]
```

---

### `processQueryTrends(allEntries, groupBy, startDate?, endDate?)`
Processes query count trends over time.

**Returns:** Array of `{ time: string, count: number }`

---

### `processIntentDistribution(allEntries, groupBy?, startDate?, endDate?)`
Processes intent distribution with parameter usage statistics.

**Returns:**
- Without groupBy: `{ totalQueries: number, intents: IntentItem[] }`
- With groupBy: Array of intent distributions per period

---

### `processAIUsageTrends(allEntries, groupBy, startDate?, endDate?)`
Processes AI usage trends with growth rates.

**Returns:** Array of:
```typescript
{
  period: string,
  totalQueries: number,
  uniqueUsers: number,
  avgResponseTime: number,
  growthRate: number | null
}
```

---

### `processUserTotal(allEntries)`
Calculates total user statistics.

**Returns:**
```typescript
{
  totalUsers: number,
  activeUsers: number,
  newUsers: number,
  retentionRate: number
}
```

---

### `processUserCreationTrends(allEntries, groupBy, startDate?, endDate?)`
Processes user creation trends over time.

**Returns:** Array of `{ period: string, count: number }`

---

### `processUserActiveTrends(allEntries, groupBy, startDate?, endDate?)`
Processes active user trends over time.

**Returns:** Array of `{ period: string, count: number }`

---

### `processUserRetention(allEntries, groupBy, startDate?, endDate?)`
Processes user retention data over time.

**Returns:** Array of:
```typescript
{
  period: string,
  retentionRate: number,
  activeUsers: number,
  totalUsers: number
}
```

---

## Usage in Dashboard Service

All processing functions are called from `src/api/dashboardService.ts`:

```typescript
// Example: AI Usage
getAIUsage: async (startDate?, endDate?) => {
  const rawData = await fetchRawAnalytics(); // Cached!
  return processAIUsageTrends(rawData, 'day', startDate, endDate);
}

// Example: Sentiment
getSentiment: async (startDate?, endDate?) => {
  const rawData = await fetchRawAnalytics(); // Uses cache if available
  return processSentimentAnalysis(rawData, undefined, startDate, endDate);
}
```

## Performance Tips

1. **Use the cache:** All functions use the same cached raw data
2. **Filter early:** Use date filters to reduce processing time
3. **Group wisely:** Use appropriate groupBy periods for your data size
4. **Monitor console:** Check for cache hit/miss messages

## Error Handling

All processing functions handle edge cases:
- Empty data arrays
- Missing timestamps
- Invalid sentiment values
- Null/undefined parameters

They return safe default values instead of throwing errors.

