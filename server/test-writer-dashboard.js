const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001/api';
const TEST_EMAIL = 'writer@castingplatform.com';
const TEST_PASSWORD = 'writer123456';

async function testWriterDashboard() {
  console.log('🧪 Testing Writer Dashboard Frontend Requests...\n');

  try {
    // Step 1: Login as writer
    console.log('1. Logging in as writer...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const token = loginResponse.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    console.log('✅ Login successful');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log('');

    // Step 2: Test writer stats (dashboard main request)
    console.log('2. Testing writer stats...');
    const statsResponse = await axios.get(`${BASE_URL}/writer/stats`);
    console.log('✅ Writer stats successful');
    console.log('   Stats:', statsResponse.data);
    console.log('');

    // Step 3: Test recent articles
    console.log('3. Testing recent articles...');
    const recentArticlesResponse = await axios.get(`${BASE_URL}/writer/recent-articles`);
    console.log('✅ Recent articles successful');
    console.log(`   Articles count: ${recentArticlesResponse.data.articles.length}`);
    console.log('');

    // Step 4: Test recent news
    console.log('4. Testing recent news...');
    const recentNewsResponse = await axios.get(`${BASE_URL}/writer/recent-news`);
    console.log('✅ Recent news successful');
    console.log(`   News count: ${recentNewsResponse.data.news.length}`);
    console.log('');

    // Step 5: Test profile (for user info)
    console.log('5. Testing writer profile...');
    const profileResponse = await axios.get(`${BASE_URL}/writer/profile`);
    console.log('✅ Writer profile successful');
    console.log(`   Bio: ${profileResponse.data.bio}`);
    console.log(`   Total Articles: ${profileResponse.data.totalArticles}`);
    console.log('');

    console.log('🎉 All dashboard requests successful!');
    console.log('');
    console.log('📋 Summary:');
    console.log('✅ Writer stats working');
    console.log('✅ Recent articles working');
    console.log('✅ Recent news working');
    console.log('✅ Writer profile working');
    console.log('');
    console.log('🔍 If the frontend is not working, the issue might be:');
    console.log('   1. Authentication token not being sent');
    console.log('   2. CORS issues');
    console.log('   3. Frontend routing issues');
    console.log('   4. Component rendering errors');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testWriterDashboard();
