# Refactoring Guide - Industry Best Practices

## 🎯 What Was Done

### 1. Created Constants Layer (`src/constants/`)

**Purpose**: Centralize all magic strings, colors, and configuration values

**Files Created**:
- `colors.js` - All color constants
- `strings.js` - All string literals
- `config.js` - All configuration values
- `index.js` - Central export point

**Benefits**:
- ✅ Single source of truth
- ✅ Easy to update across entire app
- ✅ Prevents typos and inconsistencies
- ✅ Better IDE autocomplete

### 2. Created Utils Layer (`src/utils/`)

**Purpose**: Reusable utility functions for common operations

**Files Created**:
- `dateUtils.js` - Date manipulation and validation
- `formatUtils.js` - Number, text, and data formatting
- `storageUtils.js` - LocalStorage operations
- `logUtils.js` - Consistent logging
- `index.js` - Central export point

**Benefits**:
- ✅ DRY (Don't Repeat Yourself)
- ✅ Easy to test
- ✅ Consistent behavior across app
- ✅ Reusable across components

### 3. Created Hooks Layer (`src/hooks/`)

**Purpose**: Reusable React hooks for common patterns

**Files Created**:
- `useDateRange.js` - Date range state management
- `useDateRangeListener.js` - Listen to date range changes
- `useFetchData.js` - Generic data fetching
- `index.js` - Central export point

**Benefits**:
- ✅ Encapsulate complex logic
- ✅ Reusable across components
- ✅ Easier to test
- ✅ Cleaner component code

### 4. Refactored Components

**Completed**:
- ✅ `AIUsage.jsx` - Uses hooks, utils, and constants
- ✅ `Header.jsx` - Uses hooks, utils, and constants

**Pending** (Follow same pattern):
- ⏳ `Intents.jsx`
- ⏳ `SentimentAnalysis.jsx`
- ⏳ `Trends.jsx`
- ⏳ `UserTrends.jsx`
- ⏳ `SessionDuration.jsx`
- ⏳ `SessionsByFlavor.jsx`
- ⏳ `SessionsMap.jsx`

## 📚 How to Use

### Using Constants

**Before**:
```javascript
const colors = ['#3b82f6', '#10b981', '#f59e0b']
const title = 'AI Usage Analytics'
```

**After**:
```javascript
import { CHART_COLOR_PALETTE, WIDGET_TITLES } from '../constants'

const colors = CHART_COLOR_PALETTE
const title = WIDGET_TITLES.AI_USAGE
```

### Using Utilities

**Before**:
```javascript
const formatted = value.toLocaleString()
const duration = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds/60)}m ${seconds%60}s`
```

**After**:
```javascript
import { formatNumber, formatDuration } from '../utils'

const formatted = formatNumber(value)
const duration = formatDuration(seconds)
```

### Using Hooks

**Before**:
```javascript
const [dateRange, setDateRange] = useState(() => {
  const saved = localStorage.getItem('dateRange')
  return saved ? JSON.parse(saved) : null
})

useEffect(() => {
  const handleDateRangeChange = (event) => {
    setDateRange(event.detail)
  }
  window.addEventListener('dateRangeChange', handleDateRangeChange)
  return () => window.removeEventListener('dateRangeChange', handleDateRangeChange)
}, [])
```

**After**:
```javascript
import { useDateRangeListener } from '../hooks'

const dateRange = useDateRangeListener('ComponentName')
```

## 🔧 Refactoring Checklist

When refactoring a component, follow these steps:

### Step 1: Import Constants
```javascript
import { 
  WIDGET_TITLES,
  LOADING_MESSAGES,
  CHART_COLORS,
  CHART_COLOR_PALETTE,
  CHART_CONFIG 
} from '../constants'
```

### Step 2: Import Utilities
```javascript
import { 
  formatNumber,
  formatPercentage,
  formatDuration,
  logSuccess,
  logError,
  logFetch 
} from '../utils'
```

### Step 3: Import Hooks
```javascript
import { useDateRangeListener } from '../hooks'
```

### Step 4: Replace Hardcoded Values
- Replace color strings with `CHART_COLORS.*`
- Replace title strings with `WIDGET_TITLES.*`
- Replace label strings with `METRIC_LABELS.*`

### Step 5: Replace Utility Logic
- Replace `toLocaleString()` with `formatNumber()`
- Replace duration logic with `formatDuration()`
- Replace console.log with `logSuccess()`, `logError()`, etc.

### Step 6: Replace State Management
- Replace date range state with `useDateRangeListener()`
- Replace localStorage logic with storage utils

### Step 7: Add Component Name Constant
```javascript
const COMPONENT_NAME = 'ComponentName'
```

## 📖 Examples

### Example 1: Refactoring Color Usage

**Before**:
```javascript
const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

<div style={{ backgroundColor: '#3b82f6' }}>
```

**After**:
```javascript
import { CHART_COLOR_PALETTE, CHART_COLORS } from '../constants'

const colors = CHART_COLOR_PALETTE

<div style={{ backgroundColor: CHART_COLORS.PRIMARY }}>
```

### Example 2: Refactoring Logging

**Before**:
```javascript
console.log('✅ Component: Successfully fetched data')
console.error('❌ Component: Failed to fetch data:', error)
console.warn('⚠️ Component: Invalid data')
```

**After**:
```javascript
import { logSuccess, logError, logWarning } from '../utils'

logSuccess('Component', 'Successfully fetched data')
logError('Component', 'Failed to fetch data', error)
logWarning('Component', 'Invalid data')
```

### Example 3: Refactoring Formatting

**Before**:
```javascript
<div>{value.toLocaleString()}</div>
<div>{(percentage).toFixed(1)}%</div>
<div>{seconds < 60 ? `${seconds}s` : `${Math.floor(seconds/60)}m`}</div>
```

**After**:
```javascript
import { formatNumber, formatPercentage, formatDuration } from '../utils'

<div>{formatNumber(value)}</div>
<div>{formatPercentage(percentage)}</div>
<div>{formatDuration(seconds)}</div>
```

## 🎨 Code Style Guidelines

### 1. Component Structure
```javascript
// 1. Imports
import React, { useState } from 'react'
import { useDateRangeListener } from '../hooks'
import { formatNumber } from '../utils'
import { WIDGET_TITLES, CHART_COLORS } from '../constants'
import './Component.css'

// 2. Constants
const COMPONENT_NAME = 'ComponentName'
const METRICS = [...]

// 3. Component
const ComponentName = () => {
  // 4. Hooks
  const dateRange = useDateRangeListener(COMPONENT_NAME)
  const [state, setState] = useState(null)
  
  // 5. Functions
  const handleClick = () => {}
  
  // 6. Effects
  useEffect(() => {}, [])
  
  // 7. Render
  return (...)
}

// 8. Export
export default ComponentName
```

### 2. Naming Conventions
- **Constants**: `UPPER_SNAKE_CASE`
- **Functions**: `camelCase`
- **Components**: `PascalCase`
- **Files**: `PascalCase.jsx` for components, `camelCase.js` for utilities

### 3. Import Order
1. React and third-party libraries
2. Custom hooks
3. Utilities
4. Constants
5. Components
6. Styles

## ✅ Benefits Summary

### Maintainability
- Single source of truth for all constants
- Easy to update colors, strings, config
- Consistent code structure

### Reusability
- Utility functions used across components
- Custom hooks reduce duplication
- Centralized logic

### Readability
- Self-documenting code
- Clear separation of concerns
- Consistent patterns

### Testability
- Pure functions easy to test
- Hooks testable independently
- Mocked dependencies easier

### Performance
- Reduced code duplication
- Optimized re-renders
- Efficient state management

## 🚀 Next Steps

1. **Refactor remaining components** using the checklist above
2. **Add PropTypes or TypeScript** for type safety
3. **Write unit tests** for utils and hooks
4. **Add JSDoc comments** to all functions
5. **Implement error boundaries** for better error handling
6. **Add performance monitoring** with React DevTools
7. **Implement code splitting** for better load times

## 📝 Notes

- All refactored code is backward compatible
- No breaking changes to existing functionality
- Can be adopted incrementally
- Follows React best practices
- Follows JavaScript/ES6+ standards

