const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001/api';

async function debugBlogs() {
  console.log('🔍 Debugging Blogs Collection...\n');

  try {
    // Step 1: Get all blogs from the database
    console.log('1. Getting all blogs from database...');
    const allBlogsResponse = await axios.get(`${BASE_URL}/blogs?limit=100`);
    console.log('Total blogs in public list:', allBlogsResponse.data.blogs.length);
    
    // Step 2: Check the most recent blogs
    console.log('\n2. Most recent blogs:');
    allBlogsResponse.data.blogs.slice(0, 5).forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title}`);
      console.log(`   Status: ${blog.status}`);
      console.log(`   Published: ${blog.publishedAt}`);
      console.log(`   Slug: ${blog.slug}`);
      console.log('');
    });

    // Step 3: Get writer's articles
    console.log('3. Getting writer\'s articles...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'writer@castingplatform.com',
      password: 'writer123456'
    });
    
    const token = loginResponse.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    const writerArticlesResponse = await axios.get(`${BASE_URL}/writer/articles`);
    console.log('Total writer articles:', writerArticlesResponse.data.articles.length);
    
    console.log('\n4. Writer\'s articles:');
    writerArticlesResponse.data.articles.slice(0, 5).forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Status: ${article.status}`);
      console.log(`   Published: ${article.publishedAt}`);
      console.log(`   Slug: ${article.slug}`);
      console.log('');
    });

    // Step 5: Check if there's a mismatch
    console.log('5. Checking for mismatches...');
    const writerSlugs = writerArticlesResponse.data.articles.map(a => a.slug);
    const publicSlugs = allBlogsResponse.data.blogs.map(b => b.slug);
    
    const missingInPublic = writerSlugs.filter(slug => !publicSlugs.includes(slug));
    console.log('Articles missing in public list:', missingInPublic.length);
    missingInPublic.forEach(slug => {
      const article = writerArticlesResponse.data.articles.find(a => a.slug === slug);
      console.log(`   - ${article.title} (${article.status}, published: ${article.publishedAt})`);
    });

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

// Run the debug
debugBlogs();
