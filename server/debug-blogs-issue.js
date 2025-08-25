const mongoose = require('mongoose');
const Blog = require('./models/Blog');
const User = require('./models/User');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugBlogsIssue() {
  console.log('🔍 Debugging Blogs Issue...\n');

  try {
    // Get all blogs
    const allBlogs = await Blog.find({}).populate('author', 'firstName lastName role');
    console.log(`📊 Total blogs in database: ${allBlogs.length}`);
    
    // Check blogs by author role
    const directorBlogs = allBlogs.filter(blog => blog.author?.role === 'castingDirector');
    const writerBlogs = allBlogs.filter(blog => blog.author?.role === 'journalist');
    const adminBlogs = allBlogs.filter(blog => blog.author?.role === 'admin');
    
    console.log(`\n👨‍💼 Director blogs: ${directorBlogs.length}`);
    console.log(`✍️  Writer blogs: ${writerBlogs.length}`);
    console.log(`👑 Admin blogs: ${adminBlogs.length}`);
    
    // Check published blogs
    const publishedBlogs = allBlogs.filter(blog => blog.status === 'published');
    const publishedDirectorBlogs = directorBlogs.filter(blog => blog.status === 'published');
    const publishedWriterBlogs = writerBlogs.filter(blog => blog.status === 'published');
    
    console.log(`\n📰 Published blogs total: ${publishedBlogs.length}`);
    console.log(`📰 Published director blogs: ${publishedDirectorBlogs.length}`);
    console.log(`📰 Published writer blogs: ${publishedWriterBlogs.length}`);
    
    // Check blogs with publishedAt
    const blogsWithPublishedAt = allBlogs.filter(blog => blog.publishedAt);
    const directorBlogsWithPublishedAt = directorBlogs.filter(blog => blog.publishedAt);
    const writerBlogsWithPublishedAt = writerBlogs.filter(blog => blog.publishedAt);
    
    console.log(`\n📅 Blogs with publishedAt: ${blogsWithPublishedAt.length}`);
    console.log(`📅 Director blogs with publishedAt: ${directorBlogsWithPublishedAt.length}`);
    console.log(`📅 Writer blogs with publishedAt: ${writerBlogsWithPublishedAt.length}`);
    
    // Check featuredImage structure
    const blogsWithStringImage = allBlogs.filter(blog => typeof blog.featuredImage === 'string');
    const blogsWithObjectImage = allBlogs.filter(blog => typeof blog.featuredImage === 'object' && blog.featuredImage !== null);
    const blogsWithNoImage = allBlogs.filter(blog => !blog.featuredImage);
    
    console.log(`\n🖼️  Blogs with string featuredImage: ${blogsWithStringImage.length}`);
    console.log(`🖼️  Blogs with object featuredImage: ${blogsWithObjectImage.length}`);
    console.log(`🖼️  Blogs with no featuredImage: ${blogsWithNoImage.length}`);
    
    // Show sample blogs
    console.log('\n📋 Sample Director Blogs:');
    directorBlogs.slice(0, 3).forEach((blog, index) => {
      console.log(`  ${index + 1}. "${blog.title}" - Status: ${blog.status} - PublishedAt: ${blog.publishedAt} - FeaturedImage: ${typeof blog.featuredImage}`);
    });
    
    console.log('\n📋 Sample Writer Blogs:');
    writerBlogs.slice(0, 3).forEach((blog, index) => {
      console.log(`  ${index + 1}. "${blog.title}" - Status: ${blog.status} - PublishedAt: ${blog.publishedAt} - FeaturedImage: ${typeof blog.featuredImage}`);
    });
    
    // Check for blogs that should appear in public but don't
    const publicBlogs = allBlogs.filter(blog => 
      blog.status === 'published' && 
      blog.publishedAt && 
      blog.publishedAt <= new Date()
    );
    
    console.log(`\n🌐 Blogs that should appear in public: ${publicBlogs.length}`);
    
    // Check for potential issues
    const blogsWithoutPublishedAt = publishedBlogs.filter(blog => !blog.publishedAt);
    const blogsWithFuturePublishedAt = publishedBlogs.filter(blog => blog.publishedAt && blog.publishedAt > new Date());
    
    console.log(`\n⚠️  Published blogs without publishedAt: ${blogsWithoutPublishedAt.length}`);
    console.log(`⚠️  Published blogs with future publishedAt: ${blogsWithFuturePublishedAt.length}`);
    
    if (blogsWithoutPublishedAt.length > 0) {
      console.log('\n🔧 Blogs that need publishedAt fix:');
      blogsWithoutPublishedAt.slice(0, 5).forEach((blog, index) => {
        console.log(`  ${index + 1}. "${blog.title}" by ${blog.author?.firstName} ${blog.author?.lastName} (${blog.author?.role})`);
      });
    }

  } catch (error) {
    console.error('❌ Error debugging blogs:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the debug
debugBlogsIssue();
