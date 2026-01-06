# Backend Migration Guide

## Overview
This guide helps the NestJS backend team understand the changes and what needs to be done on the backend side.

## What Changed?

The React dashboard now processes analytics data **client-side** instead of relying on the backend to process it. This means:

✅ **Frontend now calls:** 1 endpoint (`/analytics/rawAnalytics`)  
❌ **Frontend no longer calls:** 10+ specialized endpoints

## Required Backend Changes

### 1. Ensure Raw Analytics Endpoint Exists

Make sure this endpoint is available and returns all raw analytics data:

```typescript
@Get('/analytics/rawAnalytics')
async getRawAnalytics() {
  const data = await this.redisService.getAllRawAnalytics();
  
  return {
    data: data,  // Array of RawAnalyticsEntry
    total: data.length,
    timestamp: new Date().toISOString()
  };
}
```

### 2. Expected Data Format

The endpoint should return data in this format:

```typescript
{
  "data": [
    {
      "userId": "user123",
      "query": "Find gas stations near me",
      "intent": "find_location",
      "sentiment": "positive",
      "responseTime": 250,  // milliseconds
      "timestamp": "2025-01-15T10:30:00Z",
      "parameters": {
        "action": "search",
        "amenities": ["restroom", "atm"],
        "fuel": {
          "fuel_type": ["diesel", "regular"],
          "fuel_priority": "price"
        }
      },
      "sessionId": "session456"
    },
    // ... more entries
  ],
  "total": 1250,
  "timestamp": "2025-01-15T12:00:00Z"
}
```

### 3. Required Fields

Each analytics entry must have:

**Required:**
- `userId: string` - User identifier
- `query: string` - User query text
- `intent: string` - Detected intent
- `sentiment: 'positive' | 'negative' | 'neutral' | 'mixed' | 'unknown'`
- `responseTime: number` - Response time in milliseconds
- `timestamp: string` - ISO 8601 timestamp

**Optional:**
- `parameters: object` - Query parameters
- `sessionId: string` - Session identifier
- Any other custom fields

### 4. Performance Considerations

#### Caching
The frontend caches raw data for **5 minutes**, so:
- Expect fewer calls to this endpoint
- First call per user session will fetch all data
- Subsequent calls within 5 minutes use cached data

#### Data Volume
If you have a large dataset (>10,000 entries):

**Option A: Pagination (Recommended)**
```typescript
@Get('/analytics/rawAnalytics')
async getRawAnalytics(
  @Query('limit') limit = 5000,
  @Query('offset') offset = 0
) {
  const data = await this.redisService.getAllRawAnalytics(limit, offset);
  return { data, total: data.length, timestamp: new Date().toISOString() };
}
```

**Option B: Date Range Filter**
```typescript
@Get('/analytics/rawAnalytics')
async getRawAnalytics(
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string
) {
  const data = await this.redisService.getRawAnalyticsByDateRange(startDate, endDate);
  return { data, total: data.length, timestamp: new Date().toISOString() };
}
```

**Option C: Compression**
```typescript
@Get('/analytics/rawAnalytics')
@UseInterceptors(CompressionInterceptor)
async getRawAnalytics() {
  // Enable gzip compression for large responses
  const data = await this.redisService.getAllRawAnalytics();
  return { data, total: data.length, timestamp: new Date().toISOString() };
}
```

### 5. Optional: Deprecate Old Endpoints

These endpoints are **no longer called** by the React dashboard:

```typescript
// ❌ Can be deprecated (if no other clients use them)
@Get('/analytics/ai-usage')
@Get('/analytics/trends')
@Get('/analytics/intents')
@Get('/analytics/sentiment')
@Get('/analytics/users/total')
@Get('/analytics/users/creation-trends')
@Get('/analytics/users/active-trends')
@Get('/analytics/users/retention')
@Get('/analytics/avg-response')
```

**Before removing:**
1. Check if other services/clients use these endpoints
2. Add deprecation warnings
3. Monitor usage for 1-2 weeks
4. Remove if no usage detected

### 6. Redis Query Optimization

Since the frontend now makes fewer calls, optimize your Redis query:

**Before:**
```typescript
// Called 10+ times per dashboard load
async getSentimentAnalysis() {
  const data = await this.redis.get('analytics:*');
  // Process sentiment...
  return processed;
}

async getIntentDistribution() {
  const data = await this.redis.get('analytics:*');
  // Process intents...
  return processed;
}
// ... 8 more similar methods
```

**After:**
```typescript
// Called once per 5 minutes per user
async getAllRawAnalytics() {
  // Single Redis query
  const data = await this.redis.get('analytics:*');
  return data; // No processing needed!
}
```

### 7. Monitoring & Logging

Update your monitoring to track:

```typescript
@Get('/analytics/rawAnalytics')
async getRawAnalytics() {
  const startTime = Date.now();
  
  try {
    const data = await this.redisService.getAllRawAnalytics();
    
    // Log metrics
    this.logger.log({
      endpoint: '/analytics/rawAnalytics',
      entriesReturned: data.length,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    
    return { data, total: data.length, timestamp: new Date().toISOString() };
  } catch (error) {
    this.logger.error('Failed to fetch raw analytics', error);
    throw error;
  }
}
```

## Testing

### 1. Test the Endpoint

```bash
# Test raw analytics endpoint
curl -X GET "http://your-api/analytics/rawAnalytics" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response
{
  "data": [...],
  "total": 1250,
  "timestamp": "2025-01-15T12:00:00Z"
}
```

### 2. Verify Data Format

Ensure each entry has required fields:
```bash
# Check first entry
curl -X GET "http://your-api/analytics/rawAnalytics" | jq '.data[0]'

# Should have: userId, query, intent, sentiment, responseTime, timestamp
```

### 3. Monitor Performance

```bash
# Check response time
time curl -X GET "http://your-api/analytics/rawAnalytics"

# Should be < 1 second for typical datasets
```

## Expected Performance Improvements

### Backend Metrics

**Before Optimization:**
- API calls per dashboard load: 10-15
- Redis queries: 10-15
- CPU usage: High (processing on every request)
- Response time per endpoint: 200-500ms
- Total backend time: 2-7.5 seconds

**After Optimization:**
- API calls per dashboard load: 1 (first load), 0 (cached)
- Redis queries: 1 (first load), 0 (cached)
- CPU usage: Minimal (no processing)
- Response time: 100-300ms (raw data only)
- Total backend time: 100-300ms

### Expected Improvements
- **90% reduction** in API calls
- **90% reduction** in Redis queries
- **95% reduction** in CPU usage
- **80% reduction** in backend processing time

## Rollback Plan

If issues occur, you can temporarily re-enable old endpoints:

1. Keep old processing endpoints active
2. Frontend can be reverted to use old endpoints
3. No data loss or migration needed
4. Simple code revert on frontend

## Questions?

Contact the frontend team if you need:
- Clarification on data format
- Help with endpoint implementation
- Performance optimization advice
- Testing assistance

## Summary

✅ **Do This:**
1. Ensure `/analytics/rawAnalytics` endpoint exists
2. Return raw data in correct format
3. Optimize Redis query for single fetch
4. Add monitoring/logging

❌ **Don't Do This:**
1. Don't remove old endpoints immediately
2. Don't add processing logic to raw endpoint
3. Don't change data format without coordination

🎯 **Result:**
- Simpler backend code
- Better performance
- Lower server costs
- Happier users!

