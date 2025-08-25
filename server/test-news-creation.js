const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001/api';
const WRITER_EMAIL = 'writer@castingplatform.com';
const WRITER_PASSWORD = 'writer123456';

async function testNewsCreation() {
  console.log('🔍 Testing News Creation...\n');

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
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log('');

    // Step 2: Test news creation
    console.log('2. Testing news creation...');
    const newsData = {
      title: `Test News ${Date.now()}`,
      content: 'This is a test news content for testing the news creation functionality.',
      excerpt: 'A brief excerpt of the test news.',
      category: 'general',
      tags: 'test, news, writer',
      isPublished: true,
      isBreaking: false,
      isFeatured: false,
      priority: 'normal'
    };

    const newsResponse = await axios.post(`${BASE_URL}/writer/news`, newsData);
    console.log('✅ News creation successful');
    console.log(`   News ID: ${newsResponse.data.news._id}`);
    console.log(`   Title: ${newsResponse.data.news.title}`);
    console.log(`   Status: ${newsResponse.data.news.status}`);
    console.log('');

    // Step 3: Test getting writer's news
    console.log('3. Testing get writer news...');
    const writerNewsResponse = await axios.get(`${BASE_URL}/writer/news`);
    console.log('✅ Get writer news successful');
    console.log(`   Total news: ${writerNewsResponse.data.news.length}`);
    console.log('');

    // Step 4: Test public news endpoint
    console.log('4. Testing public news endpoint...');
    const publicNewsResponse = await axios.get(`${BASE_URL}/news`);
    console.log('✅ Public news API response successful');
    console.log(`   Total news returned: ${publicNewsResponse.data.news.length}`);
    console.log(`   Total count: ${publicNewsResponse.data.total}`);
    console.log('');

    // Show sample news
    console.log('📋 Sample Public News:');
    publicNewsResponse.data.news.slice(0, 5).forEach((news, index) => {
      console.log(`  ${index + 1}. "${news.title}" - Author: ${news.author?.firstName} ${news.author?.lastName} (${news.author?.role}) - Published: ${news.publishedAt}`);
    });

  } catch (error) {
    console.error('❌ Error testing news creation:', error.response?.data || error.message);
  }
}

// Run the test
testNewsCreation();
