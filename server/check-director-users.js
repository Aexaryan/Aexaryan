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

async function checkDirectorUsers() {
  console.log('🔍 Checking Director Users and Their Blogs...\n');

  try {
    // Get all users
    const allUsers = await User.find({});
    console.log(`📊 Total users in database: ${allUsers.length}`);
    
    // Check users by role
    const directorUsers = allUsers.filter(user => user.role === 'castingDirector');
    const writerUsers = allUsers.filter(user => user.role === 'journalist');
    const adminUsers = allUsers.filter(user => user.role === 'admin');
    
    console.log(`\n👨‍💼 Director users: ${directorUsers.length}`);
    console.log(`✍️  Writer users: ${writerUsers.length}`);
    console.log(`👑 Admin users: ${adminUsers.length}`);
    
    // Show director users
    if (directorUsers.length > 0) {
      console.log('\n📋 Director Users:');
      directorUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Created: ${user.createdAt}`);
      });
    } else {
      console.log('\n❌ No director users found!');
    }
    
    // Check blogs for each director user
    if (directorUsers.length > 0) {
      console.log('\n📝 Checking blogs for director users...');
      for (const director of directorUsers) {
        const directorBlogs = await Blog.find({ author: director._id });
        console.log(`  ${director.firstName} ${director.lastName}: ${directorBlogs.length} blogs`);
        
        if (directorBlogs.length > 0) {
          directorBlogs.forEach((blog, index) => {
            console.log(`    ${index + 1}. "${blog.title}" - Status: ${blog.status} - Created: ${blog.createdAt}`);
          });
        }
      }
    }
    
    // Check if there are any blogs with missing authors
    const blogsWithoutAuthor = await Blog.find({ author: { $exists: false } });
    const blogsWithInvalidAuthor = await Blog.find({ author: null });
    
    console.log(`\n⚠️  Blogs without author field: ${blogsWithoutAuthor.length}`);
    console.log(`⚠️  Blogs with null author: ${blogsWithInvalidAuthor.length}`);
    
    if (blogsWithoutAuthor.length > 0) {
      console.log('\n🔧 Blogs without author:');
      blogsWithoutAuthor.forEach((blog, index) => {
        console.log(`  ${index + 1}. "${blog.title}" - Status: ${blog.status}`);
      });
    }
    
    if (blogsWithInvalidAuthor.length > 0) {
      console.log('\n🔧 Blogs with null author:');
      blogsWithInvalidAuthor.forEach((blog, index) => {
        console.log(`  ${index + 1}. "${blog.title}" - Status: ${blog.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking director users:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the check
checkDirectorUsers();
