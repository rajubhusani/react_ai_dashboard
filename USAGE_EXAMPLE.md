# Usage Example - How to Use Optimized Caching

## Quick Start

### Option 1: Simple Usage (No Changes Needed!)

Your existing code already benefits from the optimization! No changes required:

```typescript
// Your existing widget components work as-is
function AIUsageWidget() {
  const [data, setData] = useState([]);

  useEffect(() => {
    dashboardService.getAIUsage().then(setData);
  }, []);

  return <Chart data={data} />;
}

function TrendsWidget() {
  const [data, setData] = useState([]);

  useEffect(() => {
    dashboardService.getTrends().then(setData);
  }, []);

  return <Chart data={data} />;
}

// ✅ Only 1 API call is made automatically!
// ✅ Both widgets share the cached data!
```

---

### Option 2: With Prefetching (Recommended)

Add prefetching to your main Dashboard component for best performance:

```typescript
import { usePrefetchRawAnalytics } from '../hooks/useRawAnalytics';
import AIUsageWidget from './widgets/AIUsageWidget';
import TrendsWidget from './widgets/TrendsWidget';
import IntentsWidget from './widgets/IntentsWidget';
import SentimentWidget from './widgets/SentimentWidget';

function Dashboard() {
  // Prefetch raw analytics data when dashboard loads
  // This ensures data is cached before child widgets request it
  usePrefetchRawAnalytics();

  return (
    <div className="dashboard">
      <h1>Analytics Dashboard</h1>
      
      <div className="widgets-grid">
        <AIUsageWidget />      {/* Renders instantly - data already cached! */}
        <TrendsWidget />       {/* Renders instantly - data already cached! */}
        <IntentsWidget />      {/* Renders instantly - data already cached! */}
        <SentimentWidget />    {/* Renders instantly - data already cached! */}
      </div>
    </div>
  );
}

export default Dashboard;
```

**Benefits:**
- ✅ Data is prefetched before widgets mount
- ✅ Widgets render instantly (no loading states needed)
- ✅ Better user experience (no loading spinners)

---

### Option 3: With Loading State (Best UX)

Show a loading indicator while data is being fetched:

```typescript
import { useRawAnalytics } from '../hooks/useRawAnalytics';
import AIUsageWidget from './widgets/AIUsageWidget';
import TrendsWidget from './widgets/TrendsWidget';
import IntentsWidget from './widgets/IntentsWidget';
import SentimentWidget from './widgets/SentimentWidget';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

function Dashboard() {
  const { isLoading, isReady, error } = useRawAnalytics();

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  // Show error message if fetch failed
  if (error) {
    return (
      <div className="dashboard-error">
        <ErrorMessage message={error} />
      </div>
    );
  }

  // Wait until data is ready
  if (!isReady) {
    return null;
  }

  // Render dashboard with all widgets
  return (
    <div className="dashboard">
      <h1>Analytics Dashboard</h1>
      
      <div className="widgets-grid">
        <AIUsageWidget />      {/* Renders instantly - data is ready! */}
        <TrendsWidget />       {/* Renders instantly - data is ready! */}
        <IntentsWidget />      {/* Renders instantly - data is ready! */}
        <SentimentWidget />    {/* Renders instantly - data is ready! */}
      </div>
    </div>
  );
}

export default Dashboard;
```

**Benefits:**
- ✅ Clean loading state
- ✅ Error handling
- ✅ Widgets only render when data is ready
- ✅ Best user experience

---

## Advanced Usage

### Manual Prefetch

Prefetch data manually (e.g., on button click):

```typescript
import { dashboardService } from '../api/dashboardService';

function App() {
  const handleNavigateToDashboard = async () => {
    // Prefetch data before navigating
    await dashboardService.prefetchRawAnalytics();
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <button onClick={handleNavigateToDashboard}>
      Go to Dashboard
    </button>
  );
}
```

### Refresh Data

Force a fresh fetch by clearing the cache:

