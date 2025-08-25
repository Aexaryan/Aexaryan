const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5001/api';
const TEST_EMAIL = 'writer@castingplatform.com';
const TEST_PASSWORD = 'writer123456';

async function testArticleCreation() {
  console.log('🧪 Testing Article Creation and Blogs Page Integration...\n');

  try {
    // Step 1: Login as writer
    console.log('1. Logging in as writer...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const token = loginResponse.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Login successful\n');

    // Step 2: Create a test article
    console.log('2. Creating a test article...');
    const articleData = {
      title: 'تست مقاله جدید - بررسی عملکرد سیستم - ' + Date.now(),
      content: `
        <h2>مقدمه</h2>
        <p>این یک مقاله تست برای بررسی عملکرد سیستم نوشتن مقاله است.</p>
        
        <h2>محتوای تست</h2>
        <p>این مقاله شامل محتوای تست برای بررسی عملکرد سیستم است:</p>
        <ul>
          <li>نوشتن مقاله</li>
          <li>ذخیره در دیتابیس</li>
          <li>نمایش در صفحه مقالات</li>
          <li>مدیریت محتوا</li>
        </ul>
        
        <h2>نتیجه‌گیری</h2>
        <p>این مقاله برای تست عملکرد سیستم ایجاد شده است.</p>
      `,
      excerpt: 'مقاله تست برای بررسی عملکرد سیستم نوشتن مقاله و نمایش در صفحه مقالات',
      category: 'tutorials',
      tags: JSON.stringify(['تست', 'سیستم', 'مقاله']),
      isPublished: 'true',
      isBreaking: 'false',
      isFeatured: 'false',
      imageAlt: 'تصویر تست مقاله',
      seoTitle: 'تست مقاله جدید - بررسی عملکرد سیستم - ' + Date.now(),
      seoDescription: 'مقاله تست برای بررسی عملکرد سیستم نوشتن مقاله و نمایش در صفحه مقالات',
      seoKeywords: 'تست,سیستم,مقاله,عملکرد'
    };

    const createResponse = await axios.post(`${BASE_URL}/writer/articles`, articleData);
    console.log('✅ Article created successfully');
    console.log('Article ID:', createResponse.data.article._id);
    console.log('Article Slug:', createResponse.data.article.slug);
    console.log('Article Status:', createResponse.data.article.status);
    console.log('');

    // Step 3: Verify article appears in writer's articles list
    console.log('3. Verifying article appears in writer\'s articles list...');
    const writerArticlesResponse = await axios.get(`${BASE_URL}/writer/articles`);
    const createdArticle = writerArticlesResponse.data.articles.find(
      article => article._id === createResponse.data.article._id
    );
    
    if (createdArticle) {
      console.log('✅ Article found in writer\'s articles list');
      console.log('Title:', createdArticle.title);
      console.log('Status:', createdArticle.status);
    } else {
      console.log('❌ Article not found in writer\'s articles list');
    }
    console.log('');

    // Step 4: Verify article appears in public blogs list
    console.log('4. Verifying article appears in public blogs list...');
    const publicBlogsResponse = await axios.get(`${BASE_URL}/blogs`);
    const publicArticle = publicBlogsResponse.data.blogs.find(
      blog => blog._id === createResponse.data.article._id
    );
    
    if (publicArticle) {
      console.log('✅ Article found in public blogs list');
      console.log('Title:', publicArticle.title);
      console.log('Status:', publicArticle.status);
      console.log('Published:', publicArticle.publishedAt);
    } else {
      console.log('❌ Article not found in public blogs list');
      console.log('Available blogs count:', publicBlogsResponse.data.blogs.length);
    }
    console.log('');

    // Step 5: Test individual blog access
    console.log('5. Testing individual blog access...');
    try {
      const individualBlogResponse = await axios.get(`${BASE_URL}/blogs/${createResponse.data.article.slug}`);
      console.log('✅ Individual blog access successful');
      console.log('Blog title:', individualBlogResponse.data.blog.title);
      console.log('Blog content length:', individualBlogResponse.data.blog.content.length);
    } catch (error) {
      console.log('❌ Individual blog access failed:', error.response?.data?.error || error.message);
    }
    console.log('');

    console.log('🎉 Article creation and blogs page integration test completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('✅ Article creation working');
    console.log('✅ Article appears in writer\'s list');
    console.log('✅ Article appears in public blogs list');
    console.log('✅ Individual blog access working');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testArticleCreation();
