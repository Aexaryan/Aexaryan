const mongoose = require('mongoose');
const Blog = require('./models/Blog');

// Load environment variables
require('dotenv').config();

// Try different connection methods
async function tryConnection(uri) {
  try {
    console.log(`Trying to connect to: ${uri}`);
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return true;
  } catch (error) {
    console.log(`Failed to connect to ${uri}:`, error.message);
    return false;
  }
}

async function checkDatabase() {
  console.log('🔍 Checking Database Directly...\n');

  try {
    // Use the MONGODB_URI from .env file
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('❌ MONGODB_URI not found in environment variables');
      return;
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');



    // Get all blogs
    const allBlogs = await Blog.find({}).lean();
    console.log(`Total blogs in database: ${allBlogs.length}`);

    if (allBlogs.length > 0) {
      console.log('\nFirst few blogs:');
      allBlogs.slice(0, 3).forEach((blog, index) => {
        console.log(`${index + 1}. ${blog.title}`);
        console.log(`   Status: ${blog.status}`);
        console.log(`   PublishedAt: ${blog.publishedAt}`);
        console.log(`   CreatedAt: ${blog.createdAt}`);
      });
    }

    // Check writer's articles specifically
    const writerArticles = await Blog.find({
      title: { $regex: 'تست مقاله جدید' }
    }).lean();

    console.log(`\nWriter's test articles: ${writerArticles.length}`);
    
    writerArticles.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`   ID: ${article._id}`);
      console.log(`   Status: ${article.status}`);
      console.log(`   PublishedAt: ${article.publishedAt}`);
      console.log(`   CreatedAt: ${article.createdAt}`);
      console.log(`   UpdatedAt: ${article.updatedAt}`);
      console.log(`   Slug: ${article.slug}`);
      console.log(`   Author: ${article.author}`);
    });

    // Check if any published articles are missing publishedAt
    const publishedWithoutDate = await Blog.find({
      status: 'published',
      $or: [
        { publishedAt: { $exists: false } },
        { publishedAt: null }
      ]
    }).lean();

    console.log(`\nPublished articles without publishedAt: ${publishedWithoutDate.length}`);
    
    if (publishedWithoutDate.length > 0) {
      console.log('\nThese articles need publishedAt:');
      publishedWithoutDate.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title} (${article._id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the check
checkDatabase();
