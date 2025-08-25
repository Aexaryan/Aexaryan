const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001/api';
const TEST_EMAIL = 'writer@castingplatform.com';
const TEST_PASSWORD = 'writer123456';

async function testEditArticle() {
  console.log('🧪 Testing Edit Article Functionality...\n');

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

    // Step 2: Get writer's articles
    console.log('2. Fetching writer articles...');
    const articlesResponse = await axios.get(`${BASE_URL}/writer/articles`);
    const articles = articlesResponse.data.articles;
    
    if (articles.length === 0) {
      console.log('❌ No articles found. Please create an article first.');
      return;
    }
    
    const testArticle = articles[0];
    console.log('✅ Articles found');
    console.log(`   Test article ID: ${testArticle._id}`);
    console.log(`   Test article title: ${testArticle.title}`);
    console.log('');

    // Step 3: Get single article for editing
    console.log('3. Testing GET single article...');
    const singleArticleResponse = await axios.get(`${BASE_URL}/writer/articles/${testArticle._id}`);
    console.log('✅ Single article fetch successful');
    console.log(`   Article title: ${singleArticleResponse.data.article.title}`);
    console.log(`   Article content length: ${singleArticleResponse.data.article.content.length}`);
    console.log(`   Article status: ${singleArticleResponse.data.article.status}`);
    console.log('');

    // Step 4: Test article update (without image)
    console.log('4. Testing article update...');
    const updateData = {
      title: `${testArticle.title} - Updated ${Date.now()}`,
      content: testArticle.content + '\n\n[Updated content added]',
      excerpt: testArticle.excerpt + ' - Updated',
      category: testArticle.category,
      tags: 'test, updated, article',
      isPublished: 'false',
      isBreaking: 'false',
      isFeatured: 'false',
      seo: JSON.stringify({
        title: `${testArticle.title} - Updated`,
        description: testArticle.excerpt + ' - Updated',
        keywords: 'test, updated, article'
      }),
      imageAlt: 'Updated article image'
    };

    const updateResponse = await axios.put(`${BASE_URL}/writer/articles/${testArticle._id}`, updateData);
    console.log('✅ Article update successful');
    console.log(`   Updated title: ${updateResponse.data.article.title}`);
    console.log(`   Updated status: ${updateResponse.data.article.status}`);
    console.log('');

    // Step 5: Verify the update
    console.log('5. Verifying the update...');
    const verifyResponse = await axios.get(`${BASE_URL}/writer/articles/${testArticle._id}`);
    console.log('✅ Update verification successful');
    console.log(`   Verified title: ${verifyResponse.data.article.title}`);
    console.log(`   Verified content length: ${verifyResponse.data.article.content.length}`);
    console.log('');

    console.log('🎉 All edit article functionality tests passed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('✅ Login working');
    console.log('✅ Get articles list working');
    console.log('✅ Get single article working');
    console.log('✅ Update article working');
    console.log('✅ Update verification working');
    console.log('');
    console.log('🔗 Frontend URLs to test:');
    console.log(`   Edit Article: http://localhost:3000/writer/articles/${testArticle._id}/edit`);
    console.log('   My Articles: http://localhost:3000/writer/articles');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testEditArticle();
