/**
 * API Test Script for AI Analytics Endpoints
 * Test the actual API endpoints that the frontend calls
 */

const API_BASE = 'http://localhost:3000/api/analytics';

// You'll need to get a valid JWT token from your login
// For testing, you can get this from browser dev tools after logging in
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testEndpoint(endpoint, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`📡 Endpoint: ${endpoint}`);
  console.log('-'.repeat(50));

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, { headers });
    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ ERROR:', response.status, data.message);
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message);
  }
}

async function runAPITests() {
  console.log('🚀 TESTING AI ANALYTICS API ENDPOINTS');
  console.log('=' .repeat(60));
  console.log('⚠️  IMPORTANT: Replace YOUR_JWT_TOKEN_HERE with actual token!');
  console.log('   Get token from browser dev tools after logging in.');
  console.log('=' .repeat(60));

  // Test 1: Anomaly Detection
  await testEndpoint('/anomalies?days=30', 'Anomaly Detection (30 days)');

  // Test 2: Forecasting
  await testEndpoint('/forecast?days=90', 'Time Series Forecasting (90 days)');

  // Test 3: Combined AI Insights
  await testEndpoint('/ai-insights?days=30', 'Combined AI Insights (30 days)');

  // Test 4: Different time periods
  await testEndpoint('/anomalies?days=7', 'Anomaly Detection (7 days)');
  await testEndpoint('/forecast?days=30', 'Forecasting (30 days)');

  console.log('\n✅ API TESTING COMPLETED!');
  console.log('=' .repeat(60));
  console.log('\n📝 HOW TO GET JWT TOKEN:');
  console.log('1. Open browser and go to http://localhost:5176');
  console.log('2. Login to your account');
  console.log('3. Open Dev Tools (F12) → Application → Local Storage');
  console.log('4. Copy the "authToken" value');
  console.log('5. Replace YOUR_JWT_TOKEN_HERE with that value');
  console.log('6. Run this script again');
}

// Run the tests
runAPITests().catch(console.error);