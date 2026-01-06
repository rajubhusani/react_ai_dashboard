# Date Range 30-Day Limit Implementation

## ✅ Changes Made

Added a **30-day maximum limit** for date range selection to prevent performance issues with large data sets.

---

## 🔧 Implementation Details

### 1. **Modified `src/hooks/useDateRange.ts`**

Added validation logic to restrict date range selection to a maximum of 30 days:

#### New Helper Function
```typescript
const getDaysDifference = (startDate: string, endDate: string): number => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}
```

#### Updated `handleDateChange` Function

**When changing START date:**
- If the new start date creates a range > 30 days, the **end date is automatically adjusted** to be 30 days from the start
- If the adjusted end date would be in the future, it's capped at today

**When changing END date:**
- If the new end date creates a range > 30 days, the **start date is automatically adjusted** to be 30 days before the end

**User Feedback:**
- Console warning is logged when the 30-day limit is exceeded
- The date range is automatically adjusted to fit within 30 days

---

## 🎯 User Experience

### Behavior Examples

#### Example 1: Selecting Start Date
```
Current range: 2025-01-01 to 2025-01-15 (15 days) ✅

User selects start date: 2024-12-01
Result: Start = 2024-12-01, End = 2024-12-31 (30 days) ✅
Console: "⚠️ Date range cannot exceed 30 days. Adjusting end date."
```

#### Example 2: Selecting End Date
```
Current range: 2025-01-01 to 2025-01-15 (15 days) ✅

User selects end date: 2025-02-15
Result: Start = 2025-01-16, End = 2025-02-15 (30 days) ✅
Console: "⚠️ Date range cannot exceed 30 days. Adjusting start date."
```

#### Example 3: Within Limit
```
Current range: 2025-01-01 to 2025-01-15 (15 days) ✅

User selects end date: 2025-01-25
Result: Start = 2025-01-01, End = 2025-01-25 (25 days) ✅
No adjustment needed
```

---

## 🖥️ UI Changes

### 2. **Modified `src/components/Header.jsx`**

Added helpful tooltips to the date picker:

```jsx
<div className="date-range-picker" title="Select date range (max 30 days)">
  <input
    type="date"
    value={dateRange.start}
    onChange={(e) => handleDateChange('start', e.target.value)}
    className="date-input"
    max={dateRange.end < today ? dateRange.end : today}
    title="Start date (max 30 days range)"
  />
  <span className="date-separator">to</span>
  <input
    type="date"
    value={dateRange.end}
    onChange={(e) => handleDateChange('end', e.target.value)}
    className="date-input"
    min={dateRange.start}
    max={today}
    title="End date (max 30 days range)"
  />
</div>
```

**Tooltips added:**
- Date picker container: "Select date range (max 30 days)"
- Start date input: "Start date (max 30 days range)"
- End date input: "End date (max 30 days range)"

---

## 🧪 Testing

### Test Cases

1. **✅ Select start date that creates > 30 day range**
   - Expected: End date automatically adjusts to 30 days from start

2. **✅ Select end date that creates > 30 day range**
   - Expected: Start date automatically adjusts to 30 days before end

3. **✅ Select dates within 30 days**
   - Expected: No adjustment, dates are accepted as-is

4. **✅ Select future dates**
   - Expected: Dates are capped at today (existing validation)

5. **✅ Select start date after end date**
   - Expected: End date adjusts to match start date (existing validation)

6. **✅ Select end date before start date**
   - Expected: Start date adjusts to match end date (existing validation)

---

## 📊 Benefits

### Performance
- ✅ Prevents loading excessive amounts of data
- ✅ Faster API responses with smaller date ranges
- ✅ Reduced memory usage in browser
- ✅ Better chart rendering performance

### User Experience
- ✅ Automatic adjustment prevents errors
- ✅ Clear tooltips inform users of the limit
- ✅ Console warnings for debugging
- ✅ Smooth, non-disruptive behavior

---

## 🔍 How to Verify

1. **Open the dashboard** in your browser
2. **Hover over the date picker** - You should see "Select date range (max 30 days)" tooltip
3. **Try to select a date range > 30 days:**
   - Select start date: 2025-01-01
   - Select end date: 2025-03-01 (60 days)
   - **Result:** Start date automatically adjusts to 2025-01-30
4. **Check browser console** - You should see:
   ```
   ⚠️ useDateRange: Date range cannot exceed 30 days. Adjusting start date.
   ```

---

## 📝 Notes

- The 30-day limit is defined as a constant `MAX_DAYS = 30` in the `handleDateChange` function
- To change the limit, modify the `MAX_DAYS` constant in `src/hooks/useDateRange.ts`
- The validation works seamlessly with existing date validations (future dates, start > end, etc.)
- All existing functionality is preserved

---

## 🎉 Summary

**Date range selection is now restricted to a maximum of 30 days** with automatic adjustment and user-friendly tooltips!

