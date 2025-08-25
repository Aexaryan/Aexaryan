const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001/api';
const WRITER_EMAIL = 'writer@castingplatform.com';
const WRITER_PASSWORD = 'writer123456';

async function debugNewsCreation() {
  console.log('🔍 Debugging News Creation...\n');

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
    console.log(`   User ID: ${loginResponse.data.user._id}`);
    console.log(`   Role: ${loginResponse.data.user.role}`);
    console.log(`   Writer Profile: ${loginResponse.data.user.writerProfile ? 'Exists' : 'Missing'}`);
    if (loginResponse.data.user.writerProfile) {
      console.log(`   Is Approved Writer: ${loginResponse.data.user.writerProfile.isApprovedWriter}`);
    }
    console.log('');

    // Step 2: Test news creation with minimal data
    console.log('2. Testing news creation with minimal data...');
    const minimalNewsData = {
      title: `Test News ${Date.now()}`,
      content: 'This is a test news content for testing the news creation functionality. It has enough content to meet the minimum requirement.',
      category: 'other'
    };

    try {
      const newsResponse = await axios.post(`${BASE_URL}/writer/news`, minimalNewsData);
      console.log('✅ Minimal news creation successful');
      console.log(`   News ID: ${newsResponse.data.news._id}`);
      console.log(`   Title: ${newsResponse.data.news.title}`);
      console.log(`   Status: ${newsResponse.data.news.status}`);
    } catch (minimalError) {
      console.log('❌ Minimal news creation failed:', minimalError.response?.data?.error || minimalError.message);
    }
    console.log('');

    // Step 3: Test news creation with full data
    console.log('3. Testing news creation with full data...');
    const fullNewsData = {
      title: `Full Test News ${Date.now()}`,
      content: 'This is a comprehensive test news content for testing the news creation functionality. It includes all the necessary fields and has enough content to meet the minimum requirement.',
      excerpt: 'A brief excerpt of the test news.',
      category: 'other',
      tags: 'test, news, writer',
      isPublished: true,
      isBreaking: false,
      isFeatured: false,
      priority: 'normal'
    };

    try {
      const fullNewsResponse = await axios.post(`${BASE_URL}/writer/news`, fullNewsData);
      console.log('✅ Full news creation successful');
      console.log(`   News ID: ${fullNewsResponse.data.news._id}`);
      console.log(`   Title: ${fullNewsResponse.data.news.title}`);
      console.log(`   Status: ${fullNewsResponse.data.news.status}`);
      console.log(`   PublishedAt: ${fullNewsResponse.data.news.publishedAt}`);
    } catch (fullError) {
      console.log('❌ Full news creation failed:', fullError.response?.data?.error || fullError.message);
    }

  } catch (error) {
    console.error('❌ Error in debug:', error.response?.data || error.message);
  }
}

// Run the debug
debugNewsCreation();
