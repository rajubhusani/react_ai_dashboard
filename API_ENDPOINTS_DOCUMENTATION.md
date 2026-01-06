# API Endpoints Documentation

## Base URL
```
https://driven-mobile-mw-dev.fleet.non-prod.fleetcor.com/ai
```

Configured in `.env` file as `VITE_API_URL`

## Authentication
All requests include JWT token from localStorage if available:
```javascript
Authorization: Bearer <token>
```

Set token in browser console:
```javascript
localStorage.setItem('authToken', 'your-jwt-token-here');
```

---

## Endpoints Used by Dashboard

### 1. AI Usage Analytics
**Endpoint:** `GET /analytics/ai-usage`

**Query Parameters:**
- `groupBy`: `day` | `week` | `month`

**Used By:** AIUsage Widget

**Request Example:**
```
GET /analytics/ai-usage?groupBy=day
```

**Expected Response:**
```json
[
  {
    "period": "2025-10-21",
    "totalQueries": 145,
    "uniqueUsers": 20,
    "avgResponseTime": 1156,
    "growthRate": 13.28
  },
  ...
]
```

**Response Fields:**
- `period` (string): Date in YYYY-MM-DD format
- `totalQueries` (number): Total number of queries in this period
- `uniqueUsers` (number): Number of unique users
- `avgResponseTime` (number): Average response time in milliseconds
- `growthRate` (number | null): Percentage growth from previous period

---

### 2. Query Trends
**Endpoint:** `GET /analytics/trends`

**Query Parameters:**
- `groupBy`: `day` | `week` | `month`

**Used By:** Trends Widget

**Request Example:**
```
GET /analytics/trends?groupBy=week
```

**Expected Response:**
```json
[
  {
    "time": "2025-10-21T18:30:00.000Z",
    "count": 6
  },
  ...
]
```

**Response Fields:**
- `time` (string): ISO 8601 timestamp
- `count` (number): Number of queries in this time period

---

### 3. Intent Distribution
**Endpoint:** `GET /analytics/intents`

**Query Parameters:** None

**Used By:** Intents Widget

**Request Example:**
```
GET /analytics/intents
```

**Expected Response:**
```json
{
  "totalQueries": 240,
  "intents": [
    {
      "intent": "FUEL_SEARCH",
      "count": 111,
      "percentage": "46.25%"
    },
    {
      "intent": "AMENITY_SEARCH",
      "count": 71,
      "percentage": "29.58%"
    },
    ...
  ]
}
```

**Response Fields:**
- `totalQueries` (number): Total number of queries
- `intents` (array): Array of intent objects
  - `intent` (string): Intent name/type
  - `count` (number): Number of queries with this intent
  - `percentage` (string): Percentage of total queries

---

### 4. Average Response Times
**Endpoint:** `GET /analytics/avg-response`

**Query Parameters:** None

**Used By:** Currently defined in dashboardService but not used in any widget

**Request Example:**
```
GET /analytics/avg-response
```

**Expected Response:**
```json
{
  "totalQueries": 240,
  "intents": [...]
}
```

**Note:** This endpoint is defined but not currently used by any widget. The avgResponseTime is already included in the AI Usage endpoint.

---

## API Client Configuration

### Location
`src/api/client.ts`

### Features
- Axios-based HTTP client
- Automatic JWT token injection from localStorage
- Request/Response logging to console
- Error handling with detailed logging

### Logging
The API client logs all requests and responses to the browser console:

**Request Log:**
```
📤 API Request: GET https://...ai/analytics/ai-usage {groupBy: 'day'}
```

**Success Response Log:**
```
📥 API Response: /analytics/ai-usage
   status: 200
   data: [...]
```

**Error Log:**
```
❌ API Error: /analytics/ai-usage
   status: 404
   statusText: Not Found
   data: {...}
```

---

## Dashboard Service

### Location
`src/api/dashboardService.ts`

### Methods

