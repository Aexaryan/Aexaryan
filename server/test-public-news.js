const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001/api';

async function testPublicNews() {
  console.log('🔍 Testing Public News Endpoint...\n');

  try {
    // Test public news endpoint
    console.log('1. Testing public news endpoint...');
    const newsResponse = await axios.get(`${BASE_URL}/news`);
    console.log('✅ Public news API response successful');
    console.log(`   Total news returned: ${newsResponse.data.news.length}`);
    console.log(`   Total count: ${newsResponse.data.total}`);
    console.log(`   Current page: ${newsResponse.data.currentPage}`);
    console.log(`   Total pages: ${newsResponse.data.totalPages}`);
    console.log('');

    // Show sample news
    console.log('📋 Sample Public News:');
    newsResponse.data.news.slice(0, 5).forEach((news, index) => {
      console.log(`  ${index + 1}. "${news.title}" - Author: ${news.author?.firstName} ${news.author?.lastName} (${news.author?.role}) - Published: ${news.publishedAt}`);
    });
    console.log('');

    // Check for writer's news
    const writerNews = newsResponse.data.news.filter(news => news.author?.role === 'journalist');
    console.log(`📰 Writer's published news: ${writerNews.length}`);
    if (writerNews.length > 0) {
      console.log('📋 Writer\'s News:');
      writerNews.forEach((news, index) => {
        console.log(`  ${index + 1}. "${news.title}" - Published: ${news.publishedAt}`);
      });
    }

  } catch (error) {
    console.error('❌ Error testing public news:', error.response?.data || error.message);
  }
}

// Run the test
testPublicNews();
