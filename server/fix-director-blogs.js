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

async function fixDirectorBlogs() {
  console.log('🔧 Fixing Director Blogs...\n');

  try {
    // Find director blogs that are pending
    const directorBlogs = await Blog.find({}).populate('author', 'firstName lastName role');
    const pendingDirectorBlogs = directorBlogs.filter(blog => 
      blog.author?.role === 'casting_director' && blog.status === 'pending'
    );
    
    console.log(`📊 Found ${pendingDirectorBlogs.length} pending director blogs`);
    
    if (pendingDirectorBlogs.length === 0) {
      console.log('✅ No pending director blogs to fix');
      return;
    }
    
    // Show blogs to be fixed
    console.log('\n📋 Pending Director Blogs to Fix:');
    pendingDirectorBlogs.forEach((blog, index) => {
      console.log(`  ${index + 1}. "${blog.title}" by ${blog.author.firstName} ${blog.author.lastName}`);
    });
    
    // Update blogs to published status
    console.log('\n🔧 Updating blogs to published status...');
    for (const blog of pendingDirectorBlogs) {
      const updateData = {
        status: 'published',
        publishedAt: blog.createdAt || new Date()
      };
      
      await Blog.findByIdAndUpdate(blog._id, updateData);
      console.log(`✅ Updated "${blog.title}" to published status`);
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying the fix...');
    const updatedDirectorBlogs = await Blog.find({}).populate('author', 'firstName lastName role');
    const publishedDirectorBlogs = updatedDirectorBlogs.filter(blog => 
      blog.author?.role === 'casting_director' && blog.status === 'published'
    );
    
    console.log(`📊 Published director blogs after fix: ${publishedDirectorBlogs.length}`);
    
    if (publishedDirectorBlogs.length > 0) {
      console.log('\n📋 Published Director Blogs:');
      publishedDirectorBlogs.forEach((blog, index) => {
        console.log(`  ${index + 1}. "${blog.title}" - Published: ${blog.publishedAt}`);
      });
    }
    
    console.log('\n🎉 Director blogs fix completed!');

  } catch (error) {
    console.error('❌ Error fixing director blogs:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the fix
fixDirectorBlogs();
