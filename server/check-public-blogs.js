const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001/api';

async function checkPublicBlogs() {
  console.log('🔍 Checking Public Blogs API...\n');

  try {
    // Test public blogs endpoint
    console.log('1. Testing public blogs endpoint...');
    const blogsResponse = await axios.get(`${BASE_URL}/blogs`);
    console.log('✅ Public blogs API response successful');
    console.log(`   Total blogs returned: ${blogsResponse.data.blogs.length}`);
    console.log(`   Total count: ${blogsResponse.data.total}`);
    console.log(`   Current page: ${blogsResponse.data.currentPage}`);
    console.log(`   Total pages: ${blogsResponse.data.totalPages}`);
    console.log('');

    // Show sample blogs
    console.log('📋 Sample Public Blogs:');
    blogsResponse.data.blogs.slice(0, 5).forEach((blog, index) => {
      console.log(`  ${index + 1}. "${blog.title}" - Author: ${blog.author?.firstName} ${blog.author?.lastName} (${blog.author?.role}) - Published: ${blog.publishedAt}`);
    });
    console.log('');

    // Test admin blogs endpoint
    console.log('2. Testing admin blogs endpoint...');
    const adminBlogsResponse = await axios.get(`${BASE_URL}/admin/blogs`);
    console.log('✅ Admin blogs API response successful');
    console.log(`   Total blogs returned: ${adminBlogsResponse.data.blogs.length}`);
    console.log(`   Total count: ${adminBlogsResponse.data.total}`);
    console.log('');

    // Show sample admin blogs
    console.log('📋 Sample Admin Blogs:');
    adminBlogsResponse.data.blogs.slice(0, 5).forEach((blog, index) => {
      console.log(`  ${index + 1}. "${blog.title}" - Author: ${blog.author?.firstName} ${blog.author?.lastName} (${blog.author?.role}) - Status: ${blog.status}`);
    });

  } catch (error) {
    console.error('❌ Error checking public blogs:', error.response?.data || error.message);
  }
}

// Run the check
checkPublicBlogs();
