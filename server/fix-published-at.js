const mongoose = require('mongoose');
const Blog = require('./models/Blog');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixPublishedAt() {
  console.log('🔧 Fixing publishedAt field for existing articles...\n');

  try {
    // Find all published articles without publishedAt
    const articles = await Blog.find({
      status: 'published',
      $or: [
        { publishedAt: { $exists: false } },
        { publishedAt: null }
      ]
    });

    console.log(`Found ${articles.length} published articles without publishedAt field`);

    if (articles.length === 0) {
      console.log('✅ All articles already have publishedAt field');
      return;
    }

    // Update each article with publishedAt
    for (const article of articles) {
      console.log(`Updating article: ${article.title}`);
      await Blog.findByIdAndUpdate(article._id, {
        publishedAt: article.createdAt || new Date()
      });
    }

    console.log('✅ Successfully updated all articles with publishedAt field');

    // Verify the fix
    const updatedArticles = await Blog.find({
      status: 'published',
      publishedAt: { $exists: true, $ne: null }
    });

    console.log(`\n📊 Summary:`);
    console.log(`Total published articles: ${updatedArticles.length}`);
    console.log(`Articles with publishedAt: ${updatedArticles.filter(a => a.publishedAt).length}`);

  } catch (error) {
    console.error('❌ Error fixing publishedAt:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the fix
fixPublishedAt();