#### `getAIUsage(groupBy)`
```typescript
getAIUsage(groupBy: 'day' | 'week' | 'month'): Promise<AIUsageData[]>
```

#### `getTrends(groupBy)`
```typescript
getTrends(groupBy: 'day' | 'week' | 'month'): Promise<TrendData[]>
```

#### `getIntents()`
```typescript
getIntents(): Promise<IntentResponse>
```

#### `getResponseTimes()`
```typescript
getResponseTimes(): Promise<IntentResponse>
```

---

## Error Handling & Fallback

All widgets implement graceful error handling:

1. **Try API Call**: Attempt to fetch data from the real API
2. **Catch Error**: Log error to console
3. **Fallback**: Use dynamically generated mock data based on groupBy parameter
4. **Display**: Show data to user (either real or mock)

This ensures the dashboard remains functional even when:
- API is unavailable
- Network is down
- Authentication fails
- Endpoints return errors

---

## Testing API Endpoints

### Method 1: API Validator Component
A visual API validator has been added to the dashboard (top-right corner):

1. Open the dashboard in your browser
2. Click "Run All Tests" button
3. View results for each endpoint
4. Check success/failure status
5. See response times and data counts

### Method 2: Browser Console
Open browser console (F12) to see:
- API configuration on page load
- Request logs for each API call
- Response data or error details
- Authentication status

### Method 3: Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Interact with dashboard
5. Inspect request/response details

### Method 4: Test Script
Run the test script in browser console:
```javascript
// Copy contents of test-api.js and paste in console
```

---

## Mock Data Fallback

### Location
`src/api/mockData.ts`

### Functions

#### `generateMockAIUsageData(groupBy)`
Generates realistic AI usage data based on groupBy parameter:
- **Day**: 8 data points, ~100 queries each
- **Week**: 12 data points, ~500 queries each
- **Month**: 6 data points, ~2000 queries each

#### `generateMockTrendsData(groupBy)`
Generates realistic trend data with wave patterns:
- **Day**: 10 data points, ~50 count each
- **Week**: 12 data points, ~300 count each
- **Month**: 6 data points, ~1200 count each

---

## Current Status

✅ **Endpoints Defined:**
- `/analytics/ai-usage` ✅
- `/analytics/trends` ✅
- `/analytics/intents` ✅
- `/analytics/avg-response` ✅ (defined but not used)

✅ **Features Implemented:**
- API client with authentication
- Request/Response logging
- Error handling with fallback
- Dynamic mock data generation
- GroupBy parameter support
- Visual API validator

⚠️ **To Verify:**
1. Check if API endpoints are accessible
2. Verify authentication token is valid
3. Confirm response data structure matches expected format
4. Test all groupBy variations (day/week/month)

---

## Troubleshooting

### Issue: "No auth token found"
**Solution:** Set token in localStorage:
```javascript
localStorage.setItem('authToken', 'your-token');
```

### Issue: "Network Error" or CORS
**Solution:** 
- Check if API URL is correct in `.env`
- Verify CORS is enabled on backend
- Check if VPN/firewall is blocking requests

### Issue: "404 Not Found"
**Solution:**
- Verify endpoint paths match backend routes
- Check if API base URL is correct
- Confirm backend is running

### Issue: "401 Unauthorized"
**Solution:**
- Check if auth token is valid
- Verify token hasn't expired
- Confirm token format is correct

### Issue: Data not updating
**Solution:**
- Check browser console for errors
- Verify API is being called (check Network tab)
- Confirm groupBy parameter is being sent
- Check if mock data fallback is being used

---

## Next Steps

1. **Test API Endpoints**: Use the API Validator to test all endpoints
2. **Verify Authentication**: Ensure JWT token is set and valid
3. **Check Response Format**: Confirm API responses match expected structure
4. **Remove Validator**: After testing, remove APIValidator from Dashboard.jsx
5. **Monitor Console**: Watch for API logs during normal usage

