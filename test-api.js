// Test script to validate API endpoints
// Run this in the browser console to test API connectivity

const API_BASE_URL = 'https://driven-mobile-mw-dev.fleet.non-prod.fleetcor.com/ai';

async function testEndpoint(endpoint, params = {}) {
  const url = new URL(endpoint, API_BASE_URL);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  
  console.log(`\n🔍 Testing: ${url.toString()}`);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if available
        ...(localStorage.getItem('authToken') && {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        })
      }
    });
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📦 Response data:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testAllEndpoints() {
  console.log('🚀 Starting API Endpoint Tests...');
  console.log('📍 Base URL:', API_BASE_URL);
  
  const results = {
    aiUsageDay: await testEndpoint('/analytics/ai-usage', { groupBy: 'day' }),
    aiUsageWeek: await testEndpoint('/analytics/ai-usage', { groupBy: 'week' }),
    aiUsageMonth: await testEndpoint('/analytics/ai-usage', { groupBy: 'month' }),
    trendsDay: await testEndpoint('/analytics/trends', { groupBy: 'day' }),
    trendsWeek: await testEndpoint('/analytics/trends', { groupBy: 'week' }),
    trendsMonth: await testEndpoint('/analytics/trends', { groupBy: 'month' }),
    intents: await testEndpoint('/analytics/intents'),
    avgResponse: await testEndpoint('/analytics/avg-response'),
  };
  
  console.log('\n📊 Test Summary:');
  console.log('================');
  Object.entries(results).forEach(([name, result]) => {
    console.log(`${result.success ? '✅' : '❌'} ${name}`);
  });
  
  return results;
}

// Run the tests
testAllEndpoints();

