#!/usr/bin/env node

/**
 * Test script to check if backend endpoints exist
 * Run with: node test-backend-endpoints.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:8081';

function testEndpoint(path) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${path}`;
    console.log(`\n🔍 Testing: ${url}`);
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            const dataArray = json.data || json;
            const count = Array.isArray(dataArray) ? dataArray.length : 'N/A';
            console.log(`✅ SUCCESS - Status: ${res.statusCode}, Records: ${count}`);
            resolve({ success: true, status: res.statusCode, count });
          } catch (e) {
            console.log(`✅ SUCCESS - Status: ${res.statusCode}, Response: ${data.substring(0, 100)}...`);
            resolve({ success: true, status: res.statusCode });
          }
        } else {
          console.log(`❌ FAILED - Status: ${res.statusCode}`);
          resolve({ success: false, status: res.statusCode });
        }
      });
    }).on('error', (err) => {
      console.log(`❌ ERROR - ${err.message}`);
      resolve({ success: false, error: err.message });
    });
  });
}

async function main() {
  console.log('🚀 Testing Backend Endpoints');
  console.log('📍 Base URL:', BASE_URL);
  console.log('=' .repeat(60));
  
  const endpoints = [
    '/analytics/rawAnalytics',
    '/analytics/sessions',
    '/analytics/ai-usage',
    '/analytics/trends',
    '/analytics/intents',
    '/analytics/sentiment',
    '/analytics/users/total',
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    results[endpoint] = await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  
  const working = Object.entries(results).filter(([_, r]) => r.success);
  const failing = Object.entries(results).filter(([_, r]) => !r.success);
  
  console.log(`\n✅ Working Endpoints: ${working.length}/${endpoints.length}`);
  working.forEach(([endpoint, result]) => {
    console.log(`   ${endpoint} - Status: ${result.status}${result.count ? `, Records: ${result.count}` : ''}`);
  });
  
  if (failing.length > 0) {
    console.log(`\n❌ Failing Endpoints: ${failing.length}/${endpoints.length}`);
    failing.forEach(([endpoint, result]) => {
      console.log(`   ${endpoint} - ${result.error || `Status: ${result.status}`}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Check if critical endpoint exists
  if (!results['/analytics/rawAnalytics']?.success) {
    console.log('\n⚠️  CRITICAL: /analytics/rawAnalytics endpoint is missing!');
    console.log('   This endpoint is required for the optimized dashboard.');
    console.log('   Please add this endpoint to your NestJS backend.');
    console.log('\n   Example NestJS implementation:');
    console.log('   ```typescript');
    console.log('   @Get(\'/analytics/rawAnalytics\')');
    console.log('   async getRawAnalytics() {');
    console.log('     return await this.redisService.getAllRawAnalytics();');
    console.log('   }');
    console.log('   ```');
  } else {
    console.log('\n✅ All critical endpoints are working!');
  }
}

main().catch(console.error);

