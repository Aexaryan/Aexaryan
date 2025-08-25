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

async function checkBlogAuthors() {
  console.log('🔍 Checking Blog Authors...\n');

  try {
    // Get all blogs without population first
    const allBlogs = await Blog.find({});
    console.log(`📊 Total blogs in database: ${allBlogs.length}`);
    
    // Check raw blog data
    console.log('\n📋 Raw Blog Data:');
    allBlogs.forEach((blog, index) => {
      console.log(`  ${index + 1}. "${blog.title}"`);
      console.log(`     Author ID: ${blog.author}`);
      console.log(`     Status: ${blog.status}`);
      console.log(`     PublishedAt: ${blog.publishedAt}`);
      console.log(`     CreatedAt: ${blog.createdAt}`);
      console.log('');
    });
    
    // Check if author IDs are valid
    console.log('\n🔍 Checking Author IDs...');
    const authorIds = [...new Set(allBlogs.map(blog => blog.author))];
    console.log(`Unique author IDs: ${authorIds.length}`);
    authorIds.forEach((authorId, index) => {
      console.log(`  ${index + 1}. ${authorId}`);
    });
    
    // Check if these author IDs exist in User collection
    console.log('\n🔍 Checking if Author IDs exist in User collection...');
    for (const authorId of authorIds) {
      const user = await User.findById(authorId);
      if (user) {
        console.log(`✅ Author ID ${authorId} exists: ${user.firstName} ${user.lastName} (${user.role})`);
      } else {
        console.log(`❌ Author ID ${authorId} NOT FOUND in User collection`);
      }
    }
    
    // Try population again
    console.log('\n🔍 Testing Population...');
    const populatedBlogs = await Blog.find({}).populate('author', 'firstName lastName role');
    console.log(`Populated blogs: ${populatedBlogs.length}`);
    
    populatedBlogs.forEach((blog, index) => {
      console.log(`  ${index + 1}. "${blog.title}" - Author: ${blog.author ? `${blog.author.firstName} ${blog.author.lastName} (${blog.author.role})` : 'NO AUTHOR'}`);
    });

  } catch (error) {
    console.error('❌ Error checking blog authors:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the check
checkBlogAuthors();
