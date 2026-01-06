# Analytics Processing File Structure

## Overview
This document explains the organization and naming of analytics processing files.

## File Hierarchy

```
src/
├── types/
│   └── rawAnalytics.ts          # TypeScript interfaces for raw data
│
├── utils/
│   ├── analyticsUtils.ts        # Low-level utility functions
│   └── analyticsService.ts      # High-level business logic
│
└── api/
    └── dashboardService.ts      # API layer with caching
```

## Detailed Breakdown

### 1. **`src/types/rawAnalytics.ts`**
**Purpose:** Type definitions  
**Contains:**
- `RawAnalyticsEntry` - Structure of raw analytics data from Redis
- `RawAnalyticsResponse` - API response format
- `GroupByPeriod` - Time grouping options ('day' | 'week' | 'month' | 'hour')
- `DateRangeFilter` - Date filtering options

**Used by:** All analytics files

---

### 2. **`src/utils/analyticsUtils.ts`**
**Purpose:** Reusable utility/helper functions  
**Layer:** Utility Layer (lowest level)

**Contains:**
- `filterByDateRange()` - Filter entries by date range
- `getTimePeriodKey()` - Generate time period keys for grouping
- `initializeSentimentCounts()` - Initialize sentiment counters
- `calculateSatisfactionScore()` - Calculate satisfaction scores (0-100)
- `calculateSentimentPercentages()` - Calculate sentiment percentages
- `formatSentimentDistribution()` - Format sentiment data for display
- `extractParameterStats()` - Extract parameter statistics from entry
- `aggregateParameterCounts()` - Aggregate parameter usage across entries
- `formatParameterStats()` - Format parameters for display

**Characteristics:**
- ✅ Pure functions (no side effects)
- ✅ Highly reusable
- ✅ Easy to test independently
- ✅ No external dependencies (except dayjs)

**Used by:** `analyticsService.ts`

**Example:**
```typescript
import { filterByDateRange, calculateSatisfactionScore } from './analyticsUtils';

const filtered = filterByDateRange(entries, '2025-01-01', '2025-01-31');
const score = calculateSatisfactionScore({ positive: 80, negative: 20 });
```

---

### 3. **`src/utils/analyticsService.ts`**
**Purpose:** Business logic for analytics processing  
**Layer:** Service Layer (middle level)

**Contains:**
- `processSentimentAnalysis()` - Complete sentiment analysis with date breakdown
- `processQueryTrends()` - Query count trends over time
- `processAvgResponseTime()` - Average response time by date
- `processIntentDistribution()` - Intent distribution with parameters
- `processTrendsWithTopQueries()` - Top N queries per time period
- `processAIUsageTrends()` - AI usage with growth rates
- `processUserTotal()` - Total user statistics
- `processUserCreationTrends()` - User creation trends
- `processUserActiveTrends()` - Active user trends
- `processUserRetention()` - User retention analysis

**Characteristics:**
- ✅ Uses utility functions from `analyticsUtils.ts`
- ✅ Implements complete business logic
- ✅ Replicates NestJS backend processing
- ✅ Returns formatted data ready for UI

**Used by:** `dashboardService.ts`

**Example:**
```typescript
import { processSentimentAnalysis, processAIUsageTrends } from './analyticsService';

const sentiment = processSentimentAnalysis(rawData, undefined, startDate, endDate);
const aiUsage = processAIUsageTrends(rawData, 'day', startDate, endDate);
```

---

### 4. **`src/api/dashboardService.ts`**
**Purpose:** API layer with caching  
**Layer:** API Layer (highest level)

**Contains:**
- `fetchRawAnalytics()` - Fetches and caches raw data (5-minute cache)
- `getAIUsage()` - Calls `processAIUsageTrends()`
- `getTrends()` - Calls `processQueryTrends()`
- `getIntents()` - Calls `processIntentDistribution()`
- `getSentiment()` - Calls `processSentimentAnalysis()`
- `getUserTotal()` - Calls `processUserTotal()`
- `getUserCreationTrends()` - Calls `processUserCreationTrends()`
- `getUserActiveTrends()` - Calls `processUserActiveTrends()`
- `getUserRetention()` - Calls `processUserRetention()`

