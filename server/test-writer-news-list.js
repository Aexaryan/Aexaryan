const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001/api';
const WRITER_EMAIL = 'writer@castingplatform.com';
const WRITER_PASSWORD = 'writer123456';

async function testWriterNewsList() {
  console.log('🔍 Testing Writer News List...\n');

  try {
    // Step 1: Login as writer
    console.log('1. Logging in as writer...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: WRITER_EMAIL,
      password: WRITER_PASSWORD
    });
    
    const token = loginResponse.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    console.log('✅ Writer login successful');
    console.log('');

    // Step 2: Test writer's news list
    console.log('2. Testing writer\'s news list...');
    const writerNewsResponse = await axios.get(`${BASE_URL}/writer/news`);
    console.log('✅ Writer news list successful');
    console.log(`   Total news: ${writerNewsResponse.data.news.length}`);
    console.log('');

    // Show writer's news
    console.log('📋 Writer\'s News:');
    writerNewsResponse.data.news.forEach((news, index) => {
      console.log(`  ${index + 1}. "${news.title}" - Status: ${news.status} - Created: ${news.createdAt} - Published: ${news.publishedAt || 'Not published'}`);
    });

    // Step 3: Test recent news
    console.log('\n3. Testing recent news...');
    const recentNewsResponse = await axios.get(`${BASE_URL}/writer/recent-news`);
    console.log('✅ Recent news successful');
    console.log(`   Recent news count: ${recentNewsResponse.data.news.length}`);

  } catch (error) {
    console.error('❌ Error testing writer news list:', error.response?.data || error.message);
  }
}

// Run the test
testWriterNewsList();
