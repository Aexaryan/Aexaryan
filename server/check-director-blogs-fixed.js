const mongoose = require('mongoose');
const User = require('./models/User');
const Blog = require('./models/Blog');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkDirectorBlogsFixed() {
  console.log('🔍 Checking Director Blogs (Fixed Role Name)...\n');

  try {
    // Get all blogs
    const allBlogs = await Blog.find({}).populate('author', 'firstName lastName role');
    console.log(`📊 Total blogs in database: ${allBlogs.length}`);
    
    // Check blogs by author role (using correct role name)
    const directorBlogs = allBlogs.filter(blog => blog.author?.role === 'CASTING_DIRECTOR');
    const writerBlogs = allBlogs.filter(blog => blog.author?.role === 'JOURNALIST');
    const adminBlogs = allBlogs.filter(blog => blog.author?.role === 'ADMIN');
    const talentBlogs = allBlogs.filter(blog => blog.author?.role === 'TALENT');
    
    console.log(`\n👨‍💼 Director blogs: ${directorBlogs.length}`);
    console.log(`✍️  Writer blogs: ${writerBlogs.length}`);
    console.log(`👑 Admin blogs: ${adminBlogs.length}`);
    console.log(`🎭 Talent blogs: ${talentBlogs.length}`);
    
    // Check published blogs
    const publishedBlogs = allBlogs.filter(blog => blog.status === 'published');
    const publishedDirectorBlogs = directorBlogs.filter(blog => blog.status === 'published');
    const publishedWriterBlogs = writerBlogs.filter(blog => blog.status === 'published');
    const publishedAdminBlogs = adminBlogs.filter(blog => blog.status === 'published');
    
    console.log(`\n📰 Published blogs total: ${publishedBlogs.length}`);
    console.log(`📰 Published director blogs: ${publishedDirectorBlogs.length}`);
    console.log(`📰 Published writer blogs: ${publishedWriterBlogs.length}`);
    console.log(`📰 Published admin blogs: ${publishedAdminBlogs.length}`);
    
    // Show director blogs
    if (directorBlogs.length > 0) {
      console.log('\n📋 Director Blogs:');
      directorBlogs.forEach((blog, index) => {
        console.log(`  ${index + 1}. "${blog.title}" - Status: ${blog.status} - PublishedAt: ${blog.publishedAt} - Author: ${blog.author?.firstName} ${blog.author?.lastName}`);
      });
    } else {
      console.log('\n❌ No director blogs found!');
    }
    
    // Check if director blogs have publishedAt
    const directorBlogsWithPublishedAt = directorBlogs.filter(blog => blog.publishedAt);
    const directorBlogsWithoutPublishedAt = directorBlogs.filter(blog => !blog.publishedAt);
    
    console.log(`\n📅 Director blogs with publishedAt: ${directorBlogsWithPublishedAt.length}`);
    console.log(`📅 Director blogs without publishedAt: ${directorBlogsWithoutPublishedAt.length}`);
    
    if (directorBlogsWithoutPublishedAt.length > 0) {
      console.log('\n🔧 Director blogs that need publishedAt fix:');
      directorBlogsWithoutPublishedAt.forEach((blog, index) => {
        console.log(`  ${index + 1}. "${blog.title}" by ${blog.author?.firstName} ${blog.author?.lastName}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking director blogs:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the check
checkDirectorBlogsFixed();