```typescript
import { clearRawAnalyticsCache, dashboardService } from '../api/dashboardService';

function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Clear cache to force fresh fetch
      clearRawAnalyticsCache();
      
      // Fetch fresh data
      await dashboardService.prefetchRawAnalytics();
      
      // Trigger re-render of widgets (they'll get fresh data)
      window.location.reload(); // Or use your state management
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button onClick={handleRefresh} disabled={isRefreshing}>
      {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
    </button>
  );
}
```

### Debug Cache Status

Show cache status for debugging:

```typescript
import { getCacheStatus } from '../api/dashboardService';

function CacheDebugPanel() {
  const [status, setStatus] = useState(getCacheStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getCacheStatus());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cache-debug">
      <h3>Cache Status</h3>
      <ul>
        <li>Has Cached Data: {status.hasCachedData ? '✅' : '❌'}</li>
        <li>Cache Size: {status.cacheSize} entries</li>
        <li>Cache Age: {status.cacheAgeSeconds}s</li>
        <li>Is Valid: {status.isValid ? '✅' : '❌'}</li>
        <li>Pending Request: {status.hasPendingRequest ? '⏳' : '✅'}</li>
      </ul>
    </div>
  );
}
```

---

## Migration Guide

### If you're using the old API endpoints:

**Before:**
```typescript
// Old way - multiple API calls
const aiUsage = await apiClient.get('/analytics/ai-usage');
const trends = await apiClient.get('/analytics/trends');
const intents = await apiClient.get('/analytics/intents');
const sentiment = await apiClient.get('/analytics/sentiment');
```

**After:**
```typescript
// New way - single API call, client-side processing
const aiUsage = await dashboardService.getAIUsage();
const trends = await dashboardService.getTrends();
const intents = await dashboardService.getIntents();
const sentiment = await dashboardService.getSentiment();
```

### If you're using custom hooks:

**Before:**
```typescript
function useAIUsage() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    apiClient.get('/analytics/ai-usage').then(res => setData(res.data));
  }, []);
  
  return data;
}
```

**After:**
```typescript
function useAIUsage() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    dashboardService.getAIUsage().then(setData);
  }, []);
  
  return data;
}
```

---

## Testing

### Verify Single API Call

1. Open **Chrome DevTools** → **Network** tab
2. Filter by "rawAnalytics"
3. Load your dashboard
4. **Expected:** Only 1 request to `/analytics/rawAnalytics`

### Verify Console Logs

**Expected output:**
```
🚀 Prefetching raw analytics data...
🔄 Fetching fresh raw analytics data from API (cache miss)
✅ Successfully cached 1250 raw analytics entries
✅ Prefetch complete - cache is ready!
📦 Using cached raw analytics data (cache hit)
📊 Processed AI Usage data client-side: [...]
📦 Using cached raw analytics data (cache hit)
📊 Processed Trends data client-side: [...]
📦 Using cached raw analytics data (cache hit)
📊 Processed Intents data client-side: [...]
```

**Key indicators:**
- Only **ONE** "🔄 Fetching fresh..." message
- Multiple "📦 Using cached..." messages
- No duplicate API calls

---

## Summary

### Recommended Approach

For best performance and UX, use **Option 3** (with loading state):

```typescript
function Dashboard() {
  const { isLoading, isReady, error } = useRawAnalytics();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!isReady) return null;

  return (
    <div className="dashboard">
      <AIUsageWidget />
      <TrendsWidget />
      <IntentsWidget />
      <SentimentWidget />
    </div>
  );
}
```

### Benefits

✅ **ONE API call** per dashboard load  
✅ **Instant widget rendering** (data is prefetched)  
✅ **Clean loading state** (better UX)  
✅ **Error handling** (graceful failures)  
✅ **Automatic caching** (no manual cache management)  
✅ **Request deduplication** (prevents race conditions)  

Your dashboard is now **fully optimized**! 🚀

