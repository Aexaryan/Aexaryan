const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001/api';

async function testServerStatus() {
  console.log('🔍 Testing Server Status...\n');

  try {
    // Test basic connectivity
    console.log('1. Testing basic connectivity...');
    const response = await axios.get(`${BASE_URL}/blogs`);
    console.log('✅ Server is responding');
    console.log(`   Status: ${response.status}`);
    console.log(`   Total blogs: ${response.data.blogs?.length || 0}`);
    console.log('');

    // Test auth endpoint
    console.log('2. Testing auth endpoint...');
    try {
      const authResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'writer@castingplatform.com',
        password: 'writer123456'
      });
      console.log('✅ Auth endpoint working');
      console.log(`   Token received: ${authResponse.data.token ? 'Yes' : 'No'}`);
    } catch (authError) {
      console.log('❌ Auth endpoint error:', authError.response?.data?.error || authError.message);
    }

  } catch (error) {
    console.error('❌ Server not responding:', error.message);
  }
}

// Run the test
testServerStatus();
