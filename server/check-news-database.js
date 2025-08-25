const mongoose = require('mongoose');
const News = require('./models/News');
const User = require('./models/User');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkNewsDatabase() {
  console.log('🔍 Checking News Database...\n');

  try {
    // Get all news
    const allNews = await News.find({}).populate('author', 'firstName lastName role');
    console.log(`📊 Total news in database: ${allNews.length}`);
    
    // Check news by author role
    const writerNews = allNews.filter(news => news.author?.role === 'journalist');
    const adminNews = allNews.filter(news => news.author?.role === 'admin');
    
    console.log(`\n✍️  Writer news: ${writerNews.length}`);
    console.log(`👑 Admin news: ${adminNews.length}`);
    
    // Show writer's news details
    if (writerNews.length > 0) {
      console.log('\n📋 Writer\'s News Details:');
      writerNews.forEach((news, index) => {
        console.log(`  ${index + 1}. "${news.title}"`);
        console.log(`     Status: ${news.status}`);
        console.log(`     PublishedAt: ${news.publishedAt}`);
        console.log(`     CreatedAt: ${news.createdAt}`);
        console.log(`     Is Published: ${news.status === 'published'}`);
        console.log(`     Has PublishedAt: ${news.publishedAt ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
    
    // Check for published news without publishedAt
    const publishedNewsWithoutPublishedAt = allNews.filter(news => 
      news.status === 'published' && !news.publishedAt
    );
    
    console.log(`⚠️  Published news without publishedAt: ${publishedNewsWithoutPublishedAt.length}`);
    
    if (publishedNewsWithoutPublishedAt.length > 0) {
      console.log('\n🔧 News that need publishedAt fix:');
      publishedNewsWithoutPublishedAt.forEach((news, index) => {
        console.log(`  ${index + 1}. "${news.title}" by ${news.author?.firstName} ${news.author?.lastName}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking news database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the check
checkNewsDatabase();
