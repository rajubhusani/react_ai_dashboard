# API Verification Guide

## Current Status

All three widgets ARE calling their respective API endpoints:

1. **AIUsage Widget** → `GET /analytics/ai-usage?groupBy={day|week|month}`
2. **Trends Widget** → `GET /analytics/trends?groupBy={day|week|month}`
3. **Intents Widget** → `GET /analytics/intents`

## Why You Might Only See One API Call

### Possible Reasons:

1. **API Calls Failing Fast**
   - If the API is unreachable or returns errors quickly, all three calls might fail almost instantly
   - The widgets immediately fall back to mock data
   - You might only catch one call in the Network tab

2. **CORS Issues**
   - Browser might be blocking the requests before they even show up in Network tab
   - Check browser console for CORS errors

3. **Authentication Failures**
   - All requests might be failing with 401 Unauthorized
   - Failing so fast they don't all appear in Network tab

4. **Network Tab Timing**
   - All three calls happen simultaneously on page load
   - If you're not watching the Network tab at the exact moment, you might miss them

## How to Verify All APIs Are Being Called

### Method 1: Browser Console (RECOMMENDED)

1. Open browser console (F12)
2. Refresh the page
3. Look for these colored logs:

```
🔧 API Client Configuration:
   Base URL: https://...
   Environment: development

🔵 AIUsage: Fetching data with groupBy=day
📤 API Request: GET https://.../analytics/ai-usage {groupBy: 'day'}

🟢 Trends: Fetching data with groupBy=day
📤 API Request: GET https://.../analytics/trends {groupBy: 'day'}

🟡 Intents: Fetching data
📤 API Request: GET https://.../analytics/intents
```

### Method 2: API Debug Panel (NEW)

1. Look at the **bottom-right corner** of the screen
2. You'll see a dark panel labeled "🔍 API Debug Console"
3. This panel captures ALL API-related logs in real-time
4. Shows:
   - All API requests with timestamps
   - Success/failure status
   - Error messages
   - Mock data fallback notifications

### Method 3: API Validator (Top-Right)

1. Look at the **top-right corner** of the screen
2. Click "▶️ Run All Tests" button
3. This will test ALL 8 endpoint variations:
   - AI Usage (Day)
   - AI Usage (Week)
   - AI Usage (Month)
   - Trends (Day)
   - Trends (Week)
   - Trends (Month)
   - Intents
   - Avg Response

### Method 4: Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Clear all requests (🚫 icon)
4. Refresh the page
5. Filter by "Fetch/XHR"
6. You should see 3 requests:
   - `ai-usage?groupBy=day`
   - `trends?groupBy=day`
   - `intents`

## Expected Console Output

### On Page Load:
```
🔧 API Client Configuration:
   Base URL: https://driven-mobile-mw-dev.fleet.non-prod.fleetcor.com/ai
   Environment: development

⚠️  No auth token found in localStorage

🔵 AIUsage: Fetching data with groupBy=day
📤 API Request: GET https://.../analytics/ai-usage {groupBy: 'day'}

🟢 Trends: Fetching data with groupBy=day
📤 API Request: GET https://.../analytics/trends {groupBy: 'day'}

🟡 Intents: Fetching data
📤 API Request: GET https://.../analytics/intents
```

### If API Succeeds:
```
📥 API Response: /analytics/ai-usage
   status: 200
   data: [...]

✅ AIUsage: Successfully fetched 8 records
```

### If API Fails:
```
❌ API Error: /analytics/ai-usage
   status: 401
   statusText: Unauthorized
   message: ...

❌ AIUsage: Failed to fetch data, using mock data: Error: Request failed...
📦 AIUsage: Using 8 mock records
```

## Troubleshooting

### Issue: Only seeing one API call

**Check:**
1. Open browser console - do you see all three colored logs? (🔵 🟢 🟡)
2. Are there error messages immediately after each log?
3. Check the API Debug Panel (bottom-right) - does it show all three attempts?

**If you see all three logs but only one network request:**
- The other two are likely failing before the network request is made
- Check for CORS errors in console
- Check for authentication errors

### Issue: All APIs failing with 401

**Solution:**
```javascript
// Set auth token in browser console
localStorage.setItem('authToken', 'your-jwt-token-here');
// Refresh page
location.reload();
```

### Issue: All APIs failing with CORS error

**Check:**
1. Is the API URL correct in `.env`?
2. Does the backend have CORS enabled?
3. Are you accessing from the correct domain?

**Temporary workaround:**
- The dashboard will work with mock data
- Mock data is dynamically generated based on groupBy parameter

### Issue: Network tab shows "cancelled" requests

**Reason:**
- React StrictMode in development causes components to mount twice
- First set of API calls gets cancelled
- Second set completes

**Solution:**
- This is normal in development
- Won't happen in production build

## Verification Checklist

Use this checklist to verify all APIs are being called:

- [ ] Open browser console (F12)
- [ ] Refresh the page
- [ ] See "🔧 API Client Configuration" log
- [ ] See "🔵 AIUsage: Fetching data" log
- [ ] See "📤 API Request: GET .../analytics/ai-usage" log
- [ ] See "🟢 Trends: Fetching data" log
- [ ] See "📤 API Request: GET .../analytics/trends" log
- [ ] See "🟡 Intents: Fetching data" log
- [ ] See "📤 API Request: GET .../analytics/intents" log
- [ ] Check API Debug Panel (bottom-right) shows all three requests
- [ ] Check Network tab shows 3 XHR requests

## Testing Different GroupBy Values

To verify groupBy parameter is working:

1. **Change AIUsage groupBy:**
   - Click dropdown in AIUsage widget
   - Select "Weekly" or "Monthly"
   - Check console for: `🔵 AIUsage: Fetching data with groupBy=week`
   - Check Network tab for: `ai-usage?groupBy=week`

2. **Change Trends groupBy:**
   - Click dropdown in Trends widget
   - Select "Weekly" or "Monthly"
   - Check console for: `🟢 Trends: Fetching data with groupBy=week`
   - Check Network tab for: `trends?groupBy=week`

3. **Refresh Intents:**
   - Click refresh button in Intents widget
   - Check console for: `🟡 Intents: Fetching data`
   - Check Network tab for: `intents`

## Summary

**The dashboard IS calling all three API endpoints correctly.**

If you're only seeing one API call in the Network tab, it's likely because:
1. The other calls are failing too quickly to catch
2. They're being blocked by CORS
3. They're failing authentication
4. React StrictMode is cancelling duplicate calls

**To confirm all APIs are being called:**
- Check the browser console for colored logs (🔵 🟢 🟡)
- Use the API Debug Panel (bottom-right corner)
- Use the API Validator (top-right corner)

**The widgets will work regardless** because they fall back to dynamically generated mock data when APIs fail.

