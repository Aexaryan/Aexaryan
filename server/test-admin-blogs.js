const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001/api';
const ADMIN_EMAIL = 'admin@castingplatform.com';
const ADMIN_PASSWORD = 'admin123456';

async function testAdminBlogs() {
  console.log('🔍 Testing Admin Blogs Endpoint...\n');

  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const token = loginResponse.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    console.log('✅ Admin login successful');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log('');

    // Step 2: Test admin blogs endpoint
    console.log('2. Testing admin blogs endpoint...');
    const adminBlogsResponse = await axios.get(`${BASE_URL}/admin/blogs`);
    console.log('✅ Admin blogs API response successful');
    console.log(`   Total blogs returned: ${adminBlogsResponse.data.blogs.length}`);
    console.log(`   Total count: ${adminBlogsResponse.data.total}`);
    console.log('');

    // Show sample admin blogs
    console.log('📋 Sample Admin Panel Blogs:');
    adminBlogsResponse.data.blogs.slice(0, 10).forEach((blog, index) => {
      console.log(`  ${index + 1}. "${blog.title}" - Author: ${blog.author?.firstName} ${blog.author?.lastName} (${blog.author?.role}) - Status: ${blog.status}`);
    });

  } catch (error) {
    console.error('❌ Error testing admin blogs:', error.response?.data || error.message);
  }
}

// Run the test
testAdminBlogs();
