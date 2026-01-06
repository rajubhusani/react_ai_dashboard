# Mock Data Usage - Product Feedback Widget

## 📊 Overview

The Product Feedback widget is currently configured to use **mock data** instead of calling a real API endpoint. This allows you to see the widget in action immediately without needing backend integration.

---

## 🎯 Mock Data Details

### Location
**File:** `src/mocks/productFeedbackMockData.ts`

### Data Summary
- **Total Entries:** 15 feedback items
- **Date Range:** Nov 10-13, 2025
- **Feedback Types:**
  - 🎉 **Excited (E):** 5 entries (33%)
  - 😊 **Happy (H):** 7 entries (47%)
  - 😔 **Sad (S):** 3 entries (20%)

### Features Included
1. **ADMIN Experience** (User Settings)
   - 4 feedback entries
   - Mix of Happy and Excited
   
2. **Route Planning** (Navigation)
   - 4 feedback entries
   - Mostly Excited and Happy
   
3. **Fleet Analytics** (Reports)
   - 4 feedback entries
   - All positive (Excited and Happy)
   
4. **Fuel Price Comparison** (Fuel Management)
   - 3 feedback entries
   - All Sad (needs attention)

---

## 🔧 How It Works

### Current Implementation

**File:** `src/api/dashboardService.ts` (lines 518-556)

```typescript
getProductFeedback: async (startDate?: string, endDate?: string): Promise<ProcessedFeedbackData> => {
  try {
    // Using mock data for now
    // TODO: Uncomment the API call below when the real endpoint is ready
    
    // const response = await apiClient.get<ProductFeedbackResponse>('/analytics/product-feedback', {
    //   params: {
    //     startDate,
    //     endDate,
    //     pageSize: 500,
    //     pageNumber: 0,
    //   },
    // });

    // Import mock data dynamically
    const { mockProductFeedbackResponse } = await import('../mocks/productFeedbackMockData');
    
    console.log('📊 Product Feedback (MOCK DATA):', mockProductFeedbackResponse);

    // Extract entries from response
    const entries: ProductFeedbackEntry[] = mockProductFeedbackResponse?.body?.content || [];
    console.log('📊 Product Feedback entries count:', entries.length);

    // Process the data client-side
    const processedData = processProductFeedback(entries, startDate, endDate);
    console.log('📊 Processed Product Feedback data:', processedData);

    return processedData;
  } catch (error) {
    console.error('❌ Error fetching product feedback:', error);
    throw error;
  }
}
```

---

## 🔄 Switching to Real API

When your backend endpoint is ready, follow these steps:

### Step 1: Update the API Call

**File:** `src/api/dashboardService.ts` (around line 525)

**Uncomment these lines:**
```typescript
const response = await apiClient.get<ProductFeedbackResponse>('/analytics/product-feedback', {
  params: {
    startDate,
    endDate,
    pageSize: 500,
    pageNumber: 0,
  },
});
```

**Update the endpoint URL** to match your backend:
```typescript
// Example: Change '/analytics/product-feedback' to your actual endpoint
const response = await apiClient.get<ProductFeedbackResponse>('/api/v1/feedback', {
```

### Step 2: Remove Mock Data Import

**Delete or comment out these lines:**
```typescript
// Remove this:
const { mockProductFeedbackResponse } = await import('../mocks/productFeedbackMockData');

// And update this:
const entries: ProductFeedbackEntry[] = response.data?.body?.content || [];
```

### Step 3: Update Console Log

**Change:**
```typescript
console.log('📊 Product Feedback (MOCK DATA):', mockProductFeedbackResponse);
```

**To:**
```typescript
console.log('📊 Product Feedback API Response:', response.data);
```

---

## 📝 Expected API Response Format

Your backend should return data in this format:

```json
{
  "code": "00000",
  "message": "Success",
  "body": {
    "content": [
      {
        "id": 304878,
        "userId": "user@example.com",
        "app": "Corpay Fleet- ver 4.0.0",
        "module": "User Settings",
        "screen": "Product Feedback",
        "feature": "ADMIN Experience",
        "feedbackType": "H",
        "comments": "Great feature!",
        "sysAccountId": "S-566_000FM_3",
        "fleetId": "DB2Z2",
        "dateTime": "2025-11-10T06:29:26.871Z"
      }
    ],
    "totalElements": 15,
    "totalPages": 1,
    "size": 500,
    "number": 0
  }
}
```

### Feedback Type Values
- `"H"` - Happy 😊
- `"E"` - Excited 🎉
- `"S"` - Sad 😔

---

## 🧪 Testing Mock Data

### Console Output

When the widget loads, you should see:
```
📊 Product Feedback (MOCK DATA): {code: "00000", message: "Success", body: {...}}
📊 Product Feedback entries count: 15
📊 Processed Product Feedback data: {summary: {...}, byFeature: [...], trends: [...]}
```

### Widget Display

**Summary View:**
- Total: 15 feedback
- Excited: 5 (33.3%)
- Happy: 7 (46.7%)
- Sad: 3 (20.0%)

**Features View:**
- ADMIN Experience: ✅ Positive (4 feedback)
- Route Planning: ✅ Positive (4 feedback)
- Fleet Analytics: ✅ Positive (4 feedback)
- Fuel Price Comparison: ⚠️ Needs Attention (3 feedback)

---

## 🎨 Customizing Mock Data

To add or modify mock data:

**File:** `src/mocks/productFeedbackMockData.ts`

### Add New Entry

```typescript
{
  id: 304893, // Unique ID
  userId: "user@example.com",
  app: "Corpay Fleet- ver 4.0.0",
  module: "Your Module",
  screen: "Your Screen",
  feature: "Your Feature",
  feedbackType: "H" as FeedbackType, // H, E, or S
  comments: "Your feedback comment",
  sysAccountId: "S-566_000FM_18",
  fleetId: "DB2Z17",
  dateTime: "2025-11-13T15:00:00.000Z" // ISO format
}
```

### Update Total Count

Don't forget to update these fields:
```typescript
totalElements: 16, // Increment
numberOfElements: 16, // Increment
```

---

## ✅ Benefits of Mock Data

1. **Immediate Testing** - See the widget working without backend
2. **Frontend Development** - Develop UI independently
3. **Demo Ready** - Show stakeholders the widget functionality
4. **Type Safety** - Mock data validates TypeScript types
5. **Predictable** - Consistent data for testing

---

## 🎉 Summary

✅ **Mock data is active** - Widget works immediately
✅ **15 realistic entries** - Covers all feedback types
✅ **4 different features** - Shows grouping and sentiment
✅ **2 interactive views** - Summary and By Feature
✅ **Easy to switch** - Simple steps to use real API
✅ **Type-safe** - Full TypeScript support

**The Product Feedback widget is ready to use with mock data! 🚀**

