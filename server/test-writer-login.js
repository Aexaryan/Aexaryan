const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001/api';
const TEST_EMAIL = 'writer@castingplatform.com';
const TEST_PASSWORD = 'writer123456';

async function testWriterLogin() {
  console.log('🧪 Testing Writer Login and Dashboard Access...\n');

  try {
    // Step 1: Login as writer
    console.log('1. Logging in as writer...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('✅ Login successful');
    console.log(`   User ID: ${user._id}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log('');

    // Step 2: Test writer profile access
    console.log('2. Testing writer profile access...');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    const profileResponse = await axios.get(`${BASE_URL}/writer/profile`);
    console.log('✅ Writer profile access successful');
    console.log(`   Bio: ${profileResponse.data.bio}`);
    console.log(`   Total Articles: ${profileResponse.data.totalArticles}`);
    console.log(`   Is Approved Writer: ${profileResponse.data.isApprovedWriter}`);
    console.log('');

    // Step 3: Test writer articles access
    console.log('3. Testing writer articles access...');
    const articlesResponse = await axios.get(`${BASE_URL}/writer/articles`);
    console.log('✅ Writer articles access successful');
    console.log(`   Total Articles: ${articlesResponse.data.articles.length}`);
    console.log('');

    // Step 4: Test public blogs access
    console.log('4. Testing public blogs access...');
    const blogsResponse = await axios.get(`${BASE_URL}/blogs`);
    console.log('✅ Public blogs access successful');
    console.log(`   Total Blogs: ${blogsResponse.data.blogs.length}`);
    console.log('');

    console.log('🎉 All writer functionality tests passed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('✅ Writer login working');
    console.log('✅ Writer profile access working');
    console.log('✅ Writer articles access working');
    console.log('✅ Public blogs access working');
    console.log('');
    console.log('🔗 Frontend URLs to test:');
    console.log('   Login: http://localhost:3000/login');
    console.log('   Writer Dashboard: http://localhost:3000/writer/dashboard');
    console.log('   Create Article: http://localhost:3000/writer/articles/create');
    console.log('   My Articles: http://localhost:3000/writer/articles');
    console.log('   Public Blogs: http://localhost:3000/blogs');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testWriterLogin();
