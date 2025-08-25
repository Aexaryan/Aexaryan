const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001/api';
const WRITER_EMAIL = 'writer@castingplatform.com';
const WRITER_PASSWORD = 'writer123456';

async function testNewsEditing() {
  console.log('🔍 Testing News Editing...\n');

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

    // Step 2: Get writer's news list
    console.log('2. Getting writer\'s news list...');
    const newsListResponse = await axios.get(`${BASE_URL}/writer/news`);
    console.log(`✅ Found ${newsListResponse.data.news.length} news items`);
    
    if (newsListResponse.data.news.length === 0) {
      console.log('❌ No news found to edit');
      return;
    }

    const newsToEdit = newsListResponse.data.news[0];
    console.log(`📝 Will edit: "${newsToEdit.title}" (ID: ${newsToEdit._id})`);
    console.log('');

    // Step 3: Fetch single news for editing
    console.log('3. Fetching single news for editing...');
    const singleNewsResponse = await axios.get(`${BASE_URL}/writer/news/${newsToEdit._id}`);
    console.log('✅ Single news fetch successful');
    console.log(`   Title: ${singleNewsResponse.data.news.title}`);
    console.log(`   Status: ${singleNewsResponse.data.news.status}`);
    console.log(`   Content length: ${singleNewsResponse.data.news.content.length}`);
    console.log('');

    // Step 4: Update the news
    console.log('4. Updating the news...');
    const updateData = {
      title: `${singleNewsResponse.data.news.title} (Updated ${Date.now()})`,
      content: `${singleNewsResponse.data.news.content}\n\nThis content was updated for testing purposes.`,
      excerpt: 'Updated excerpt for testing',
      category: singleNewsResponse.data.news.category,
      tags: 'test, updated, editing',
      isPublished: true,
      isBreaking: false,
      isFeatured: false,
      priority: 'normal'
    };

    const updateResponse = await axios.put(`${BASE_URL}/writer/news/${newsToEdit._id}`, updateData);
    console.log('✅ News update successful');
    console.log(`   New title: ${updateResponse.data.news.title}`);
    console.log(`   Status: ${updateResponse.data.news.status}`);
    console.log(`   PublishedAt: ${updateResponse.data.news.publishedAt}`);
    console.log('');

    // Step 5: Verify the update
    console.log('5. Verifying the update...');
    const verifyResponse = await axios.get(`${BASE_URL}/writer/news/${newsToEdit._id}`);
    console.log('✅ Verification successful');
    console.log(`   Title: ${verifyResponse.data.news.title}`);
    console.log(`   Content length: ${verifyResponse.data.news.content.length}`);
    console.log(`   Tags: ${verifyResponse.data.news.tags.join(', ')}`);

  } catch (error) {
    console.error('❌ Error testing news editing:', error.response?.data || error.message);
  }
}

// Run the test
testNewsEditing();
