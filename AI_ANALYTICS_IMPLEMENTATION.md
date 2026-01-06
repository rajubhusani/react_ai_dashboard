# AI Analytics Dashboard Implementation

## Overview
This document describes the implementation of the AI Analytics Dashboard with real-time data integration using the dashboard service API.

## Architecture

### API Layer
- **API Client** (`src/api/client.ts`): Axios-based HTTP client configured with base URL and authentication interceptors
- **Dashboard Service** (`src/api/dashboardService.ts`): Service layer providing three main endpoints:
  - `getAIUsage(groupBy)`: Fetches AI usage analytics with grouping options (day/week/month)
  - `getTrends(groupBy)`: Fetches query trends over time
  - `getIntents()`: Fetches intent distribution data
- **Mock Data** (`src/api/mockData.ts`): Fallback data for development and error scenarios

### Chart Components

#### 1. LineChart (`src/components/LineChart.jsx`)
- **Purpose**: Display time-series data with connected line segments
- **Features**:
  - Responsive SVG-based rendering
  - Grid lines for better readability
  - Configurable colors and data keys
  - Optional data point dots
  - Y-axis labels with auto-scaling
- **Props**:
  - `data`: Array of data points
  - `dataKey`: Key to extract values from data objects
  - `color`: Line color (default: '#3b82f6')
  - `height`: Chart height (default: 200)
  - `showDots`: Show data point markers (default: true)

#### 2. AreaChart (`src/components/AreaChart.jsx`)
- **Purpose**: Display trends with filled area under the line
- **Features**:
  - Gradient fill for visual appeal
  - Smooth line rendering
  - Grid lines and Y-axis labels
  - Data point markers
- **Props**:
  - `data`: Array of data points
  - `dataKey`: Key to extract values (default: 'count')
  - `color`: Chart color (default: '#10b981')
  - `height`: Chart height (default: 200)

#### 3. PieChart (`src/components/PieChart.jsx`)
- **Purpose**: Display proportional data distribution
- **Features**:
  - SVG-based pie slices
  - Automatic color assignment
  - Percentage-based rendering
- **Props**:
  - `data`: Array of {label, value} objects
  - `size`: Chart diameter (default: 200)

### Widget Components

#### 1. AIUsage Widget (`src/components/AIUsage.jsx`)
- **Purpose**: Display comprehensive AI usage analytics
- **Features**:
  - Three key metrics: Total Queries, Unique Users, Avg Response Time
  - Growth rate indicator with trend direction
  - Switchable metrics visualization (Line Chart)
  - Time grouping selector (day/week/month)
  - Automatic fallback to mock data on API failure
- **Data Flow**:
  1. Fetches data from `dashboardService.getAIUsage()`
  2. Displays summary statistics in stat cards
  3. Allows metric selection for detailed visualization
  4. Updates chart based on selected metric

#### 2. Trends Widget (`src/components/Trends.jsx`)
- **Purpose**: Visualize query trends over time
- **Features**:
  - Area chart visualization
  - Summary statistics (Total, Average, Trend %)
  - Peak and low indicators
  - Time grouping selector
  - Automatic trend calculation (comparing first half vs second half)
- **Data Flow**:
  1. Fetches data from `dashboardService.getTrends()`
  2. Calculates aggregate statistics
  3. Renders area chart with time-based X-axis
  4. Shows peak/low values

#### 3. Intents Widget (`src/components/Intents.jsx`)
- **Purpose**: Display intent distribution with detailed breakdown
- **Features**:
  - Pie chart visualization
  - Total queries summary
  - Detailed legend with counts and percentages
  - Progress bars for each intent
  - Refresh button for manual data reload
- **Data Flow**:
  1. Fetches data from `dashboardService.getIntents()`
  2. Transforms data for pie chart
  3. Displays legend with visual progress bars
  4. Shows percentage distribution

## Dashboard Layout

The dashboard is organized in three rows:

1. **Full-Width Row**: AI Usage widget (primary analytics)
2. **Two-Column Row**: Trends and Intents widgets
3. **Three-Column Row**: Legacy widgets (UserOverview, SearchTrafficLarge, BacklinkAttributes)

### Responsive Design
- **Desktop (>1200px)**: 3-column grid for standard rows
- **Tablet (768px-1200px)**: 2-column grid
- **Mobile (<768px)**: Single column layout

## Data Types

### AIUsageData
```typescript
{
  period: string;           // ISO date string
  totalQueries: number;     // Total number of queries
  uniqueUsers: number;      // Unique user count
  avgResponseTime: number;  // Average response time in ms
  growthRate: number | null; // Growth rate percentage
}
```

### TrendData
```typescript
{
  time: string;  // ISO timestamp
  count: number; // Query count
}
```

### IntentResponse
```typescript
{
  totalQueries: number;
  intents: Array<{
    intent: string;      // Intent name
    count: number;       // Intent count
    percentage: string;  // Formatted percentage
  }>;
}
```

## API Configuration

### Environment Variables
Set `VITE_API_URL` in your `.env` file:
```
VITE_API_URL=https://your-api-domain.com/ai
```

### Authentication
The API client automatically includes JWT tokens from localStorage:
```javascript
const token = localStorage.getItem('authToken');
```

## Error Handling

All widgets implement graceful error handling:
1. Try to fetch data from API
2. On failure, log error and use mock data
3. Display loading states during fetch
4. Show error messages when appropriate

## Styling

Each widget has its own CSS file with:
- Consistent color scheme
- Responsive layouts
- Hover effects and transitions
- Loading and error states

### Color Palette
- Primary Blue: `#3b82f6`
- Success Green: `#10b981`
- Warning Orange: `#f59e0b`
- Danger Red: `#ef4444`
- Purple: `#8b5cf6`
- Pink: `#ec4899`

## Usage Example

```jsx
import Dashboard from './components/Dashboard'

function App() {
  return (
    <div className="app">
      <Header />
      <Dashboard />
    </div>
  )
}
```

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live data
2. **Date Range Picker**: Custom date range selection
3. **Export Functionality**: Download charts as images or CSV
4. **Drill-down Views**: Click on data points for detailed views
5. **Comparison Mode**: Compare different time periods
6. **Custom Alerts**: Set thresholds and receive notifications
7. **Dark Mode**: Theme toggle for better accessibility

## Testing Recommendations

1. **Unit Tests**: Test chart components with various data inputs
2. **Integration Tests**: Test API service calls and error handling
3. **E2E Tests**: Test complete user workflows
4. **Visual Regression Tests**: Ensure charts render correctly

## Performance Considerations

- Charts use SVG for crisp rendering at any scale
- Data fetching includes loading states to prevent UI blocking
- Mock data fallback ensures app remains functional during API issues
- Responsive design reduces unnecessary re-renders

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