**Characteristics:**
- ✅ Manages API calls to backend
- ✅ Implements 5-minute caching
- ✅ Uses service functions for processing
- ✅ Provides clean API for React components

**Used by:** React components (AIUsage, Trends, Intents, etc.)

**Example:**
```typescript
import { dashboardService } from '../api/dashboardService';

// In React component
const aiUsageData = await dashboardService.getAIUsage(startDate, endDate);
const sentimentData = await dashboardService.getSentiment(startDate, endDate);
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                         │
│              (AIUsage, Trends, Intents, etc.)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              src/api/dashboardService.ts                     │
│                    (API Layer)                               │
│  • Fetches raw data from backend                            │
│  • Caches for 5 minutes                                     │
│  • Calls service functions                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│            src/utils/analyticsService.ts                     │
│                  (Service Layer)                             │
│  • Business logic for analytics                             │
│  • Uses utility functions                                   │
│  • Returns formatted data                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│             src/utils/analyticsUtils.ts                      │
│                  (Utility Layer)                             │
│  • Pure helper functions                                    │
│  • Date filtering, calculations, formatting                 │
│  • No business logic                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Naming Convention Explained

### Why `analyticsUtils.ts`?
- **"Utils"** clearly indicates utility/helper functions
- Common pattern in React/TypeScript projects
- Suggests reusable, low-level functions
- Examples: `dateUtils.ts`, `formatUtils.ts`, `storageUtils.ts`

### Why `analyticsService.ts`?
- **"Service"** indicates business logic layer
- Common pattern in Angular, NestJS, and React
- Suggests higher-level operations
- Examples: `authService.ts`, `apiService.ts`, `userService.ts`

### Alternative Names Considered

| Current Name | Alternative 1 | Alternative 2 | Alternative 3 |
|--------------|---------------|---------------|---------------|
| `analyticsUtils.ts` | `analyticsHelpers.ts` | `analyticsCoreUtils.ts` | `analyticsCore.ts` |
| `analyticsService.ts` | `analyticsProcessors.ts` | `analyticsBusinessLogic.ts` | `analyticsLogic.ts` |

**Why we chose Utils + Service:**
- ✅ Clear and concise
- ✅ Industry standard pattern
- ✅ Easy to understand for new developers
- ✅ Consistent with existing codebase (`dateUtils.ts`, `formatUtils.ts`)

---

## Benefits of This Structure

### 1. **Separation of Concerns**
- Utilities don't know about business logic
- Service doesn't know about API/caching
- API layer doesn't know about processing details

### 2. **Testability**
```typescript
// Test utilities independently
test('calculateSatisfactionScore', () => {
  expect(calculateSatisfactionScore({ positive: 100 })).toBe(100);
});

// Test service with mocked utilities
test('processSentimentAnalysis', () => {
  // Mock utility functions
  // Test business logic
});

// Test API with mocked service
test('dashboardService.getSentiment', () => {
  // Mock service functions
  // Test caching logic
});
```

### 3. **Reusability**
```typescript
// Use utilities directly if needed
import { filterByDateRange } from './analyticsUtils';

// Use service functions in other contexts
import { processSentimentAnalysis } from './analyticsService';

// Use API layer in components
import { dashboardService } from '../api/dashboardService';
```

### 4. **Maintainability**
- Easy to find functions (clear file names)
- Easy to add new utilities
- Easy to add new service functions
- Easy to modify without breaking other layers

---

## Summary

| File | Purpose | Layer | Lines | Exports |
|------|---------|-------|-------|---------|
| `rawAnalytics.ts` | Type definitions | Types | ~40 | 4 interfaces |
| `analyticsUtils.ts` | Utility functions | Utility | ~230 | 9 functions |
| `analyticsService.ts` | Business logic | Service | ~510 | 10 functions |
| `dashboardService.ts` | API + caching | API | ~310 | 1 service object |

**Total:** ~1,090 lines of well-organized, maintainable code! 🎉

